const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;

console.log('Before job instantiation');
const job = new CronJob({
	cronTime: '* * * * * *', 
	onTick: function() {
		const d = new Date();
		d.setHours(new Date().getHours() + 7);
		console.log('At Ten Minutes:', d);
	},
	start: false,
	timeZone: 'Asia/Ho_Chi_Minh'
});
console.log('After job instantiation');
job.start();

require('dotenv').config();

const url = process.env.URL_MONGOOSE;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Require route admin
const userRoute = require('./routes/user.route');
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
app.use('/articles', authMiddleware.requireAuth, authMiddleware.authenticate, articleRoute);
app.use('/comments', authMiddleware.requireAuth, authMiddleware.authenticate, commentRoute);
app.use('/statisticals', authMiddleware.requireAuth, statisticalRoute);

// Route user
app.use('/userAction', authMiddleware.requireAuth, userActionRoute);

// Listen
server.listen(port, function() {
  console.log('Server listening on port ' + port);
});
