import ExtensibleError from './ExtensibleError';

export default class ValidationError extends ExtensibleError {
    constructor(message, data) {
        super(400, 'VALIDATION_ERROR', message, data);
    }
}