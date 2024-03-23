const bcrypt = require("bcryptjs");

module.exports = (sequelize, Sequelize) => {
    const EmployeeBulkCreate = sequelize.define("employeeBulkCreate", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        gender: {
            type: Sequelize.ENUM('Male', 'Female', 'Other'),
            allowNull: false,

        },
        date_of_joining: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        countryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        stateId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        cityId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        departmentName: {
            type: Sequelize.STRING
        },
        designationName: {
            type: Sequelize.STRING
        },
        fileId: {
            type: Sequelize.INTEGER,
        },
        message: {
            type: Sequelize.TEXT,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: "processing",
        },
    }, {
        freezeTableName: true,
        tableName: "employeeBulkCreate",
        modelName: 'EmployeeBulkCreate',
    });


 

    EmployeeBulkCreate.associate = function (models) {
        EmployeeBulkCreate.belongsTo(models.bulkUpload , { foreignKey: 'fileId', as: 'file' })
    }

    return EmployeeBulkCreate;
};
