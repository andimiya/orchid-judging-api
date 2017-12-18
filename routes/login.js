const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');

passport.use(new LocalStrategy(
  (username, password, done) => {
    db.query('SELECT * FROM Users WHERE ID=1', (err, result) => {
      let user = result.rows[0];
      if (user === null) {
        return done(null, false, { message: 'Bad username' });
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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log(user, 'user');
    if (err) {
      console.log(err, 'user authenticate');
      return res.json({ message: err })
    }
    if (!user) {
      return res.json({ message: 'Username required' })
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      console.log(user, 'user in router post');
    });
  })(req, res, next);
});

module.exports = router;
