const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const db = require('./db');

app.use(express.static("public"));

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM Users', (err, result) => {
    res.send('send');
  });
});

app.get('/api/crypto-types', (req, res) => {
  const cryptoQuery = 'SELECT * FROM Crypto_Types WHERE user_id = $1';
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  const values = [ user_id ];
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      console.log(err, 'err');
      return res.status(500).json({ error: err.message });
    }
    else {
      console.log(result, 'result');
      res.json({ data: result.rows });
    }

  });
});

app.get('/api/crypto-types/transactions', (req, res) => {
  const cryptoQuery = 'SELECT crypto_types.id AS crypto_type_id, transactions.id AS transaction_id, usd_invested, coin_purchased, exchange_rate, updated_at FROM crypto_types LEFT OUTER JOIN transactions ON crypto_types.id = transactions.crypto_id WHERE user_id = $1';
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

app.get('/api/crypto-types/sums', (req, res) => {
  const cryptoQuery = 'SELECT crypto_id, SUM(usd_invested) AS usd_invested, SUM(coin_purchased) AS coin_purchased FROM Transactions GROUP BY crypto_id';
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

app.post('/api/users', (req, res) => {
  const insertQuery = 'INSERT INTO Users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING id, email';
  const { first_name, last_name, email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required'})
  }
  const values = [first_name, last_name, email];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows });
  });
});

app.post('/api/crypto-types', (req, res) => {
  const insertQuery = 'INSERT INTO Crypto_Types (user_id, symbol, name) VALUES ($1, $2, $3) RETURNING user_id, symbol';
  const { user_id, symbol, name } = req.body;
  if (!user_id || !symbol) {
    return res.status(400).json({ error: 'User ID and crypto symbol required'})
  }
  const values = [user_id, symbol, name];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows });
  });
});

app.post('/api/transactions', (req, res) => {
  const insertQuery = 'INSERT INTO Transactions (crypto_id, usd_invested, coin_purchased, exchange_rate, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, usd_invested';
  const { crypto_id, usd_invested, coin_purchased, exchange_rate } = req.body;
  if (!crypto_id || !usd_invested || !coin_purchased || !exchange_rate) {
    return res.status(400).json({ error: 'Entries required'})
  }
  const values = [crypto_id, usd_invested, coin_purchased, exchange_rate];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows });
  });
});

app.listen(PORT, function() {
  console.log('Server started on', PORT);
})

module.exports = app;
