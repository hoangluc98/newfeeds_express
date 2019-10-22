const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const url = process.env.URL_MONGOOSE;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

//admin
const userRoute = require('./routes/user.route');
const authRoute = require('./routes/auth.route');
const articleRoute = require('./routes/article.route');
const commentRoute = require('./routes/comment.route');
const statisticalRoute = require('./routes/statistical.route');

//user
const userActionRoute = require('./routes/userAction.route');

const authMiddleware = require('./middlewares/auth.middleware');

const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route admin
app.use('/auth', authMiddleware.requireAuth, authRoute);
app.use('/users', authMiddleware.requireAuth, userRoute);
app.use('/articles', authMiddleware.requireAuth, articleRoute);
app.use('/comments', authMiddleware.requireAuth, commentRoute);
app.use('/statisticals', authMiddleware.requireAuth, statisticalRoute);

// Route user
app.use('/userAction', authMiddleware.requireAuth, userActionRoute);

// Listen
app.listen(port, function() {
  console.log('Server listening on port ' + port);
});
