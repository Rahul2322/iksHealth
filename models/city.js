module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('city', {
        // attributes
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'city',
        timestamps: false
    });

    City.associate = function (models) {
        City.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
    }
    return City;
}