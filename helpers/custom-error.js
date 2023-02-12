class CustomError extends Error {
    constructor(http_code, error_msg, error_code, ...params) {
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }

        this.name = 'CustomError';
        this.http_code = http_code;
        this.error_code = error_code;
        this.error_msg = error_msg;
    }
}

const handleCatchError = function ({http_code, message, error_msg, error_code}, res) {
    if (http_code && error_msg && error_code) {
        res.status(http_code).json({
            success: false,
            code: http_code,
            error: message || error_msg,
            error_code: error_code
        });
    } else {
        res.status(500).json({
            success: false,
            code: 500,
            error: 'Server has error',
            error_code: 105
        });
    }
}

module.exports = {CustomError, handleCatchError};