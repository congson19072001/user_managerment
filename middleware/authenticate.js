const {CustomError, handleCatchError} = require("../helpers/custom-error");
const {return_codes, messages, error_codes} = require("../helpers/constants");
const jwt = require("jsonwebtoken");
const userService = require("../services/users.service");

exports.checkAccessToken = async (req, res, next) => {
    try {
        if (
            !req.headers
            || !req.headers.authorization
        ) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.HEADER_AUTHORIZATION_ERROR, error_codes.HEADER_AUTHORIZATION_ERROR);
        }

        let authorization = req.headers.authorization;
        let arr = authorization.split(" ");

        if (!arr[1]) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ACCESS_TOKEN_INVALID, error_codes.TOKEN_INVALID);
        }

        let data = {};
        data = jwt.decode(arr[1]);
        if (!data) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ACCESS_TOKEN_INVALID, error_codes.TOKEN_INVALID);
        }
        if (Date.now() >= data.exp * 1000) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ACCESS_TOKEN_EXPIRED, error_codes.ACCESS_TOKEN_EXPIRED);
        }

        let user = await userService.getActiveUserById(data.userId);
        if (!user) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.USER_WITH_ID_NOT_EXIST, error_codes.TOKEN_INVALID);
        }

        // pass data through next middleware
        req.data = data;
        req.user = user;

        next();
    } catch (error) {
        handleCatchError(error, res);
    }
}

exports.checkAdminAccessToken = async (req, res, next) => {
    try {
        if (
            !req.headers
            || !req.headers.authorization
        ) {
            throw new CustomError(return_codes.CLIENT_ERROR, messages.HEADER_AUTHORIZATION_ERROR, error_codes.HEADER_AUTHORIZATION_ERROR);
        }

        let authorization = req.headers.authorization;
        let arr = authorization.split(" ");

        if (!arr[1]) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ADMIN_TOKEN_INVALID, error_codes.TOKEN_INVALID);
        }

        let data = {};
        data = jwt.decode(arr[1]);
        if (!data) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ADMIN_TOKEN_INVALID, error_codes.TOKEN_INVALID);
        }
        if (Date.now() >= data.exp * 1000) {
            throw new CustomError(return_codes.TOKEN_ERROR, messages.ADMIN_TOKEN_INVALID, error_codes.TOKEN_INVALID);
        }

        next();
    } catch (error) {
        handleCatchError(error, res);
    }
}
