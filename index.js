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
var articleRoute = require('./routes/article.route');
var commentRoute = require('./routes/comment.route');
var statisticalRoute = require('./routes/statistical.route');

//user
var userActionRoute = require('./routes/userAction.route');

var authMiddleware = require('./middlewares/auth.middleware');

var port = 3000;

var app = express();
app.set("view engine", "ejs");
app.set('views', './views');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));

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
