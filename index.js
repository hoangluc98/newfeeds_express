const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const url = process.env.URL_MONGOOSE;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

// Require route admin
const userRoute = require('./routes/user.route');
const groupUserRoute = require('./routes/groupUser.route');
const authRoute = require('./routes/auth.route');
const articleRoute = require('./routes/article.route');
const commentRoute = require('./routes/comment.route');
const statisticalRoute = require('./routes/statistical.route');

// Require route user
const userActionRoute = require('./routes/userAction.route');

// Require Middelware
const authMiddleware = require('./middlewares/auth.middleware');

const port = 3000;

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route admin
app.use('/auth', authRoute);
app.use('/users', authMiddleware.requireAuth, authMiddleware.authenticate, userRoute);
app.use('/groupUsers', authMiddleware.requireAuth, authMiddleware.authenticate, groupUserRoute);
app.use('/articles', authMiddleware.requireAuth, authMiddleware.authenticate, articleRoute);
app.use('/comments', authMiddleware.requireAuth, authMiddleware.authenticate, commentRoute);
app.use('/statisticals', authMiddleware.requireAuth, authMiddleware.authenticate, statisticalRoute);

// Listen
server.listen(port, function() {
  console.log('Server listening on port ' + port);
});
