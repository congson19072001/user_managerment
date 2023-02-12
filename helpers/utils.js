exports.deleteRedisKeys = async (redisClient, pattern) => {
    try {
        const keys = await redisClient.keys(pattern);

        if (keys && keys.length !== 0) {
            await redisClient.del(keys);
        }

        for(let key of keys) {
            delete global.jwtToken[key];
        }

        return true;
    } catch (error) {
        throw error
    }
}