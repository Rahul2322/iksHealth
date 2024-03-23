module.exports = (sequelize, Sequelize) => {
    const Country = sequelize.define('country', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'country',
        timestamps: false
    });

    Country.associate = function (models) {
        Country.hasMany(models.state, { foreignKey: 'countryId', as: 'state' });
    }
    return Country;
}