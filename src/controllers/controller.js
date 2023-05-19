const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const connection = require('../db');


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
    res.render('index', { layout: 'main' });
}

exports.login = (req, res) => {
    res.render('login', { message: req.flash('error'), layout: 'main' });
}

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }

        // Authenticate the user and store user information in the session
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }

            // Authentication successful, generate the redirect URL with the user ID
            const redirectURL = `/welcome/${user.Id}`;

            // Redirect to the generated URL
            return res.redirect(redirectURL);
        });
    })(req, res, next);
};

let showSection = false;

exports.welcome = (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    if (req.user.RoleOfUser === 'Admin') {
        return res.redirect('/admin');
    }

    if (req.user.RoleOfUser === 'Student') {
        res.render('student', { name: req.user.NameOfUser, layout: 'page' });
    }

    if (req.user.RoleOfUser === 'Professor') {
        res.render('professor', { name: req.user.NameOfUser, layout: 'page' });
    }
};

exports.addSection = (req, res) => {
    res.json({ success: true });
}

exports.adduser = (req, res) => {
    res.render('addUser', { layout: 'admin' });
}

exports.find = (req, res, next) => {

    let searchTerm = req.body.search;

    connection.query('SELECT * FROM User WHERE NameOfUser LIKE ? OR Id LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, results) => {
        if (!err) {
            res.render('home', { results, layout: 'admin' });
        } else {
            console.log(err);
            next(err);
        }
    });
};

exports.admin = (req, res, next) => {
    if (!req.user || !isAdmin) {
        res.status(401).send('Unauthorized');
        return;
    }

    connection.query('SELECT * FROM User', (err, results) => {
        if (!err) {
            res.render('home', { results, layout: 'admin' });
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
        return res.render('addUser', { error: 'All fields are required', layout: 'admin' });
    }

    if (ID.length !== 6) {
        return res.render('addUser', { error: 'ID must be exactly 6 characters', layout: 'admin' });
    }

    const sql = 'SELECT * FROM User WHERE Id = ?';
    connection.query(sql, [ID], (err, results) => {
        if (err) {
            console.log(err);
            return res.render('addUser', { error: 'Something went wrong', layout: 'admin' });
        }

        if (results.length > 0) {
            return res.render('addUser', { error: 'ID already exists', layout: 'admin' });
        }

        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) throw err;

                const sql = 'INSERT INTO User (Id, NameOfUser, Email, AccountPassword, RoleOfUser) VALUES (?, ?, ?, ?, ?)';
                connection.query(sql, [ID, fullName, email, hash, role], (err, results) => {
                    if (!err) {
                        res.render('addUser', { success: 'User added successfully', layout: 'admin' })
                    } else {
                        console.log(err);
                        return res.render('addUser', { error: 'Something went wrong', layout: 'admin' });
                    }
                })
            });
        });
    })
}

exports.edituser = (req, res) => {
    connection.query('SELECT * FROM User WHERE ID = ?', [req.params.ID], (err, results) => {
        if (!err) {
            res.render('editUser', { results, layout: 'admin' })
        } else {
            console.log(err);
        }
    })
}

exports.edituserPost = (req, res) => {
    const { ID, fullName, email, password, role } = req.body;
    const saltRounds = 10;

    if (!ID || !fullName || !email || !role) {
        return res.render('editUser', { error: 'All fields are required', layout: 'admin' });
    }

    if (ID.length !== 6) {
        return res.render('addUser', { error: 'ID must be exactly 6 characters', layout: 'admin' });
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
                    res.render('editUser', { success: 'User updated successfully', layout: 'admin' })
                } else {
                    console.log(err);
                    return res.render('editUser', { error: 'Something went wrong', layout: 'admin' });
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
