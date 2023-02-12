const { handleCatchError, CustomError } = require("../helpers/custom-error");
const userService = require("../services/users.service");
const {return_codes, messages, error_codes} = require("../helpers/constants");
const http = require("http");
const authService = require("../services/auth.service");

exports.userInfo = async (req, res, next) => {
    try {
        if (!req || !req.oauth || !req.oauth.bearerToken || !req.oauth.bearerToken.userId) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.BEARER_TOKEN_INVALID, error_codes.BEARER_TOKEN_INVALID);
        }

        let user = await userService.getActiveUserById(req.oauth.bearerToken.userId);
        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_INVALID, error_codes.USER_INVALID);
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.userInfoById = async (req, res, next) => {
    try {
        if (!req.body.client_id || !req.body.client_secret) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.CLIENT_INFO_EMPTY, error_codes.CLIENT_INFO_EMPTY);
        }
        let client = await authService.getClientByClientIdAndSecret(req.body.client_id, req.body.client_secret);
        if (!client) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.NON_RECORDED_CLIENT, error_codes.NON_RECORDED_CLIENT);
        }
        let user = await userService.getActiveUserById(req.params.id);

        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_INVALID, error_codes.USER_INVALID);
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        handleCatchError(error, res);
    }
}


exports.updateUserInfo = async (req, res, next) => {
    try {
        const {username, first_name, last_name, avatar_url, background_url} = req.body;
        const data = req.data;
        console.log('data: ', data);
        const loginUser = req.user;

        let user = await userService.getUserByUsername(username);
        if (user && loginUser.username != username) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USERNAME_ALREADY_EXISTS, error_codes.USERNAME_ALREADY_EXISTS);
        } else {
            user = await userService.getActiveUserById(data.userId);
        }

        let avatar = avatar_url ? {avatar_url} : {};
        let background = background_url ? {background_url} : {};
        let updateUser = {...user, username, first_name, last_name, ...avatar, ...background};

        if (req.body) {
            user = await userService.updateUser(updateUser);
        } else {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_IS_EMPTY, error_codes.DATA_BODY_IS_EMPTY);
        }

        res.status(200).json({
            success: true,
            data: user,
        })
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.updateUserStatus = async (req, res, next) => {
    try {
        const {isDisabled, email} = req.body;

        let user = await userService.getFullUserByEmail(email, true);

        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL, error_codes.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL);
        }
        if (req.body && email) {

            user.is_disabled = isDisabled;
            user = await userService.updateUser({...user});
        } else {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.DATA_BODY_IS_EMPTY, error_codes.DATA_BODY_IS_EMPTY);
        }

        delete user.password;
        delete user.code;
        res.status(200).json({
            success: true,
            data: user,
        })
    } catch (error) {
        handleCatchError(error, res);
    }
}