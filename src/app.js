const express = require('express');
const routes = require('./router/routes');
const logger = require('./middleware/logger');
const JSONFormatError = require('./middleware/jsonFormatErr');

const app = express();

app.use(express.json({ type: 'application/json'}), JSONFormatError);
app.use(express.urlencoded({ extended: false }));
app.use('/', logger);
app.use('/', routes);

module.exports = app;
