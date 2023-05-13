const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

app.set('views', path.join(__dirname, '../Client/views'));
app.use(express.urlencoded({ extended: false }))
app.use(flash());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Client/views')));
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

const { initPassport } = require('./passportConfig');
initPassport();

const routes = require('./routes/routes');
app.use('/', routes);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
