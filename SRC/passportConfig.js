const express = require('express');
const app = express();
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");

// Middleware function to check if user is authenticated.
// function isAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     } else {
//         res.redirect('/login');
//     }
// }

function initPassport() {

    dotenv.config();

    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    // Configure the local strategy for use by Passport.
    passport.use(new LocalStrategy(
        function (username, password, done) {
            connection.query('SELECT * FROM User WHERE Id = ?', [username], function (error, results, fields) {
                if (error) return done(error);

                // If no user found with the entered username
                if (results.length === 0) {
                    return done(null, false, { message: 'No user found with the entered username' });
                } else {
                    const user = results[0];

                    // Compare entered password with stored hashed password
                    bcrypt.compare(password, user.AccountPassword, function (err, result) {
                        if (err) return done(err);

                        if (result) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Invalid password' });
                        }
                    });
                }
            });
        }
    ));

    // Serialize the user object to the session.
    passport.serializeUser(function (user, done) {
        done(null, user.Id);
    });

    // Deserialize the user object from the session.
    passport.deserializeUser(function (id, done) {
        connection.query('SELECT * FROM User WHERE Id = ?', [id], function (error, results, fields) {
            if (error) return done(error);

            if (results.length === 0) {
                return done(null, false);
            } else {
                return done(null, results[0]);
            }
        });
    });


}

module.exports = { initPassport };