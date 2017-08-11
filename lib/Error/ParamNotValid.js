const PVError = require('./PVError');
class ParamNotValid extends PVError {
  constructor(message) {
    if (message) {
      super(message);
    }
    else {
      super();
    }

    super.setErrorType(require('./ErrorTypeEnume').ParamNotValid);

  }
}


module.exports = ParamNotValid;
