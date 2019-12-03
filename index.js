const app = require('./server/server');
const config = require('./server/config/config');

// Listen
app.listen(config.port, function() {
  console.log('Server listening on port ' + config.port);
});
