const redis = require('redis');
// const redisConn = require('../config/redis');

const log = (type, fn) => fn ? () => {
    console.log(`connection ${type}`);
} : console.log(`connection ${type}`);



const client = redis.createClient(6379, "127.0.0.1", {
    retry_strategy: (options) => {
        const { error, total_retry_time, attempt } = options;
        if (error && error.code === "ECONNREFUSED") {
            log(error.code);
        }
        if (total_retry_time > 1000 * 15) {
            log('Retry time exhausted');
        }
        if (options.attempt > 10) {
            log('10 attempts done');

        }

        return Math.min(3000);
    },
});

client.connect()
client.on('connect', log('connect', true));
client.on('ready', log('ready', true));
client.on('reconnecting', log('reconnecting', true));
client.on('error', log('error', true));
client.on('end', log('end', true));

module.exports = client;
