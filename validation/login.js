const { body } = require("express-validator");

exports.loginValidation = [

    body("email")
        .not()
        .isEmpty()
        .withMessage('email is  required'),

    body("password")
        .not()
        .isEmpty()
        .withMessage("Password is required"),
]

