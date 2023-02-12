var express = require('express');
var oauth = require('../oauth-models/oauth');
var router = express.Router();
const userController = require('../controllers/users.controller');
const authenticate = require('../middleware/authenticate');

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/userinfo', oauth.authorise(), userController.userInfo);

router.post('/userinfo/:id', userController.userInfoById);

router.post('/update-profile', oauth.authorise(), authenticate.checkAccessToken, userController.updateUserInfo);

router.post('/update-status', authenticate.checkAdminAccessToken, userController.updateUserStatus);

module.exports = router;
