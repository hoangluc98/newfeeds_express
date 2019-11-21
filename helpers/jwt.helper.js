const jwt = require("jsonwebtoken");
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost'});

let generateToken = (user, secretSignature, tokenLife) => {
    return new Promise((resolve, reject) => {
        const userData = {
                _id: user._id,
                email: user.email,
                device: user.device
            }
            
        jwt.sign({
                data: userData
            },
            secretSignature, {
                algorithm: "HS256",
                expiresIn: tokenLife,
            }, (error, token) => {
                if (error) {
                    return reject(error);
                }
                resolve(token);
            });
    });
}

let verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded);
        });
    });
}

let checkLogin = (user) => {
    if(user.accessToken.length > 1){
        let decoded = jwt.decode(user.accessToken);

        const now = Date.now().valueOf() / 1000;
        if (typeof decoded.exp !== 'undefined' && decoded.exp > now)
            return true;
        if (typeof decoded.nbf !== 'undefined' && decoded.nbf < now)
            return true;
        return false;
    }
}

// let checkExpire = (decoded) => {
//     const now = Date.now().valueOf() / 1000;
//     if (typeof decoded.exp !== 'undefined' && decoded.exp < (now - 3)) {
//         // redisClient.srem('userOnline', decoded.data._id);
//     }
// }

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    checkLogin: checkLogin
};