module.exports = (sequelize, Sequelize) => {
    const Designation = sequelize.define("designation", {
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
      tableName: "designation",
      modelName: 'Designation',
    })

    
    Designation.associate = function (models) {
        Designation.hasMany(models.employee, { foreignKey: 'designationId', as: 'designation' });
    }

    return Designation;
}

