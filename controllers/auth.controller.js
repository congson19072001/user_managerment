const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authService = require("../services/auth.service");
const mailService = require("../services/mail.service");
const userService = require("../services/users.service");
const { CustomError, handleCatchError } = require("../helpers/custom-error");
const { generateKeyPair } = require("crypto");
const { connectRedis } = require("../helpers/redis-client");
const { return_codes, messages, error_codes } = require("../helpers/constants");
const Web3 = require("web3");
const { register, resetPassword } = require("../helpers/email-template");
const JsonWebTokenError = require("jsonwebtoken/lib/JsonWebTokenError");
const NotBeforeError = require("jsonwebtoken/lib/NotBeforeError");
const TokenExpiredError = require("jsonwebtoken/lib/TokenExpiredError");
const {deleteRedisKeys} = require("../helpers/utils");
const EmailDomainValidator = require("email-domain-validator");

const web3 = new Web3();

require('dotenv').config()


// redis connection
let redisClient = {};
connectRedis().then((res) => {
    redisClient = res;
}).catch(() => {
    console.log("connect redis failed!")
});

exports.logout = async (req, res, next) => {
    try {
        const data = req.data;

        await deleteRedisKeys(redisClient, data.clientId + data.userId + 'accessToken' + '*');
        await deleteRedisKeys(redisClient, data.clientId + data.userId + 'refreshToken' + '*');

        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.resendEmailActivateUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_MISSING);
        }
        const subject = 'Please active your account';

        const code = await authService.genCode();
        await userService.updateCodeByEmail(code, email);

        let url = process.env.SSO_ROOT_DOMAIN + "/auth/active-user?code=" + code;
        const html = register(url)

        await mailService.sendMail(email, subject, html);

        res.status(200).json({
            success: true,
        });

    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.sendMailResetPassword = async (req, res, next) => {
    try {
        if (
            !req.body
            || !req.body.client_id
            || !req.body.client_secret
            || !req.body.email
        ) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_INVALID, error_codes.DATA_BODY_INVALID);
        }

        let { client_id, client_secret, email } = req.body;

        let client = await authService.getClientByClientIdAndSecret(client_id, client_secret);
        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT, error_codes.NON_RECORDED_CLIENT);
        }

        let user = await userService.getActiveUserByEmail(email);
        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL, error_codes.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL);
        }

        const code = await authService.genCode();
        await userService.updateCodeByEmail(code, email);

        const subject = 'Reset your password';

        let url = process.env.GAME_MARKET_FRONTEND + "/reset-password?code=" + code;
        const html = resetPassword(user, url)

        await mailService.sendMail(user.email, subject, html);

        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        handleCatchError(error, res)
    }
}

exports.publicKey = async (req, res, next) => {
    try {
        let { client_id, client_secret } = req.body;

        if (!client_id || !client_secret) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_EMPTY, error_codes.CLIENT_INFO_EMPTY);
        } else {
            let client = await authService.getClientByClientIdAndSecret(client_id, client_secret);
            if (!client) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT, error_codes.NON_RECORDED_CLIENT)
            }
            return res.status(200).json({
                success: true,
                data: { public_key: jwt.decode(client.public_key) }
            })
        }
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.token = async (req, res, next) => {
    try {
        if (!req || !req.body || !req.body.refresh_token) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.REFRESH_TOKEN_EMPTY, error_codes.REFRESH_TOKEN_EMPTY);
        }
        let bearerToken = req.body.refresh_token;

        let data = {};
        try {
            data = jwt.decode(bearerToken);
        } catch (error) {
            throw new CustomError(return_codes.CLIENT_ERROR, error.message, error_codes.TOKEN_INVALID);
        }

        if (!data) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.REFRESH_TOKEN_INVALID, error_codes.REFRESH_TOKEN_INVALID);
        }
        let client = await authService.getClientByClientId(data.clientId);

        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT_WITH_ID, error_codes.NON_RECORDED_CLIENT_WITH_ID)
        }

        let public_key = jwt.decode(client.public_key);
        let private_key = jwt.decode(client.private_key);
        let decoded = {};

        try {
            decoded = await jwt.verify(bearerToken, public_key, { algorithm: 'RS256' });
        } catch (error) {
            throw new CustomError(return_codes.TOKEN_ERROR, error.message, error_codes.TOKEN_INVALID);
        }
        let jwtIsActive = await redisClient.get(data.clientId + data.userId + 'refreshToken' + bearerToken);
        global.jwtToken[data.clientId + data.userId + 'refreshToken'+ bearerToken] = Number(jwtIsActive);

        if (data.type !== 'refreshToken' || !Number(jwtIsActive)) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.TOKEN_ERROR, error_codes.TOKEN_ERROR);
        } else {
            let payload = {
                clientId: data.clientId,
                userId: data.userId,
                type: 'accessToken'
            };

            const accessToken = jwt.sign(
                { ...payload, type: 'accessToken' },
                { key: private_key, passphrase: 'top secret' },
                { algorithm: 'RS256', expiresIn: process.env.JWT_EXPIRED }
            );
            const refreshToken = jwt.sign(
                { ...payload, type: 'refreshToken' },
                { key: private_key, passphrase: 'top secret' },
                { algorithm: 'RS256', expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED }
            );

            //del all old access token
            await deleteRedisKeys(redisClient, data.clientId + data.userId + 'accessToken' + '*')

            await redisClient.set(data.clientId + data.userId + 'accessToken' + accessToken, '1', {
                EX: process.env.REDIS_EXPIRE_ACCESS_TOKEN
            });
            await redisClient.set(data.clientId + data.userId + 'refreshToken' + refreshToken, '1', {
                EX: process.env.REDIS_EXPIRE_REFRESH_TOKEN
            });
            global.jwtToken[data.clientId + data.userId + 'accessToken' + accessToken] = 1;
            global.jwtToken[data.clientId + data.userId + 'refreshToken' + refreshToken] = 1;

            res.status(200).json({
                success: true,
                data: {
                    token_type: 'beer',
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: process.env.JWT_EXPIRED
                }
            });
            await deleteRedisKeys(redisClient, data.clientId + data.userId + 'refreshToken' + bearerToken);
        }
    } catch (error) {
        handleCatchError(error, res)
    }
}

exports.addWallet = async (req, res, next) => {
    try {
        if (!req.body || !req.body.wallet || !req.body.signature || (!req.body.nonce && req.body.nonce != 0)) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_INVALID);
        }

        const isWallet = web3.utils.isAddress(req.body.wallet);

        if (!isWallet) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
        }

        let walletAddress;
        try {
            walletAddress = web3.eth.accounts.recover(process.env.SIGNATURE_TEXT + ` Nonce: ${req.body.nonce}`, req.body.signature);
        } catch (error) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.SIGNATURE_INVALID, error_codes.SIGNATURE_INVALID);
        }

        if (req.body.wallet != walletAddress) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
        }

        const data = req.data;
        await userService.updateWalletById(data.userId, req.body.wallet);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.loginByWallet = async (req, res, next) => {
    try {
        if (!req || !req.body || !req.body.wallet || !req.body.signature || (!req.body.nonce && req.body.nonce != 0)) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_MISSING);
        }

        const isWallet = web3.utils.isAddress(req.body.wallet);

        if (!isWallet) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
        }

        let walletAddress;
        try {
            walletAddress = web3.eth.accounts.recover(process.env.SIGNATURE_TEXT + ` Nonce: ${req.body.nonce}`, req.body.signature);
        } catch (error) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.SIGNATURE_INVALID, error_codes.SIGNATURE_INVALID);
        }

        if (req.body.wallet != walletAddress) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
        }

        if (!req.body.client_id || !req.body.client_secret) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_EMPTY, error_codes.CLIENT_INFO_EMPTY);
        }
        let client = await authService.getClientByClientIdAndSecret(req.body.client_id, req.body.client_secret);

        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT, error_codes.NON_RECORDED_CLIENT);
        }

        let private_key = jwt.decode(client.private_key);
        let user = await userService.getActiveUserByWallet(req.body.wallet);

        if (user) {
            let [accessToken, refreshToken] = await Promise.all([
                jwt.sign(
                    { clientId: req.body.client_id, userId: user.id, type: 'accessToken' },
                    { key: private_key, passphrase: 'top secret' },
                    { algorithm: 'RS256', expiresIn: process.env.JWT_EXPIRED }),
                jwt.sign(
                    { clientId: req.body.client_id, userId: user.id, type: 'refreshToken' },
                    { key: private_key, passphrase: 'top secret' },
                    { algorithm: 'RS256', expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED }),
            ]);

            await deleteRedisKeys(redisClient, req.body.client_id + user.id + 'accessToken' + '*')
            await deleteRedisKeys(redisClient, req.body.client_id + user.id + 'refreshToken' + '*')

            await redisClient.set(req.body.client_id + user.id + 'accessToken' + accessToken, '1', {
                EX: process.env.REDIS_EXPIRE_ACCESS_TOKEN
            });
            await redisClient.set(req.body.client_id + user.id + 'refreshToken' + refreshToken, '1', {
                EX: process.env.REDIS_EXPIRE_REFRESH_TOKEN
            });
            global.jwtToken[req.body.client_id + user.id + 'accessToken' + accessToken] = 1;
            global.jwtToken[req.body.client_id + user.id + 'refreshToken' + refreshToken] = 1;

            res.status(200).json({
                success: true,
                data: {
                    token_type: "bearer",
                    access_token: accessToken,
                    expires_in: process.env.JWT_EXPIRED,
                    refresh_token: refreshToken
                }
            });
        } else {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
        }
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        if (!req.body
            || !req.body.old_password
            || !req.body.new_password
            ) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_MISSING);
        }
        if (req.body.old_password === req.body.new_password) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DUPLICATE_PASSWORD, error_codes.DUPLICATE_PASSWORD);
        }

        const data = req.data;
        let user = await userService.getActiveUserById(data.userId, true, true);
        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_WITH_ID_NOT_EXIST, error_codes.USER_WITH_ID_NOT_EXIST);
        }

        const validPassword = await bcrypt.compare(req.body.old_password, user.password);
        if (!validPassword) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.PASSWORD_IS_FALSE, error_codes.PASSWORD_IS_FALSE);
        }

        const pass = await authService.genPassword(req.body.new_password);

        await userService.updatePassById(data.userId, pass);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        if (
            !req.body
            || !req.body.password
            || !req.body.code
        ) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_MISSING);
        }

        await authService.isCodeActive(req.body.code);

        let user = await userService.getActiveUserByCode(req.body.code);
        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CODE_RESET_PASS_INVALID, error_codes.CODE_RESET_PASS_INVALID);
        }

        const pass = await authService.genPassword(req.body.password);

        await userService.updatePassByCode(req.body.code, pass);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        if (error.message === 'jwt expired') {
            error = {http_code: return_codes.CLIENT_ERROR, error_msg: messages.URL_EXPIRED, error_code: error_codes.DATA_REQUEST_INVALID};
        } else if (error instanceof JsonWebTokenError || error instanceof NotBeforeError || error instanceof TokenExpiredError) {
            error = {http_code: return_codes.CLIENT_ERROR, error_msg: messages.URL_INVALID, error_code: error_codes.DATA_REQUEST_INVALID};
        }
        handleCatchError(error, res);
    }
}

exports.register = async (req, res, next) => {
    try {
        let { email, username, password, wallet, signature, nonce, first_name, last_name, avatar_url, client_id, client_secret } = req.body;

        if (wallet && signature && (nonce === 0 || nonce)) {
            const isWallet = web3.utils.isAddress(wallet);

            if (!isWallet) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
            }

            let walletAddress;

            if (req.body.wallet) {
                let checkUser = await userService.getActiveUserByWallet(req.body.wallet)
                if (checkUser) {
                    throw new CustomError(return_codes.CLIENT_ERROR, messages.DUPLICATED_WALLET, error_codes.DUPLICATED_WALLET);
                }
                let checkUserNotActive = await userService.getActiveUserByWallet(req.body.wallet, false);
                if (checkUserNotActive) {
                    throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_ALREADY_EXISTS_BUT_NOT_ACTIVATED, error_codes.WALLET_ALREADY_EXISTS_BUT_NOT_ACTIVATED);
                }
            }

            try {
                walletAddress = web3.eth.accounts.recover(process.env.SIGNATURE_TEXT + ` Nonce: ${req.body.nonce}`, req.body.signature);
            } catch (error) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.SIGNATURE_INVALID, error_codes.SIGNATURE_INVALID);
            }

            if (wallet != walletAddress) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.WALLET_INVALID, error_codes.WALLET_INVALID);
            }
        }

        if (!req.body.client_id || !req.body.client_secret) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_INVALID, error_codes.CLIENT_INFO_INVALID);
        }
        const client = await authService.getClientByClientIdAndSecret(client_id, client_secret);

        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT, error_codes.NON_RECORDED_CLIENT);
        }

        if (!email || !password) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_INVALID, error_codes.USER_INVALID);
        }

        let user = await userService.getUserByRequest(req.body);
        if (req.body.username) {
            let checkUser = await userService.getUserByUsername(req.body.username);
            if (checkUser) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.USERNAME_ALREADY_EXISTS, error_codes.USERNAME_ALREADY_EXISTS);
            }
        }

        if (req.body.email) {
            let checkUser = await userService.getFullUserByEmail(req.body.email);
            if (checkUser) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.EMAIL_ALREADY_EXISTS, error_codes.EMAIL_ALREADY_EXISTS);
            }
            const validatedResult = await EmailDomainValidator.validate(req.body.email);
            if (!validatedResult.isValidDomain) {
                throw new CustomError(return_codes.CLIENT_ERROR, messages.EMAIL_INVALID, error_codes.EMAIL_INVALID);
            }
        }

        if (!username) {
            username = null;
        }

        user = await userService.getUserByRequest(req.body, false);

        const pass = await authService.genPassword(password);

        if (!user) {
            user = {};
        }

        let insertedUser = await userService.createUser({
            ...user, email, username, password: pass, wallet,
            first_name, last_name, avatar_url, is_activated: false,
            client_id: client.id,
        });

        const code = await authService.genCode();
        await userService.updateCodeByEmail(code, email);

        const subject = 'Please active your account';

        let url = process.env.SSO_ROOT_DOMAIN + "/auth/active-user?code=" + code;
        const html = register(url)

        await mailService.sendMail(email, subject, html);

        res.status(200).json({
            success: true,
            data: insertedUser
        });

    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.activeUser = async (req, res, next) => {
    try {
        const code = req.query.code;

        await authService.isCodeActive(code);

        const user = await userService.getActiveUserByCode(code, false);
        if (user && user.username == null) {
            const client = await authService.getClientById(user.client_id);
            const noUser = await userService.getNoOfUser(user.client_id);
            user.username = `${client.client_id}_user_${noUser}`;
            await userService.updateUser(user);
        }
        await userService.updateIsActiveByCode(code, true);

        res.writeHead(301, {
            Location: process.env.GAME_MARKET_FRONTEND
        }).end();
    } catch (error) {
        if (error.message === 'jwt expired') {
            error = {http_code: return_codes.CLIENT_ERROR, error_msg: messages.URL_EXPIRED, error_code: error_codes.DATA_REQUEST_INVALID};
        } else if (error instanceof JsonWebTokenError || error instanceof NotBeforeError || error instanceof TokenExpiredError) {
            error = {http_code: return_codes.CLIENT_ERROR, error_msg: messages.URL_INVALID, error_code: error_codes.DATA_REQUEST_INVALID};
        }
        handleCatchError(error, res);
    }
}

exports.sendMailActiveUser = async (req, res, next) => {
    try {

    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.createClient = async (req, res, next) => {
    try {
        const { client_id, client_secret } = req.body;

        if (!client_secret || !client_id) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_INVALID, error_codes.CLIENT_INFO_INVALID);
        }
        const client = await authService.getClientByClientId(client_id);
        if (client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_ID_ALREADY_EXISTS, error_codes.CLIENT_ID_ALREADY_EXISTS);
        }
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
            if (err) {
                throw err;
            }

            let public_key = jwt.sign(publicKey, process.env.JWT_SECRET);
            let private_key = jwt.sign(privateKey, process.env.JWT_SECRET);
            let secret = jwt.sign(client_secret, process.env.JWT_SECRET);

            authService.createClient({ client_id, client_secret: secret, public_key, private_key }).then(client => {
                res.status(200).json({
                    client: {
                        id: client.id,
                        client_id: client.client_id
                    },
                    success: true
                });
            }).catch(error => {
                handleCatchError(error, res);
            });

        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.getClient = async (req, res, next) => {
    try {
        const {id} = req.params;

        const client = await authService.getClientById(id, 0);

        res.status(200).json({
            client: {
                id: client.id,
                client_id: client.client_id
            },
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.updateStatusClient = async (req, res, next) => {
    try {
        const { id, is_disabled } = req.body;

        if (is_disabled == null || is_disabled == undefined) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_MISSING, error_codes.DATA_BODY_MISSING);
        }

        if (!id) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_INVALID, error_codes.CLIENT_INFO_INVALID);
        }
        const client = await authService.getClientById(id);
        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_NOT_EXISTS, error_codes.CLIENT_NOT_EXISTS);
        }

        client.is_disabled = is_disabled;

        await authService.updateClient(client);
        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.updateSecretClient = async (req, res, next) => {
    try {
        const { id, client_secret_new } = req.body;

        if (!id || !client_secret_new) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_INVALID, error_codes.CLIENT_INFO_INVALID);
        }

        const client = await authService.getClientById(id);

        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_NOT_EXISTS, error_codes.CLIENT_NOT_EXISTS);
        }

        client.client_secret = jwt.sign(client_secret_new, process.env.JWT_SECRET);

        await authService.updateClient(client);
        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.deleteInvalidUser = async (req, res, next) => {
    /**
     * Check code valid or not
     * Check is_activated
     * */
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (user && user.is_activated) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CANNOT_DELETE_ACTIVATED_USER, error_codes.CANNOT_DELETE_ACTIVATED_USER);
        }

        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_DOES_NOT_EXIST_WITH_ID, error_codes.USER_WITH_ID_NOT_EXIST);
        }

        await userService.deleteUserById(id);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        handleCatchError(error, res);
    }
}