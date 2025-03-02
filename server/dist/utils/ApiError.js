"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(statusCode, message, success = false) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = success;
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.default = ApiError;
