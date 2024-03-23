const models = require('../models');
exports.errorMiddleware = (error, req, res, next) => {
    error.message ||= "Internal Server Error";
    error.statusCode ||= 500;

    models.errorLogger.create({
        message: error.message,
        stackTrace: error.stack,
        url: req.url,
        method: req.method,
        host: req.hostname,
        body: JSON.stringify(req.body)
    }).then(() => {
      
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }).catch(error => {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    });
};
