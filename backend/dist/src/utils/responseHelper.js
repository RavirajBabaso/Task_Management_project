"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'Error', statusCode = 500, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {})
    });
};
exports.errorResponse = errorResponse;
