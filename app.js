const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const sessionConfig = require('./app/config/session');
const routes = require('./app/routes/index');
const dateHelper = require('./app/helpers/dateHelper');

const app = express();

// Expose date helpers to all views (must be before view engine setup)
app.locals.formatDate = dateHelper.formatDate;
app.locals.formatDateTime = dateHelper.formatDateTime;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express EJS Layouts
app.use(expressLayouts);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));

// Routes
app.use('/', routes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = app;
