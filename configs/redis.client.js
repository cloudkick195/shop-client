const redis = require('redis');

module.exports = () => {
    const redisClient = redis.createClient({
        host: '127.0.0.1',
        port: 6379
    });

    const client = {};
    client.getKey = (key) => {
        return new Promise((resolve, reject) => {
            redisClient.get(key, (error, result) => {
                if (error) {
                    return reject(error);
                }
                
                return resolve(result);
            });
        });
    }

    client.setKey = (key, value) => {
        return new Promise((resolve, reject) => {
            redisClient.set(key, value, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(value);
            });
        });
    }


    return { redisClient, client };
}