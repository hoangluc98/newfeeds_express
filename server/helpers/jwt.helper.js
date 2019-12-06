const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});

let jwtHelper = {};

jwtHelper.generateToken = (user, secretSignature, tokenLife) => {
    return new Promise((resolve, reject) => {
        const userData = {
                _id: user._id,
                email: user.email,
                type: user.type
            }
            
        jwt.sign({
                data: userData
            },
            secretSignature, {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            }, (error, token) => {
                if (error) {
                    return reject(error);
                }
                resolve(token);
            });
    });
}

jwtHelper.verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded);
        });
    });
}

jwtHelper.checkLogin = (user) => {
    let decoded = jwt.decode(user.tokens.accessToken);

    const now = Date.now().valueOf() / 1000;
    if (typeof decoded.exp !== 'undefined' && decoded.exp > now)
        return true;
    if (typeof decoded.nbf !== 'undefined' && decoded.nbf < now)
        return true;
    return false;
}

jwtHelper.checkExpire = (decoded) => {
    const now = Date.now().valueOf() / 1000;

    if (typeof decoded.exp !== 'undefined' && decoded.exp < now){
        return true;
    }
    return false;
}

module.exports = jwtHelper;