module.exports = (sequelize, Sequelize) => {
    const Department = sequelize.define("department", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Assuming isActive defaults to true
      },
    }, {
      freezeTableName: true,
      tableName: "department",
      modelName: 'Department',
    })

    
    Department.associate = function (models) {
        Department.hasMany(models.employee, { foreignKey: 'departmentId', as: 'department' });
    }

    return Department;
}


