/**
 * Created by roten on 6/13/17.
 */

const PVError = require('./PVError');

class ParamValidatorNotImplemented extends PVError {
  constructor(message) {
    if (message) {
      super(message);
    }
    else {
      super();
    }

    super.setErrorType(require('./ErrorTypeEnume').ParamValidatorNotFound);

  }
}

module.exports=ParamValidatorNotImplemented;
