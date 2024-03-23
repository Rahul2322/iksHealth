const { body } = require("express-validator");

exports.employeeValidation = [
    body("name")
        .not()
        .isEmpty()
        .withMessage('Name is  required'),

    body("email")
        .not()
        .isEmpty()
        .withMessage('email is  required'),

    body("password")
        .not()
        .isEmpty()
        .withMessage("Password is required"),
    body("departmentName")
        .not()
        .isEmpty()
        .withMessage("Department Name is required"),
    body("designationName")
        .not()
        .isEmpty()
        .withMessage("Designation Name is required"),
    body("gender")
        .not()
        .isEmpty()
        .withMessage("Gender is required"),
    body("date_of_joining")
        .not()
        .isEmpty()
        .withMessage("Date Of Joining is required"),
    body("countryId")
        .not()
        .isEmpty()
        .withMessage("CountryId is required"),
    body("cityId")
        .not()
        .isEmpty()
        .withMessage("CityId is required"),
    body("stateId")
        .not()
        .isEmpty()
        .withMessage("StateId  is required"),
]

