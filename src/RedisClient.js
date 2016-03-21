import _ from 'lodash';
import Redis from 'redis';
import RedisSentinel from 'redis-sentinel';
import Promise from 'bluebird';

function promisify(client) {
    return Promise.promisifyAll(client);
}

export default _.once((config) => {
    const redisSentinelConfig = config.redisSentinelConfig;
    if (redisSentinelConfig) {
        return promisify(RedisSentinel.createClient(redisSentinelConfig.endpoints, redisSentinelConfig.name));
    }

    const redisConfig = config.redisConfig;
    if (redisConfig) {
        return promisify(Redis.createClient(redisConfig));
    }

    return promisify(Redis.createClient());
});