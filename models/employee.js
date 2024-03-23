const bcrypt = require("bcryptjs");

module.exports = (sequelize, Sequelize) => {
    const Employee = sequelize.define("employee", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        password: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                isEmail: true,
            },
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
        departmentId: {
            type: Sequelize.INTEGER
        },
        designationId: {
            type: Sequelize.INTEGER
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Assuming isActive defaults to true
        },
    }, {
        freezeTableName: true,
        tableName: "employee",
        modelName: 'Employee',
    });

    //associations
    //   User.associate = function (models) {
    //     User.belongsToMany(models.role, { through: models.userRole });
    //   };

    // Hash password before creating a user
    Employee.beforeCreate(async (employee, options) => {
        if (employee.password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(employee.password, salt);
            employee.password = hash;
        }
    });

    //compare password
    Employee.prototype.comparePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    Employee.associate = function (models) {
        Employee.belongsTo(models.department, { foreignKey: 'departmentId' });
        Employee.belongsTo(models.designation, { foreignKey: 'designationId' });
        Employee.belongsTo(models.country, { foreignKey: 'countryId' });
        Employee.belongsTo(models.state, { foreignKey: 'stateId' });
        Employee.belongsTo(models.city, { foreignKey: 'cityId' });
    }

    return Employee;
};
