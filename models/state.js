module.exports = (sequelize, Sequelize) => {
    const State = sequelize.define('state', {
        // attributes
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        countryId:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'state',
        timestamps: false
    });

    State.associate = function(models) {
        State.hasMany(models.city, { foreignKey: 'stateId', as: 'city' });
        State.belongsTo(models.country, { foreignKey: 'countryId', as: 'country' });
    }


    return State;
}