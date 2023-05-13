const mysql = require('mysql');
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
dotenv.config();


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const student1Id = 'S00001';
const student1Name = 'Aldo Bega';
const student1Email = 'aldo.bega@example.com';
const student1Password = 'password1';
const RoleOfUser = "Admin";

const saltRounds = 10; // Number of rounds of hashing to apply

bcrypt.genSalt(saltRounds, function(err, salt) {
  bcrypt.hash(student1Password, salt, function(err, hash) {
    if (err) throw err;
    connection.query('INSERT INTO User (Id, NameOfUser, Email, AccountPassword, RoleOfUser) VALUES (?, ?, ?, ?, ?)', [student1Id, student1Name, student1Email, hash, RoleOfUser], function (error, results, fields) {
      if (error) throw error;
      console.log('Student created successfully:', student1Id);
    });
  });
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }

  console.log('Connected to MySQL as id ' + connection.threadId);
});
