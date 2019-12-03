const express = require('express');
const app = express();
const api = require('./api/api');
const config = require('./config/config');
const mongoose = require('mongoose');

mongoose.connect(config.urlDb, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });


require('./middleware/appMiddleware')(app);

app.use('/api', api);

// // Require Middelware
// const authMiddleware = require('./middlewares/auth.middleware');

// const port = 3000;

// const server = require('http').createServer(app);

// Route admin
// app.use('/auth', authRoute);
// app.use('/users', authMiddleware.requireAuth, authMiddleware.authenticate, userRoute);
// app.use('/groupUsers', authMiddleware.requireAuth, authMiddleware.authenticate, groupUserRoute);
// app.use('/articles', authMiddleware.requireAuth, authMiddleware.authenticate, articleRoute);
// app.use('/comments', authMiddleware.requireAuth, authMiddleware.authenticate, commentRoute);
// app.use('/statisticals', authMiddleware.requireAuth, authMiddleware.authenticate, statisticalRoute);

module.exports = app;