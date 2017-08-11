/**
 * Created by roten on 6/9/17.
 */

const PVError = require('./PVError');

class NotImplemented extends PVError {
  constructor(message) {
    if (message) {
      super(message);
    }
    else {
      super();
    }

    super.setErrorType(require('./ErrorTypeEnume').NotImplemented);

  }


}
module.exports = NotImplemented;
