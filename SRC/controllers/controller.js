const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require("dotenv");
const mysql = require('mysql');
const bcrypt = require('bcrypt');


dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

function isAdmin(req, res, next) {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        // Check if the user's role is admin
        if (req.user.RoleOfUser === 'Admin') {
            // If the user is authenticated and their role is admin, call the next middleware function
            return next();
        }
    }

    // If the user is not authenticated or their role is not admin, redirect them to the login page
    res.redirect('/login');
}

exports.index = (req, res) => {
    res.render("index.ejs");
}

exports.login = (req, res) => {
    res.render('login.ejs', { message: req.flash('error') });
}

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/welcome',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
}

exports.welcome = (req, res, next) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    if (req.user.RoleOfUser == "Admin") {
        return res.redirect('/admin');
    }

    res.render("welcome.ejs", { username: req.user.NameOfUser, role: req.user.RoleOfUser });
};

exports.adduser = (req, res) => {
    res.render('addUser');
}

exports.admin = (req, res, next) => {
    if (!req.user || !isAdmin) {
        res.status(401).send('Unauthorized');
        return;
    }

    connection.query('SELECT * FROM User', (err, results) => {
        if (!err) {
            res.render('home', { results });
        } else {
            console.log(err);
            next(err);
        }
    });
};

exports.logout = (req, res) => {
    req.logout(() => res.redirect('/login'));
}

exports.adduserPost = (req, res) => {
    const { ID, fullName, email, password, role } = req.body;
    const saltRounds = 10;

    if (!ID || !fullName || !email || !password || !role) {
        return res.render('addUser', { error: 'All fields are required' });
    }

    if (ID.length !== 6) {
        return res.render('addUser', { error: 'ID must be exactly 6 characters' });
    }

    const sql = 'SELECT * FROM User WHERE Id = ?';
    connection.query(sql, [ID], (err, results) => {
        if (err) {
            console.log(err);
            return res.render('addUser', { error: 'Something went wrong' });
        }

        if (results.length > 0) {
            return res.render('addUser', { error: 'ID already exists' });
        }

        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) throw err;

                const sql = 'INSERT INTO User (Id, NameOfUser, Email, AccountPassword, RoleOfUser) VALUES (?, ?, ?, ?, ?)';
                connection.query(sql, [ID, fullName, email, hash, role], (err, results) => {
                    if (!err) {
                        res.render('addUser', { success: 'User added successfully' })
                    } else {
                        console.log(err);
                        return res.render('addUser', { error: 'Something went wrong' });
                    }
                })
            });
        });
    })
}

exports.edituser = (req, res) => {
    connection.query('SELECT * FROM User WHERE ID = ?', [req.params.ID], (err, results) => {
        if (!err) {
            res.render('editUser', { results })
        } else {
            console.log(err);
        }
    })
}

exports.edituserPost = (req, res) => {
    const { ID, fullName, email, password, role } = req.body;
    const saltRounds = 10;

    if (!ID || !fullName || !email || !role) {
        return res.render('editUser', { error: 'All fields are required' });
    }

    if (ID.length !== 6) {
        return res.render('addUser', { error: 'ID must be exactly 6 characters' });
    }

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) throw err;

            let sql = 'UPDATE User SET  NameOfUser = ?, Email = ?, RoleOfUser = ?,';
            const values = [fullName, email, role];

            if (password) {
                sql += ' AccountPassword = ?,';
                values.push(hash);
            }

            if (ID) {
                sql += ' Id = ?';
                values.push(ID);
                sql += ' WHERE Id = ?';
                values.push(req.params.ID);
            } else {
                sql = sql.slice(0, -1); // Remove trailing comma
                sql += ' WHERE Id = ?';
                values.push(req.params.ID);
            }

            connection.query(sql, values, (err, results) => {
                if (!err) {
                    res.render('editUser', { success: 'User updated successfully' })
                } else {
                    console.log(err);
                    return res.render('editUser', { error: 'Something went wrong' });
                }
            })
        });
    });
}

exports.delete = (req, res) => {
    connection.query('DELETE FROM User WHERE ID = ?', [req.params.ID], (err, results) => {
        if (!err) {
            res.redirect('/admin')
        } else {
            console.log(err);
        }
    })
}
