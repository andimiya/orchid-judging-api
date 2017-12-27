const express = require('express');
const session = require('express-session');
const app = express();
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 8080;
const db = require('./db');

const request = require('request');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const auth = require('passport-local-authenticate');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const isAuth = require('./lib/isAuth');
const login = require('./routes/login');

const sess = {
  secret: 'keyboard_cat'
};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
  store: new redisStore(),
  secret: sess.secret,
  resave: false,
  saveUnintialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use('/api', login);

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM Users', (err, result) => {
    res.json({ data: result.rows });
  });
});

app.get('/api/currencies', (req, res) => {
  db.query('SELECT * FROM crypto_types', (err, result) => {
    res.json({ data: result.rows });
  });
});

app.get('/api/coinmarket', (req, res) => {
  request(`https://api.coinmarketcap.com/v1/ticker/`, function (error, response, body) {
    res.json(JSON.parse(body));
  });
});

app.get('/api/crypto-types', (req, res) => {
  const cryptoQuery = 'SELECT DISTINCT crypto_types.name, crypto_types.symbol FROM transactions INNER JOIN crypto_types ON transactions.crypto_type_id = crypto_types.id WHERE user_id = $1';
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  const values = [ user_id ];
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    else {
      res.json({ data: result.rows });
    }
  });
});

app.get('/api/transactions', isAuth, (req, res) => {
  const cryptoQuery = 'SELECT crypto_types.id AS crypto_name, transactions.id AS transaction_id, usd_invested, coin_purchased, exchange_rate, updated_at, crypto_types.name FROM crypto_types LEFT OUTER JOIN transactions ON crypto_types.id = transactions.crypto_type_id WHERE user_id = $1';
  const { user_id } = req.query;
  const values = [ user_id ];

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: result.rows });
  });
});

app.get('/api/crypto-types/sums', (req, res) => {
  const cryptoQuery = 'SELECT crypto_types.name, SUM(usd_invested) AS usd_invested, SUM(coin_purchased) AS coin_purchased FROM Transactions INNER JOIN crypto_types ON transactions.crypto_type_id = crypto_types.id GROUP BY crypto_types.name';
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  db.query(cryptoQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: result.rows });
  });
});

app.post('/api/new-user', (req, res) => {
  const insertQuery = 'INSERT INTO Users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, email, password';
  const { first_name, last_name, email } = req.body;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (!email) {
        return res.status(400).json({ error: 'Email required'})
      }
      const values = [first_name, last_name, email, hash];
      db.query(insertQuery, values, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ data: result.rows, status: 200 });
      });
    });
  });
});

app.post('/api/transactions', (req, res) => {
  const insertQuery = 'INSERT INTO Transactions (crypto_type_id, user_id, usd_invested, coin_purchased, exchange_rate, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, usd_invested';
  const { crypto_id, user_id, usd_invested, coin_purchased, exchange_rate } = req.body;
  if (!crypto_id || !user_id || !usd_invested || !coin_purchased || !exchange_rate) {
    return res.status(400).json({ error: 'Entries required'})
  }
  const values = [crypto_id, user_id, usd_invested, coin_purchased, exchange_rate];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows, status: 200 });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const deleteQuery = 'DELETE FROM Transactions WHERE id = $1';
  const { id } = req.params;
  const values = [id];
  if (!id) {
    return res.status(400).json({ error: 'Transaction ID required' });
  }
  db.query(deleteQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: 'Successfully deleted transaction', status: 200 });
  });
});

passport.use(new LocalStrategy(
  function(user, password, done) {
    const cryptoQuery = 'SELECT * FROM Users WHERE email = $1';
    const values = [ user ];
    db.query(cryptoQuery, values, (err, result) => {
      let user = result.rows[0];
      let username = user;
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect Username' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect Password' });
      }
      else {
        bcrypt.compare(password, user.password)
          .then(res => {
            if (res) {
              return done (null, user);
            } else {
              return done (null, false, { error: 'invalid password' });
            }
          })
          .catch ((err) => {
            console.log(err, 'error');
            res.send({ error: err })
          })
        }
      return done(null, user);
    });
  })
);

passport.serializeUser((user, done) => {
  console.log(user, 'user serialize');
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log(user, 'user deserialize');
  return done(null, user);
});

app.post('/api/login', passport.authenticate('local',
  function(req, res) {
    console.log(req, 'req user');
    res.json({ currentUser: req.user });
  }
));

app.listen(PORT, function() {
  console.log('Server started on', PORT);
})

module.exports = app;
