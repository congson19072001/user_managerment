const {createClient} = require("redis");
require('dotenv').config();

const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;
const redis_db_number = process.env.REDIS_DB_CACHE;

const connectRedis = async () => {
    const redisClient = createClient({
        socket: {
            host: redis_host,
            port: redis_port,
        },
        database: redis_db_number,
    });
    redisClient.on('error', (err) => console.log('redis client error: ', err));
    await redisClient.connect();
    return redisClient;
}

module.exports = {
    connectRedis
}
