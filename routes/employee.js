var express = require('express');
const { register, login ,forgotPassword , changePassword, bulkUpload, employeeBulkUpload , getEmployeeData, getCountry, getState, getCity, getEmployeeExcel, logout, getStateBasedOnCountry, getCityBasedOnState} = require('../controller/employee');
const { wrapper } = require('../utils/errorWrap');
const { verifyTokenMiddleware } = require('../middleware/checkAuth');
const { employeeValidation } = require('../validation/register');
const { loginValidation } = require('../validation/login');
const expressValidator = require("../middleware/validationError")
var router = express.Router();


router.post('/register',employeeValidation,expressValidator, wrapper(register))
router.post('/login',loginValidation,expressValidator, wrapper(login))
router.post("/forgot-password",verifyTokenMiddleware, wrapper(forgotPassword))
router.post('/change-password',verifyTokenMiddleware, wrapper(changePassword))
router.delete('/logout', verifyTokenMiddleware, wrapper(logout))
router.post('/bulk-upload',verifyTokenMiddleware,wrapper(bulkUpload))
router.post('/bulk-create',verifyTokenMiddleware,wrapper(employeeBulkUpload))
router.get('/',verifyTokenMiddleware,wrapper(getEmployeeData))
router.get('/country',wrapper(getCountry))
router.get('/state',wrapper(getState))
router.post('/country',wrapper(getStateBasedOnCountry))
router.get('/city',wrapper(getCity))
router.post('/state',wrapper(getCityBasedOnState))
router.get('/download',getEmployeeExcel)

module.exports = router;
