const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');


passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log(username, 'username');
    const cryptoQuery = 'SELECT * FROM Users WHERE first_name = $1';
    const values = [ username ];

    db.query(cryptoQuery, values, (err, result) => {
      let user = result.rows[0];
      if (user === null) {
        return done(null, false, { message: 'Username null' });
      } else {
        bcrypt.compare(password, user.password)
          .then(res => {
            if(res){
              return done(null, user);
            }
            else {
              console.log('invalid password');
              return done(null, false, { message: 'invalid password'});
            }
          });
        }
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('serialize');
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('deserialize');
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
