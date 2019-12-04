const express = require('express');
const app = express();
const api = require('./api/api');
const config = require('./config/config');
const mongoose = require('mongoose');

mongoose.connect(config.urlDb, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

require('./middleware/appMiddleware')(app);

app.use('/', api);

module.exports = app;