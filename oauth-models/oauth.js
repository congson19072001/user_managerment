var oauthserver = require('../lib/oauth2-server-var-meta');
var memorystore = require('./jwtModel.js');

var oauth = oauthserver({
    model: memorystore,
    grants: ['password','refresh_token'],
    accessTokenLifetime: 3600,
    refreshTokenLifetime: 1209600
});

module.exports = oauth;
