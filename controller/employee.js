const employeeService = require("../service/employee");
const { bulkFileUpload } = require("../utils/bulkUpload");
const multer = require('multer')
const models = require("../models");
const { removeFile } = require("../utils/removeFile");
const fs = require('fs')

const register = async (req, res) => {
    const result = await employeeService.register(req.body);
    res.status(result.status).json({ data: result.message, message: "Registered Successfully" });

};

const login = async (req, res) => {
    const result = await employeeService.login(req.body);
    res.status(result.status).json({ message: result });

};
const logout = async (req, res) => {
    try {
        const result = await employeeService.logout(req);
        res.status(200).json({ message: "Logged out successfully", result });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
};

const forgotPassword = async (req, res) => {
    const getEmployee = await employeeService.emailSend(req.body);
    res.status(200).json(getEmployee);
};


const changePassword = async (req, res) => {
    const getData = await employeeService.resetPassword(req.body);
    res.status(200).json(getData)
};

const bulkUpload = async (req, res) => {
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const extArray = file.originalname.split(".");
            const extension = extArray[extArray.length - 1];
            cb(null, `${Date.now()}.${extension}`);
        },
        destination: "public/bulkUploads/"
    });

    const uploads = multer({
        storage,
        limits: { fileSize: 1024 * 1024 * 10 }, 
        fileFilter: function (req, file, cb) {
            if (file.originalname.endsWith('.xlsx')) {
                cb(null, true);
            } else {
                cb(new Error('File type not supported'));
            }
        }
    }).single("avatar");

    uploads(req, res, async err => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        req.file.url = req.file.destination + req.file.filename;
        try {
            let uploadFile = await models.bulkUpload.create(req.file);
            res.status(200).json({ uploadFile });
        } catch (error) {
            res.status(500).json({ error: 'Error while uploading file' });
        }
    });
  
}


const employeeBulkUpload = async (req, res) => {
    let columnKeys = [ "name", "email","countryId", "stateId", "cityId", "departmentName", "designationName" ,"gender" ,"date_of_joining"];
    const parseFile = await bulkFileUpload(req.body.fileId, req.body.fileExtension, req.body.path,columnKeys);
    if (parseFile.error) {
        return { message: parseFile.message, error: true }
    }
    const uploadedData = parseFile.parsedArrray;
    const employeeBulkInsert = await employeeService.bulkCreateEmployee(uploadedData,req.body.fileId);
    if (employeeBulkInsert.error) {
        return res.status(404).json({
            message: employeeBulkInsert.message
        });
    }

    return res.status(200).json({
        message: employeeBulkInsert.message
    });

}


const getEmployeeData = async (req,res)=>{
    const getData = await employeeService.getEmployeeData(req.query);
    return res.status(getData.status).json({
        message:getData.message,
        data:getData.data
        
    })
}
const getCountry = async (req,res)=>{
    const getData = await employeeService.country();
    return res.status(getData.status).json({
        message:getData.message,
        data:getData.data
        
    })
}
const getState = async (req,res)=>{
    const getData = await employeeService.state();
    return res.status(getData.status).json({
        message:getData.message,
        data:getData.data
        
    })
}
const getCity = async (req,res)=>{
    const getData = await employeeService.city();
    return res.status(getData.status).json({
        message:getData.message,
        data:getData.data
        
    })
}

const getEmployeeExcel = async(req,res)=>{
    const getEmployeeExcel = await employeeService.downloadEmployeeExcel();
    if(getEmployeeExcel.error){
        return res.status(getEmployeeExcel.status).json({
            data:getEmployeeExcel.data
        })
    }
    const stat = fs.statSync(getEmployeeExcel.options.filename);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader("Content-Disposition", "attachment; filename=" + `employeeReport${getEmployeeExcel.fileName}.xlsx`);
    res.setHeader('Content-Length', stat.size); 
    res.download(getEmployeeExcel.options.filename);
    removeFile(getEmployeeExcel.options.filename);
}


const getStateBasedOnCountry = async(req,res)=>{
    const data = await employeeService.getCountryState(req.body);
    return res.status(200).json(data)

}
const getCityBasedOnState = async(req,res)=>{
    const data = await employeeService.getStateCity(req.body);
    return res.status(200).json(data)

}



module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    changePassword,
    bulkUpload,
    employeeBulkUpload,
    getEmployeeData,
    getCountry,
    getState,
    getCity,
    getEmployeeExcel,
    getStateBasedOnCountry,
    getCityBasedOnState
}