var express = require('express');
var oauth = require('../oauth-models/oauth');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
var router = express.Router();

router.all('/login', oauth.grant());

router.post('/logout', oauth.authorise(), authenticate.checkAccessToken, authController.logout);

router.post('/add-wallet', oauth.authorise(), authenticate.checkAccessToken, authController.addWallet);

router.post('/update-password', oauth.authorise(), authenticate.checkAccessToken, authController.updatePassword);

router.post('/send-mail-reset-password', authController.sendMailResetPassword);

router.post('/public-key', authController.publicKey);

router.post('/token', authController.token);

router.post('/login-by-wallet', authController.loginByWallet);

router.post('/reset-password', authController.resetPassword);

router.post('/register', authController.register);

router.post('/resend-mail-active-user', authController.resendEmailActivateUser);

router.get('/active-user', authController.activeUser);

router.post('/create-client', authenticate.checkAdminAccessToken, authController.createClient);

router.post('/client/:id', authenticate.checkAdminAccessToken, authController.getClient);

router.post('/update-status-client', authenticate.checkAdminAccessToken, authController.updateStatusClient);

router.post('/update-secret-client', authenticate.checkAdminAccessToken, authController.updateSecretClient);

router.delete('/delete/:id', authenticate.checkAdminAccessToken, authController.deleteInvalidUser);

module.exports = router;
