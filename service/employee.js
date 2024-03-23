const models = require("../models")
const { signToken } = require("../utils/jwt");
const { paginationFromToDate, paginationWithFromTo } = require("../utils/pagination");
const sendEmail = require("../utils/sendEmail")
const moment = require('moment');
const Op = models.Sequelize.Op;
const Excel = require('exceljs');
const redisClient = require('../utils/redis');
const ErrorHandler = require("../utils/utility-class");
exports.register = async (reqBody) => {
    const { name, email, password, countryId, stateId, cityId, departmentName, designationName, gender, date_of_joining } = reqBody
    console.log(name)
    const employeeExists = await models.employee.findOne({
        where: { email: email }
    })
    if (employeeExists) {
       throw new ErrorHandler("Employee already Exists", 200)
    }
    else {
        const countryStateCity = await models.country.findOne({
            where: {
                id: countryId
            },
            include: [
                {
                    model: models.state,
                    as: "state",
                    where: {
                        id: stateId
                    },
                    include: [
                        {
                            model: models.city,
                            as: "city",
                            where: {
                                id: cityId
                            }
                        }
                    ]
                }
            ]
        })

        if (!countryStateCity) {
            
            throw new ErrorHandler("Invalid Country , State or City", 200)
        }


        const department = await models.department.findOne({
            where: {
                name: departmentName
            }
        })


        if (!department) {
            throw new ErrorHandler("Please Enter Valid department name", 200)
        }
        const designation = await models.designation.findOne({
            where: {
                name: designationName
            }
        })
        if (!designation) {
            throw new ErrorHandler("Please Enter Valid designation name", 200)
        }

        const result = await models.employee.create({
            name,
            email,
            password,
            gender,
            date_of_joining,
            countryId: countryStateCity.id,
            stateId: countryStateCity.state[0].id,
            cityId: countryStateCity.state[0].city[0].id,
            departmentId: department.id,
            designationId: designation.id
        })

        return {
            message: "Successfully Created Employee",
            data: result,
            status: 201
        }
    }

}



exports.login = async (reqBody) => {
    const { email, password } = reqBody
    const result = await models.employee.findOne({
        where: {
            email
        }
    })
    if (!result) {
        throw new ErrorHandler('User not found', 200)

    } else {
        const checkPassword = await result.comparePassword(password);
        if (checkPassword) {
            const accessToken = await signToken({
                email: result.email,
                id: result.id
            });
            const refreshToken = await signToken({
                email: result.email,
                id: result.id
            });

            await models.token.create({
                employeeId: result.dataValues.id,
                token: refreshToken
            })
            return {
                message: "User Login Successfully",
                token: accessToken,
                refreshToken: refreshToken,
                name: result.name,
                email: result.email,
                status: 200
            }
        } else {
            
            return {
                status: 400,
                message: "Wrong Credentials"
            }
        }
    }
}


exports.logout = async (req) => {
    const employee = await models.employee.findOne({
        where: { email: req.userDetails.email }
    })
    const remove = await models.token.destroy({
        where: { employee_id: employee.id }
    })
    return remove
}


exports.emailSend = async (reqBody) => {
    let employeeDetails = await models.employee.findOne({
        where: { email: reqBody.email }
    })

    let response = {};
    if (employeeDetails) {
        const otpCode = Math.floor((Math.random() * 10000) + 1);
        let createdTime = new Date();
        let expiryTime = moment.utc(createdTime).add(10, "m");
        await models.otp.create({
            email: reqBody.email,
            code: otpCode,
            expireIn: expiryTime
        })
        let text = `<html>
        <body style="text-align:center">
                <p style="font-size:28px"><b>Welcome to My Job App</b></p>
        <p style="font-size:20px">Your One Time Password(${otpCode}) is</p>
        <span style="font-size: 20px;
            border: 1px solid;
            border-radius: 7px;
            padding: 8px 50px;">8521</span>
        </body>
        </html>`;
        await sendEmail(reqBody.email, "OTP verification", text)
        response.statusType = "success"
        response.message = "please check your email"
        response.data = employeeDetails
    }
    else {
        response.statusType = "error"
        response.message = "email Id does not exist"
    }

    return response;
}

exports.resetPassword = async (reqBody) => {
    const todayDateTime = new Date();
    let verifyEmployee = await models.otp.findOne({
        where: { code: reqBody.otp }
    })
   
    console.log(verifyEmployee)
    if (verifyEmployee.expiryIn < todayDateTime) {
        throw new ErrorHandler('OTP is expired', 200)
    }

    let response = {};
    if (verifyEmployee != null) {
        verifyEmployee.destroy();



        let result = await models.employee.findOne({
            where: { email: reqBody.email }
        })
        if (result) {
            const hashpassword = await bcrypt.hash(reqBody.password, 10);
            await models.employee.update({
                password: hashpassword
            },
                {
                    where: { email: reqBody.email }
                })
            response.message = "Successfully change password"
            response.statusText = "Success"
            res.send(response);
        }
        else {
            response.message = "email not found"
            response.statusText = "error"
        }
    }
    else {
        response.message = "otp not matched"
        response.statusText = "error"
    }

    return response
}


exports.bulkCreateEmployee = async (uploadedData, fileId) => {
    let uploadedDataArray = [];
    if (uploadedData.length === 0) {
        await models.bulkUpload.update(
            { status: "failed" },
            { where: { id: fileId } },

        );
        throw new ErrorHandler("Employee not created", 200)
        // return { message: "Employee not created", error: true };
    } else {
        for (let index = 0; index < uploadedData.length; index++) {
            let dateOfJoining = convertExcelDate(uploadedData[index]['date_of_joining'])
            uploadedDataArray.push({
                name: uploadedData[index]['name'],
                email: uploadedData[index]['email'],
                gender: uploadedData[index]['gender'],
                departmentName: uploadedData[index]['departmentName'],
                designationName: uploadedData[index]['designationName'],
                date_of_joining: dateOfJoining,
                cityId: Number(uploadedData[index]['cityId']),
                stateId: Number(uploadedData[index]['stateId']),
                countryId: Number(uploadedData[index]['countryId']),
                fileId: fileId

            });


        }
        const uploadData = await models.employeeBulkCreate.bulkCreate(uploadedDataArray, { returning: true });
        for (let index = 0; index < uploadData.length; index++) {
            try {

                if (!['MALE', 'FEMALE', 'OTHER'].includes(uploadData[index].gender.toUpperCase())) {
                    updateEmployeeUploadStatus(false, 'invalid Gender', uploadData[index].id);
                    continue;
                }

                let custBody = {
                    name: uploadData[index].name,
                    email: uploadData[index].email,
                    gender: uploadData[index].gender.toLowerCase().replace(/^\w/, check => check.toUpperCase()),
                    departmentName: uploadData[index].departmentName,
                    designationName: uploadData[index].designationName,
                    stateId: uploadData[index].stateId,
                    cityId: uploadData[index].cityId,
                    countryId: uploadData[index].countryId,
                    date_of_joining: uploadData[index].date_of_joining

                }
                let employeeData = await this.register(custBody)
                if (employeeData.status != 201) {
                    updateEmployeeUploadStatus(false, employeeData.message, uploadData[index].id);
                    continue;
                } else {
                    updateEmployeeUploadStatus(true, null, uploadData[index].id,);
                }
            }
            catch (Error) {
                models.errorLogger.create({
                    message: JSON.stringify(Error.stack),
                    url: 'bulk Customer Create',
                    method: null,
                    host: null,
                    body: `${uploadData[index].email}`
                })
            }

        }

        models.bulkUpload.update(
            { status: "Success" },
            { where: { id: fileId } },
        );
        return { error: false, message: "Success" };
    }
}


exports.getEmployeeData = async (filters, isReport = false) => {

    try {
        const include = [
            { model: models.country, attributes: ["name"] },
            { model: models.state, attributes: ["name"] },
            { model: models.city, attributes: ["name"] },
            { model: models.designation, attributes: ["name"] },
            { model: models.department, attributes: ["name"] },
        ]
        if (!isReport) {
            const whereClause = {};

            const { search, offset, pageSize } = paginationWithFromTo(
                filters.search,
                filters.from,
                filters.to
            );
            if (filters.search) {
                whereClause.name = { [Op.iLike]: search + '%' }
            }
            if (filters.country) {
                whereClause['$country.name$'] = filters.country;
            }
            if (filters.state) {
                whereClause['$state.name$'] = filters.state;
            }
            if (filters.city) {
                whereClause['$city.name$'] = filters.city;
            }
            if (filters.dateOfJoining) {
                whereClause.date_of_joining = filters.dateOfJoining;
            }
            if (filters.fromDate) {
                const { fromDate, toDate } = paginationFromToDate(filters.fromDate, filters.toDate);

                whereClause.date_of_joining = {
                    [Op.and]: {
                        [Op.gte]: fromDate,
                        [Op.lte]: toDate
                    }
                }
            }
            if (filters.designation) {
                whereClause['$designation.name$'] = filters.designation;
            }
            if (filters.department) {
                whereClause['$department.name$'] = filters.department;
            }
            const employees = await models.employee.findAndCountAll({
                where: whereClause,
                include,
                limit: pageSize,
                offset: offset
            });

            if (employees.length === 0) {
                throw new ErrorHandler("Data Not Found", 200)
            }

            return {
                message: "Success",
                data: employees,
                status: 200
            }
        } else {
            const employees = await models.employee.findAll({
                include
            });
            return employees
        }

    } catch (error) {
        throw new ErrorHandler('Failed to fetch employees', 200)
    }
}



exports.country = async () => {
    const getCountryInRedis = await redisClient.get('country');
    let getCountry;
    if (getCountryInRedis) {
        getCountry = JSON.parse(getCountryInRedis)
    } else {
        getCountry = await models.country.findAll();
        let expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 48);
        await redisClient.setEx('country', parseInt(expireDate.getTime() / 1000), JSON.stringify(getCountry))
    }

    if (getCountry.length === 0) {
        throw new ErrorHandler("No Data Found", 200)
        // return {
        //     message: "No Data Found",
        //     data: getCountry,
        //     status: 200
        // }
    }

    return {
        message: "Success",
        data: getCountry,
        status: 200
    }
}

exports.state = async () => {
    const getStateInRedis = await redisClient.get('state');
    let getState;
    if (getStateInRedis) {
        getState = JSON.parse(getStateInRedis)
    } else {
        getState = await models.state.findAll();
        let expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 48);
        await redisClient.setEx('state', parseInt(expireDate.getTime() / 1000), JSON.stringify(getState))

    }

    if (getState.length === 0) {
        throw new ErrorHandler("No Data Found", 200)
        // return {
        //     message: "No Data Found",
        //     data: getState,
        //     status: 200
        // }
    }

    return {
        message: "Success",
        data: getState,
        status: 200
    }
}
exports.city = async () => {
    const getCityInRedis = await redisClient.get('city');
    let getCity;
    if (getCityInRedis) {
        getCity = JSON.parse(getCityInRedis)
    } else {
        getCity = await models.city.findAll();
        let expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 48);
        await redisClient.setEx('city', parseInt(expireDate.getTime() / 1000), JSON.stringify(getCity))

    }
    if (getCity.length === 0) {
        throw new ErrorHandler("No Data Found", 200)
        // return {
        //     message: "No Data Found",
        //     data: getCity,
        //     status: 200
        // }
    }

    return {
        message: "Success",
        data: getCity,
        status: 200
    }
}



exports.downloadEmployeeExcel = async () => {
    const getEmployeeData = await this.getEmployeeData(null, true);
    if (getEmployeeData && getEmployeeData.length === 0) {
        throw new ErrorHandler("No Data Found", 200)
    }


    let excelArray = [];
    let employeeData = getEmployeeData
    for (let i = 0; i < employeeData.length; i++) {
        let data = {
            name: employeeData[i].name,
            email: employeeData[i].email,
            gender: employeeData[i].gender,
            department: employeeData[i].department.name,
            designation: employeeData[i].designation.name,
            country: employeeData[i].country.name,
            state: employeeData[i].state.name,
            city: employeeData[i].city.name,
            dateOfJoining: employeeData[i].date_of_joining
        }

        excelArray.push(data)

    }
    const fileName = new Date().getTime();
    const options = {
        filename: `./public/employeeReport${fileName}.xlsx`
    };

    let workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    let worksheet = workbook.addWorksheet('sheet1');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 10 },
        { header: 'Email', key: 'email', width: 10 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Department', key: 'department', width: 10 },
        { header: 'Designation', key: 'designation', width: 10 },
        { header: 'Country', key: 'country', width: 10 },
        { header: 'State', key: 'state', width: 10 },
        { header: 'City', key: 'city', width: 10 },
        { header: 'DateOfJoining', key: 'dateOfJoining', width: 10 },

    ];

    for (let index = 0; index < excelArray.length; index++) {
        worksheet.addRow(excelArray[index]).commit();
        if (index % 10000 === 0) await Promise.resolve(true)
    }

    await workbook.commit();

    return {
        error: false,
        options,
        fileName
    }

}


exports.getCountryState = async(reqBody)=>{
    const result = await models.country.findAll({
        where:{
            name:reqBody.name
        },
        include:[
            {
                model:models.state,
                as:'state'
            }
        ]
    })

    return result
}

exports.getStateCity = async(reqBody)=>{
    const result = await models.state.findAll({
        where:{
            name:reqBody.name
        },
        include:[
            {
                model:models.city,
                as:'city'
            }
        ]
    })

    return result
}


const updateEmployeeUploadStatus = (isSuccess, message, bulkUploadId) => {
    models.employeeBulkCreate.update({
        status: isSuccess ? 'Success' : 'Fail',
        message: message
    }, {
        where: {
            id: bulkUploadId
        }
    });
    return;
}


const convertExcelDate = (serialNumber) => {
    const millisecondsSince1900 = (serialNumber - 1) * 24 * 60 * 60 * 1000;
    const date = moment.utc([1900, 0, 1]).add(millisecondsSince1900, 'milliseconds');
    const formattedDate = date.format('YYYY-MM-DD');

    return formattedDate;
};