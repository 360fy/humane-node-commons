import _ from 'lodash';
import Http from 'http';
import Promise from 'bluebird';
import Request from 'request';

export default (config) => {
    const keepAliveAgent = new Http.Agent({
        keepAlive: true,
        maxSockets: config.maxSockets || 10,
        maxFreeSockets: config.maxFreeSockets || 5,
        keepAliveMsecs: config.keepAliveTimeout || 5000
    });

    return Promise.promisify(Request.defaults({
        json: _.isUndefined(config.json) ? true : config.json,
        gzip: _.isUndefined(config.gzip) ? true : config.gzip,
        agent: keepAliveAgent,
        time: config.logLevel === 'trace',
        baseUrl: config.baseUrl
    }));
};