
const ErrorTypeEnume = require('./ErrorTypeEnume');
let PVErrorHandler = null;
const _errorType = new WeakMap();
class PVError extends Error {
    constructor(message) {
        if (message)
            super(message);
        else
            super();
        PVErrorHandler = this;
        _errorType.set(PVErrorHandler, null);

    }

    setErrorType(errorType) {
        _errorType.set(PVErrorHandler, errorType)
        if (this.message === '') {
            this.meessage = this.getErrorTypeName();
        }

    }

    getErrorTypeName() {
        return Object.keys(ErrorTypeEnume).filter(elem => {
            if (ErrorTypeEnume[elem] === _errorType.get(PVErrorHandler)) return elem
        })[0]
    }

    getErrorTypeCode() {
        return _errorType.get(PVErrorHandler);
    }
}
module.exports = PVError;
