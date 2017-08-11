/**
 * Created by roten on 6/13/17.
 */


const PVError = require('./PVError');


class ParamNotFound extends PVError {
  constructor(message) {
    if (message) {
      super(message);
    }
    else {
      super();
    }

    super.setErrorType(require('./ErrorTypeEnume').ParamNotFound);

  }
}


module.exports = ParamNotFound;
