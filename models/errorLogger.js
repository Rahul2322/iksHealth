module.exports = (sequelize, Sequelize) => {
    const ErrorLogger = sequelize.define('errorLogger', {
        message: {
            type: Sequelize.TEXT,
        },
        url: {
            type: Sequelize.STRING,
        },
        method: {
            type: Sequelize.STRING,
        },
        host: {
            type: Sequelize.STRING,
        },
        body: {
            type: Sequelize.TEXT,
        },
        userData: {
            type: Sequelize.TEXT,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: sequelize.fn('now')
        }

    }, {
        freezeTableName: true,
        tableName: 'error_logger',
        timestamps: false
    });

    return ErrorLogger;
}