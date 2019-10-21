var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
require('dotenv').config();

var url = process.env.URL_MONGOOSE;
mongoose.connect(url);

//admin
var userRoute = require('./routes/user.route');
var authRoute = require('./routes/auth.route');
const articleRoute = require('./routes/article.route');
const commentRoute = require('./routes/comment.route');
const statisticalRoute = require('./routes/statistical.route');

//user
const userActionRoute = require('./routes/userAction.route');

const authMiddleware = require('./middlewares/auth.middleware');

const port = 3000;

const app = express();
app.set("view engine", "ejs");
app.set('views', './views');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(express.static('public'));

// Route admin
app.use('/auth', authRoute);
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
