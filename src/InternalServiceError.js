import ExtensibleError from './ExtensibleError';

export default class InternalServiceError extends ExtensibleError {
    constructor(message, data) {
        super(500, 'INTERNAL_SERVICE_ERROR', message, data);
    }
}