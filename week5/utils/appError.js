const appError = (status, errName, errMessage, next) => {
    const error = new Error(errMessage || '');
    error.status = status || 500;
    error.name = errName || 'error';
    next(error);
}

module.exports = appError;