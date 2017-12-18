const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');


passport.use(new LocalStrategy(
  (username, password, done) => {
    const cryptoQuery = 'SELECT * FROM Users WHERE first_name = $1';
    const values = [ username ];

    db.query(cryptoQuery, values, (err, result) => {
      let user = result.rows[0];
      if (user === null) {
        return done(null, false, { message: 'Username null' });
      } else {
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
    });
  }
));

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  return done(null, user);
});

router.post('/login', (req, res, next) => {
  req.user = req.body.user;
  let user = req.user;
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.json({ message: err })
    }
    if (!user) {
      return res.json({ message: 'Username required' })
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return console.log('done!!');
    });
  })(req, res, next);
});

module.exports = router;
