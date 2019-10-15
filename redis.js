var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost'});

redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 console.log("Error in Redis");
});

redisClient.set("language","nodejs",function(err,reply) {
 console.log(err);
 console.log(reply);
});

redisClient.expire('language', 30);