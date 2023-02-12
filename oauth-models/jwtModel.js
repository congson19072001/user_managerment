var jwt = require('jsonwebtoken');
const { generateKeyPair } = require('crypto');
const bcrypt = require("bcrypt");
const authService = require("../services/auth.service");
const userService = require("../services/users.service");
const {connectRedis} = require("../helpers/redis-client");
const {messages, error_codes, dynamic_data} = require("../helpers/constants");
const {deleteRedisKeys} = require("../helpers/utils");

// redis connection
let redisClient = {};
connectRedis().then((res) => {
  redisClient = res;
}).catch(() => {
  console.log("connect redis failed!")
});

var model = module.exports;


model.getAccessToken = function (bearerToken, callback) {
  let data = jwt.decode(bearerToken);
  if (!data || !data.clientId || !data.userId) {
    callback(false, false);
  } else {
    authService.getClientByClientId(data.clientId).then((client) => {
      let public_key = jwt.decode(client.public_key);

      jwt.verify(bearerToken, public_key, { algorithm: 'RS256' }, function (err, decoded) {
        if (!err && data.type === 'accessToken') {

          if (!global.jwtToken[decoded.clientId+decoded.userId+data.type+bearerToken]) {
            console.log('in get accessToken from redis')
            redisClient.get(decoded.clientId+decoded.userId+data.type+bearerToken).then((value) => {
              global.jwtToken[decoded.clientId+decoded.userId+data.type+bearerToken] = value;
              console.log(global.jwtToken)
            }).finally(() => {
              return callback(false, {
                clientId: decoded.clientId,
                userId: decoded.userId,
                expires: new Date(decoded.exp * 1000),
                token: bearerToken,
                type: data.type
              });
            });
          } else {
            return callback(false, {
              clientId: decoded.clientId,
              userId: decoded.userId,
              expires: new Date(decoded.exp * 1000),
              token: bearerToken,
              type: data.type
            });
          }

        } else {
          callback(err, false);
        }
      });
    }).catch(error => {
      callback(false, false);
    });
  }
};

model.getRefreshToken = function (bearerToken, callback) {
  let data = jwt.decode(bearerToken);

  authService.getClientByClientId(data.clientId).then((client) => {
    let public_key = jwt.decode(client.public_key);
    jwt.verify(bearerToken, public_key, { algorithm: 'RS256' }, function (err, decoded) {
      if (!err && data.type === 'refreshToken') {

        if (!global.jwtToken[decoded.clientId+decoded.userId+data.type+bearerToken]) {
          console.log('in get refreshToken from redis')
          redisClient.get(decoded.clientId+decoded.userId+data.type+bearerToken).then((value) => {
            global.jwtToken[decoded.clientId+decoded.userId+data.type+bearerToken] = value;
            console.log(global.jwtToken)
          }).finally(() => {
            return callback(false, {
              clientId: decoded.clientId,
              userId: decoded.userId,
              expires: new Date(decoded.iat)
            });
          });
        } else {
          return callback(false, {
            clientId: decoded.clientId,
            userId: decoded.userId,
            expires: new Date(decoded.iat)
          });
        }

      } else {
        callback(err, false);
      }
    });
  }).catch(error => {
    callback(false, false);
  });
};

model.createClient = function (clientId, clientSecret, callback) {
  generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret'
    }
  }, (err, publicKey, privateKey) => {
    // Handle errors and use the generated key pair.
    authService.createClient({ client_id: clientId, client_secret: clientSecret, private_key: privateKey, public_key: publicKey })
      .then(client => {
        return callback(false, [client]);
      }).catch(error => {
        callback(false, false);
      })
  });
};

model.getClient = function (clientId, clientSecret, callback) {

authService.getClientByClientIdAndSecret(clientId, clientSecret).then(client => {
    return callback(false, {
      clientId: client.client_id,
      clientSecret: client.client_secret,
      redirectUri: client.redirect_uri
    });
  }).catch(error => {
  callback(false, false);
});
};

model.grantTypeAllowed = function (clientId, grantType, callback) {
  //authorizedClientIds[grantType] && authorizedClientIds[grantType].indexOf(clientId.toLowerCase()) >= 0
  callback(false, true);
};

model.saveAccessToken = function (accessToken, clientId, expires, userId, callback) {
  callback(false);
};

model.saveRefreshToken = function (refreshToken, clientId, expires, userId, callback) {
  callback(false);
};

model.generateToken = function (type, req, callback) {
  let payload = {
    clientId: req.oauth.client.clientId,
    userId: req.user.id,
    type: type
  };

  authService.getClientByClientId(payload.clientId).then(client => {
    if (client) {
      let private_key = jwt.decode(client.private_key);
      let expries = process.env.JWT_EXPIRED;
      if (type == 'refreshToken') expries = process.env.JWT_REFRESH_TOKEN_EXPIRED;

      jwt.sign(payload, { key: private_key, passphrase: 'top secret' }, { algorithm: 'RS256', expiresIn: expries }, function (err, token) {
        if (!err) {
          //Delete old tokens
          deleteRedisKeys(redisClient, `${payload.clientId + payload.userId + type}*`)
              .then(() => {
                // Generate new tokens
                redisClient.set(`${payload.clientId + payload.userId + type}${token}`, '1', {
                  EX: type == 'refreshToken' ? Number(process.env.REDIS_EXPIRE_REFRESH_TOKEN) : Number(process.env.REDIS_EXPIRE_ACCESS_TOKEN)
                }).then(() => {
                  global.jwtToken[payload.clientId + payload.userId + type + token] = 1;
                  callback(false, token);
                }).catch(err => {
                  callback(err);
                });
              }).catch(error => {
                callback(error)
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(false, false);
    }
  }).catch(error => {
    callback(false, false);
  });
};

/*
* Required to support password grant type
*/
model.getUser = async (email, password, callback) => {
  const limitLoginTimes = Number.parseInt(process.env.LOGIN_LIMIT_TIMES);
  const intervalTryTime = Number.parseInt(process.env.LOGIN_INTERVAL_TRY_TIME);
  const blockLoginTime = Number.parseInt(process.env.LOGIN_BLOCK_TIME);

  userService.getActiveUserByEmail(email).then(async user => {
    if (user) {
      const userCountLoginTimesMap = global.userCountLoginTimesMap;

      if (userCountLoginTimesMap.has(user.id)) {
        const value = userCountLoginTimesMap.get(user.id);

        if (value.blockedAt && ((Date.now() - value.blockedAt) <= blockLoginTime)) {

          return callback({
            isError: true,
            message: messages.PASSWORD_LOGIN_INVALID_LIMIT,
            error_code: error_codes.PASSWORD_LOGIN_INVALID_LIMIT,
            dynamic_data: dynamic_data.PASSWORD_LOGIN_INVALID_LIMIT
          }, false);
        }
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        userCountLoginTimesMap.delete(user.id);
        return callback(false, {
          id: user.id,
          email: user.email,
          password: user.password
        });
      } else {
        // invalid password
        if (userCountLoginTimesMap.has(user.id)) {
          const value = userCountLoginTimesMap.get(user.id);

          if ((value.blockedAt && (Date.now() - value.blockedAt) > blockLoginTime) || (!value.blockedAt && isNaN(value.times))) {

            value.times = 1;
            value.startedAt = Date.now();
            value.blockedAt = undefined;
            userCountLoginTimesMap.set(user.id, value);
            return callback({
              isError: true,
              message: messages.PASSWORD_IS_FALSE,
              error_code: error_codes.PASSWORD_IS_FALSE,
            }, false);

          } else if (value.blockedAt && ((Date.now() - value.blockedAt) <= blockLoginTime)) {

            return callback({
              isError: true,
              message: messages.PASSWORD_LOGIN_INVALID_LIMIT,
              error_code: error_codes.PASSWORD_LOGIN_INVALID_LIMIT,
              dynamic_data: dynamic_data.PASSWORD_LOGIN_INVALID_LIMIT
            }, false);

          } else if (!isNaN(value.times) && value.times >= limitLoginTimes && ((Date.now() - value.startedAt) < intervalTryTime) && !value.blockedAt) {

            value.blockedAt = Date.now();
            userCountLoginTimesMap.set(user.id, value);
            return callback({
              isError: true,
              message: messages.PASSWORD_LOGIN_INVALID_LIMIT,
              error_code: error_codes.PASSWORD_LOGIN_INVALID_LIMIT,
              dynamic_data: dynamic_data.PASSWORD_LOGIN_INVALID_LIMIT
            }, false);

          } else if (!isNaN(value.times) && value.times < limitLoginTimes && ((Date.now() - value.startedAt) < intervalTryTime)) {

            value.times++;
            value.blockedAt = value.times === limitLoginTimes ? Date.now() : undefined;
            userCountLoginTimesMap.set(user.id, value);
            return callback({
              isError: true,
              message: value.times === limitLoginTimes ? messages.PASSWORD_LOGIN_INVALID_LIMIT : messages.PASSWORD_IS_FALSE,
              error_code: value.times === limitLoginTimes ? error_codes.PASSWORD_LOGIN_INVALID_LIMIT : error_codes.PASSWORD_IS_FALSE,
              dynamic_data: value.times === limitLoginTimes ? dynamic_data.PASSWORD_LOGIN_INVALID_LIMIT : undefined
            }, false);

          } else if (!isNaN(value.times) && value.times < limitLoginTimes && ((Date.now() - value.startedAt) >= intervalTryTime)) {

            value.times = undefined;
            value.startedAt = undefined;
            value.blockedAt = undefined;
            userCountLoginTimesMap.set(user.id, value);
            return callback({
              isError: true,
              message: messages.PASSWORD_IS_FALSE,
              error_code: error_codes.PASSWORD_IS_FALSE,
            }, false);

          }
        } else {

          const value = {};
          value.times = 1;
          value.startedAt = Date.now();
          value.blockedAt = undefined;
          userCountLoginTimesMap.set(user.id, value);

          return callback({
            isError: true,
            message: messages.PASSWORD_IS_FALSE,
            error_code: error_codes.PASSWORD_IS_FALSE,
          }, false);
        }
      }

      // Maybe cause exception -> call this callback
      return callback({
        isError: true,
        message: messages.PASSWORD_IS_FALSE,
        error_code: error_codes.PASSWORD_IS_FALSE,
      }, false);
    } else {
      // non record user
      callback({
        isError: true,
        message: messages.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL,
        error_code: error_codes.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL,
      }, false);
    }
  }).catch(error => {
    callback(error, false);
  })
};