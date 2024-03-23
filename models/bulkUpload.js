module.exports = (sequelize, Sequelize) => {
    const BulkUpload = sequelize.define('bulkUpload', {
        filename: {
            type: Sequelize.TEXT,
        },
        mimetype: {
            type: Sequelize.TEXT,
        },
        encoding: {
            type: Sequelize.TEXT,
        },
        originalname: {
            type: Sequelize.TEXT,
        },
        url: {
            type: Sequelize.TEXT,
        },
        type: {
            type: Sequelize.TEXT,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: "loading",
        }
    }, {
        freezeTableName: true,
        tableName: 'bulk_upload',
    });

    // This will return required JSON.

    // BulkUpload.prototype.toJSON = function () {
    //     let values = Object.assign({}, this.get());
    //     if (process.env.FILE_TO_AWS == 'true') {
    //         values.URL = process.env.BASE_URL + values.url;
    //     } else {
    //         values.URL = process.env.BASE_URL + values.url;
    //         let filePath = values.url;
    //         let pathToadd = filePath.replace('public/', '');
    //         values.URL = process.env.BASE_URL + pathToadd;
    //     }
    //     delete values.encoding;
    //     return values;
    // }

    return BulkUpload;
}