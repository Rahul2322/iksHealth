module.exports = (sequelize, Sequelize) => {
    const Token = sequelize.define('token', {
      employeeId: {
        type: Sequelize.INTEGER,
        field: "employee_id",
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "token"
      },
    }, {
      freezeTableName: true,
      tableName: "token",
    })

    Token.associate = function (models) {
        Token.belongsTo(models.employee, { foreignKey: 'employeeId', as: 'singleUser' });
    }


    return Token
  }