let xlsx2json = require('xlsx2json'); 
const _ = require('lodash');
const models = require("../models")
exports.bulkFileUpload = async(fileId, fileExtension, path , columnKeys) => {

    let parsedArrray = [];

        if (fileExtension === "xlsx") {
        let data = await xlsx2json(path);
        console.log("data",data[0])
        const dataArray = data[0];
        if (dataArray.length != 0) {
            const finalArray = await dataArray.reduce(
                (object, item, index) => {
                    if (index === 0) {
                        object.mapper = item;
                        return object;
                    }
                    const data = {};
                    Object.keys(item).forEach((key) => {
                        data[object.mapper[key].replace(/\s/g, "")] = item[key];
                    });
                    object.data.push(data);
                    return object;
                },
                { mapper: {}, data: [] }
            );  
            if (finalArray.data.length != 0) {
                let keys = columnKeys;
                let checkData =  _.keysIn(finalArray.data[0]);
                let checkValues =  _.difference(keys, checkData);
                if (checkValues.length != 0) {
                    await models.bulkUpload.update(
                    { status: "error" },
                    { where: { id: fileId } },
                    );
                    throw new ErrorHandler("Incorrect excel file", 200)
                }
            } else {
              await models.bulkUpload.update(
                { status: "error" },
                { where: { id: fileId } },
              );
              throw new ErrorHandler("Incorrect excel file", 200)
              //return { message: "Incorrect excel file" , error:true};
            }
            parsedArrray = finalArray.data
        }
        else {
            await models.bulkUpload.update(
                { status: "error" },
                { where: { id: fileId } },
            );
            throw new ErrorHandler("Incorrect excel file", 200)
            //return { message: "Incorrect excel file" , error:true};
        }
    } else {
        throw new ErrorHandler("Incorrect excel file", 200)
        //return { message: "Incorrect file format" , error:true};
    }

    return {parsedArrray, error:false};
}