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

    const params = _.defaultsDeep(config, {json: true, gzip: true, agent: keepAliveAgent, time: config.logLevel === 'trace'});

    return Promise.promisify(Request.defaults(params));
};