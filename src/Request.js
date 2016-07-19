import _ from 'lodash';
import Http from 'http';
import Https from 'https';
import Promise from 'bluebird';
import Request from 'request';
import InternalServiceError from './InternalServiceError';
import Chalk from 'chalk';

const SUCCESS_STATUS = 'SUCCESS';
const FAIL_STATUS = 'FAIL';

const TRACE_LOG_LEVEL = 'trace';
const DEBUG_LOG_LEVEL = 'debug';
const INFO_LOG_LEVEL = 'info';

const LogLevels = {
    [TRACE_LOG_LEVEL]: 0,
    [DEBUG_LOG_LEVEL]: 1,
    [INFO_LOG_LEVEL]: 2
};

const HEAD_HTTP_METHOD = 'HEAD';

export function builder(config) {
    let Agent = null;
    if (config.https) {
        Agent = Https.Agent;
    } else {
        Agent = Http.Agent;
    }

    const keepAliveAgent = new Agent({
        keepAlive: true,
        maxSockets: config.maxSockets || 10,
        maxFreeSockets: config.maxFreeSockets || 5,
        keepAliveMsecs: config.keepAliveTimeout || 5000
    });

    const params = _.defaultsDeep(config, {json: true, gzip: true, agent: keepAliveAgent, time: config.logLevel === 'trace'});

    return Promise.promisify(Request.defaults(params));
}

export function handleResponse(response, extraOkayStatusCodes, operation, logLevel) {
    if (!response) {
        return Promise.reject('ERROR: No Response');
    }

    if (_.isArray(response)) {
        response = response[0];
    }

    const isOkay = extraOkayStatusCodes && extraOkayStatusCodes[response.statusCode];

    if (_.get(LogLevels, logLevel) <= _.get(LogLevels, DEBUG_LOG_LEVEL) || (response.statusCode >= 500 && !isOkay && response.request.method !== HEAD_HTTP_METHOD)) {
        console.log();
        console.log(Chalk.blue('------------------------------------------------------'));
        console.log(Chalk.blue.bold(`${response.request.method} ${response.request.href}`));

        const format = response.statusCode < 400 ? Chalk.green : Chalk.red;

        console.log(format(`Status: ${response.statusCode}, Elapsed Time: ${response.elapsedTime}`));

        if (response.request.method !== HEAD_HTTP_METHOD) {
            console.log(format(JSON.stringify(response.body, null, 2)));
        }

        console.log(Chalk.blue('------------------------------------------------------'));
        console.log();
    }

    if (response.statusCode < 500 || isOkay) {
        return _.extend({
            _statusCode: response.statusCode,
            _status: response.statusCode < 400 ? SUCCESS_STATUS : FAIL_STATUS,
            _elapsedTime: response.elapsedTime,
            _operation: operation
        }, response.body);
    }

    throw new InternalServiceError('Internal Service Error', {
        _statusCode: response.statusCode, details: response.body && response.body.error || response.body
    });
}

export function handleResponseArray(responses, okStatusCodes, operation, logLevel = INFO_LOG_LEVEL) {
    return Promise
      .all(_.map(responses, response => {
          let promise = null;
          try {
              promise = Promise.resolve(handleResponse(response, okStatusCodes, operation, logLevel));
          } catch (error) {
              promise = Promise.reject(error);
          }

          return promise.reflect();
      }))
      .map(inspection => {
          if (inspection.isFulfilled()) {
              return inspection.value();
          }

          return inspection.reason();
      });
}