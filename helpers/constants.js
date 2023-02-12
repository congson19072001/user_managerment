require('dotenv').config()
const return_codes = {
    ERROR_SSO: 500, // if handler in server is invalid
    CLIENT_ERROR: 400, // if client data is invalid
    TOKEN_ERROR: 401,
    SUCCESS: 200,
}

const error_codes = {
    DATA_REQUEST_INVALID: 'DATA_REQUEST_INVALID',
    NOT_PERMISSION: 'NOT_PERMISSION',
    ERROR_SSO: 'ERROR_SSO',

    //request params || path variable || header
    HEADER_AUTHORIZATION_ERROR: 'HEADER_AUTHORIZATION_ERROR',
    HEADER_AUTHORIZATION_EMPTY: 'HEADER_AUTHORIZATION_EMPTY',
    TOKEN_INVALID: 'TOKEN_INVALID',
    ADMIN_TOKEN_INVALID: 'ADMIN_TOKEN_INVALID',
    ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
    BEARER_TOKEN_INVALID: 'BEARER_TOKEN_INVALID',
    CANNOT_DELETE_ACTIVATED_USER: 'CANNOT_DELETE_ACTIVATED_USER',

    //data body
    DATA_BODY_INVALID: 'DATA_BODY_INVALID',
    DATA_BODY_MISSING: 'DATA_BODY_MISSING',
    DATA_BODY_IS_EMPTY: 'DATA_BODY_IS_EMPTY',
    DUPLICATE_PASSWORD: 'DUPLICATE_PASSWORD',
    NEW_OLD_CLIENT_SECRET_SAME: 'NEW_OLD_CLIENT_SECRET_SAME',
    CLIENT_INFO_EMPTY: 'CLIENT_INFO_EMPTY',
    REFRESH_TOKEN_EMPTY: 'REFRESH_TOKEN_EMPTY',
    ACCESS_TOKEN_EMPTY: 'ACCESS_TOKEN_EMPTY',
    TOKEN_ERROR: 'TOKEN_ERROR',
    URL_EXPIRED: 'URL_EXPIRED',
    URL_INVALID: 'URL_INVALID',
    CLIENT_INFO_INVALID: 'CLIENT_INFO_INVALID',
    CLIENT_INFO_MISSING: 'CLIENT_INFO_MISSING',
    NON_RECORDED_CLIENT: 'NON_RECORDED_CLIENT',
    NON_RECORDED_CLIENT_WITH_ID: 'NON_RECORDED_CLIENT_WITH_ID',
    CLIENT_ID_INVALID: 'CLIENT_ID_INVALID',
    EMAIL_INVALID: 'EMAIL_INVALID',
    USER_DOES_NOT_EXIST_WITH_THIS_EMAIL: 'USER_DOES_NOT_EXIST_WITH_THIS_EMAIL',
    USER_DOES_NOT_EXIST_WITH_ID: 'USER_DOES_NOT_EXIST_WITH_ID',
    WALLET_INVALID: 'WALLET_INVALID',
    SIGNATURE_INVALID: 'SIGNATURE_INVALID',
    CODE_RESET_PASS_INVALID: 'CODE_RESET_PASS_INVALID',
    CODE_NOT_ACTIVE: 'CODE_NOT_ACTIVE',
    USER_INVALID: 'USER_INVALID',
    USER_WITH_ID_NOT_EXIST: 'USER_WITH_ID_NOT_EXIST',
    DUPLICATED_USERNAME: 'DUPLICATED_USERNAME',
    USERNAME_IS_EMPTY: 'USERNAME_IS_EMPTY',
    DUPLICATED_EMAIL: 'DUPLICATED_EMAIL',
    DUPLICATED_WALLET: 'DUPLICATED_WALLET',
    WALLET_ALREADY_EXISTS_BUT_NOT_ACTIVATED: 'WALLET_ALREADY_EXISTS_BUT_NOT_ACTIVATED',
    CLIENT_ALREADY_EXISTS: 'CLIENT_ALREADY_EXISTS',
    CLIENT_ID_ALREADY_EXISTS: 'CLIENT_ID_ALREADY_EXISTS',
    CLIENT_NOT_EXISTS: 'CLIENT_NOT_EXISTS',
    USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    PASSWORD_IS_FALSE: 'PASSWORD_IS_FALSE',
    PASSWORD_LOGIN_INVALID_LIMIT: 'PASSWORD_LOGIN_INVALID_LIMIT',

    //oauth2
    INVALID_OR_MISSING_GRANT_TYPE: 'INVALID_OR_MISSING_GRANT_TYPE',
    INVALID_OR_MISSING_CLIENT_ID: 'INVALID_OR_MISSING_CLIENT_ID',
    MISSING_CLIENT_SECRET: 'MISSING_CLIENT_SECRET',
    INVALID_CLIENT_CREDENTIALS: 'INVALID_CLIENT_CREDENTIALS',
    NO_CODE_PARAMETER: 'NO_CODE_PARAMETER',
    INVALID_CODE: 'INVALID_CODE',
    CODE_HAS_EXPIRED: 'CODE_HAS_EXPIRED',
    NO_USER_USERID_RETURNED: 'NO_USER_USERID_RETURNED',
    MISSING_EMAIL_OR_PASSWORD: 'MISSING_EMAIL_OR_PASSWORD',
    NO_REFRESH_TOKEN_PARAMETER: 'NO_REFRESH_TOKEN_PARAMETER',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    NO_USER_USERID_RETURNED_FROM_GET_REFRESH_TOKEN: 'NO_USER_USERID_RETURNED_FROM_GET_REFRESH_TOKEN',
    MISSING_CLIENT_ID_AND_CLIENT_SECRET: 'MISSING_CLIENT_ID_AND_CLIENT_SECRET',
    INVALID_REQUEST: 'INVALID_REQUEST',
    GRANT_TYPE_IS_UNAUTHORISED: 'GRANT_TYPE_IS_UNAUTHORISED',
    ONLY_ONE_METHOD_MUST_BE_AUTHENTICATE_AT_A_TIME: 'ONLY_ONE_METHOD_MUST_BE_AUTHENTICATE_AT_A_TIME',
    ACCESS_TOKEN_NOT_FOUND: 'ACCESS_TOKEN_NOT_FOUND',
    MALFORMED_AUTH_HEADER: 'MALFORMED_AUTH_HEADER',
    METHOD_CANNOT_GET: 'METHOD_CANNOT_GET',
}

const dynamic_data = {
    PASSWORD_LOGIN_INVALID_LIMIT: {value_1: Number.parseInt(process.env.LOGIN_BLOCK_TIME) / (60 * 1000)}
}


const messages = {
    DATA_REQUEST_INVALID: 'Request data invalid',
    NOT_PERMISSION: 'You do not have permission',
    ERROR_SSO: 'Some error happen is sso server',

    //request params || path variable || header
    HEADER_AUTHORIZATION_ERROR: 'Authorization header invalid',
    HEADER_AUTHORIZATION_EMPTY: 'Authorization header is empty',
    ACCESS_TOKEN_INVALID: 'The access token provided is invalid',
    ADMIN_TOKEN_INVALID: 'The admin token provided is invalid',
    ACCESS_TOKEN_EXPIRED: 'The access token provided is expired',
    REFRESH_TOKEN_INVALID: 'The refresh token provided is invalid',
    REFRESH_TOKEN_EXPIRED: 'The refresh token provided is expired',
    BEARER_TOKEN_INVALID: 'Bearer token invalid',
    CANNOT_DELETE_ACTIVATED_USER: 'You cannot delete activated user',

    //data body
    DATA_BODY_INVALID: 'Body data invalid',
    DATA_BODY_MISSING: 'Body data is missing',
    DATA_BODY_IS_EMPTY: 'Body data is empty',
    DUPLICATE_PASSWORD: 'The new password cannot be the same as the old password',
    NEW_OLD_CLIENT_SECRET_SAME: 'New client secret and old client secret is similar',
    CLIENT_INFO_EMPTY: 'Client id or client secret is empty',
    REFRESH_TOKEN_EMPTY: 'Refresh token is empty',
    ACCESS_TOKEN_EMPTY: 'Access token is empty',
    TOKEN_ERROR: 'Token type is not right or token is inactive',
    URL_EXPIRED: 'URL expired',
    URL_INVALID: 'URL invalid',
    CLIENT_INFO_INVALID: 'Client id or client secret invalid',
    CLIENT_INFO_MISSING: 'Client info is missing some fields',
    NON_RECORDED_CLIENT: 'Client with this id and secret does not exist.',
    NON_RECORDED_CLIENT_WITH_ID: 'Client with this id does not exist.',
    CLIENT_ID_INVALID: 'Client id invalid',
    EMAIL_INVALID: 'Email invalid',
    USER_DOES_NOT_EXIST_WITH_THIS_EMAIL: 'User does not exist with this email',
    WALLET_INVALID: 'Wallet address invalid',
    SIGNATURE_INVALID: 'Signature invalid',
    USER_WITH_ID_NOT_EXIST: 'User id in access token invalid',
    USER_DOES_NOT_EXIST_WITH_ID: 'User does not exist with this id',
    CODE_RESET_PASS_INVALID: 'Code to reset password invalid',
    CODE_NOT_ACTIVE: 'Code is inactive',
    USER_INVALID: 'User credentials are invalid',
    DUPLICATED_USERNAME: 'This username already in use, please use other username',
    USERNAME_IS_EMPTY: 'Username is empty',
    DUPLICATED_EMAIL: 'This email already registered, please check',
    DUPLICATED_WALLET: 'This wallet was registered, please check',
    WALLET_ALREADY_EXISTS_BUT_NOT_ACTIVATED: 'Your wallet already registered but not activated, please check',
    CLIENT_ALREADY_EXISTS: 'Client already exists',
    CLIENT_ID_ALREADY_EXISTS: 'Client id already exists',
    CLIENT_NOT_EXISTS: 'Client does not exists',
    PASSWORD_IS_FALSE: "The password you entered didn't match our record",
    PASSWORD_LOGIN_INVALID_LIMIT: `Temporary locked the account. Please retry within ${dynamic_data.PASSWORD_LOGIN_INVALID_LIMIT.value_1} minutes!.`,

    // oauth2
    INVALID_OR_MISSING_GRANT_TYPE: 'Invalid or missing grant_type parameter',
    INVALID_OR_MISSING_CLIENT_ID: 'Invalid or missing client_id parameter',
    MISSING_CLIENT_SECRET: 'Missing client_secret parameter',
    INVALID_CLIENT_CREDENTIALS: 'Client credentials are invalid',
    NO_CODE_PARAMETER: 'No "code" parameter',
    INVALID_CODE: 'Invalid code',
    CODE_HAS_EXPIRED: 'Code has expired',
    NO_USER_USERID_RETURNED: 'No user/userId parameter returned from getauthCode',
    MISSING_EMAIL_OR_PASSWORD: 'Missing parameters. "email" and "password" are required',
    NO_REFRESH_TOKEN_PARAMETER: 'No "refresh_token" parameter',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    USERNAME_ALREADY_EXISTS: 'Username already exists',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    NO_USER_USERID_RETURNED_FROM_GET_REFRESH_TOKEN: 'No user/userId parameter returned from getRefreshToken',
    MISSING_CLIENT_ID_AND_CLIENT_SECRET: 'Missing parameters. "client_id" and "client_secret" are required',
    INVALID_REQUEST: 'Invalid request.',
    GRANT_TYPE_IS_UNAUTHORISED: 'The grant type is unauthorised for this client_id',
    ONLY_ONE_METHOD_MUST_BE_AUTHENTICATE_AT_A_TIME: 'Only one method may be used to authenticate at a time (Auth header,  ' +
        'GET or POST).',
    ACCESS_TOKEN_NOT_FOUND: 'The access token was not found',
    MALFORMED_AUTH_HEADER: 'Malformed auth header',
    METHOD_CANNOT_GET: 'Method cannot be GET When putting the token in the body.',
}

Object.freeze(return_codes);
Object.freeze(dynamic_data);
Object.freeze(messages);
Object.freeze(error_codes);

module.exports = {
    return_codes,
    messages,
    error_codes,
    dynamic_data
}