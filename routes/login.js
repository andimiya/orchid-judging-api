// const express = require('express');
// const router = express.Router();
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcrypt');
// const db = require('../db');
//
// passport.use(new LocalStrategy(
//   function(user, password, done) {
//     const cryptoQuery = 'SELECT * FROM Users WHERE email = $1';
//     const values = [ user ];
//     db.query(cryptoQuery, values, (err, result) => {
//       let user = result.rows[0];
//       if (user === null) {
//         return done(null, false, { message: 'Username null' });
//       } else {
//         bcrypt.compare(password, user.password)
//           .then(res => {
//             if (res) {
//               return done (null, user);
//             } else {
//               return done (null, false, { error: 'invalid password' });
//             }
//           })
//           .catch ((err) => {
//             console.log(err, 'error');
//             res.send({ error: err })
//           })
//         }
//     });
//   }
// ));
//
// passport.serializeUser((user, done) => {
//   console.log(user, 'user serialize');
//   return done(null, user);
// });
//
// passport.deserializeUser((user, done) => {
//   console.log(user, 'user deserialize');
//   return done(null, user);
// });
//
// router.post('/login', passport.authenticate('local', { session: false }),
// function(req, res) {
//   res.json(req.user);
// });
//
// module.exports = router;
