/**
 * Created by roten on 8/14/17.
 */
let should = require('should');
const PVError = require('../lib/Error/PVError')
const ParamValidator = require('../ParamValidator');
const config = {
    projectBaseDIR: __dirname,
    validatorBaseRepo: __dirname,
    scriptBaseRepo: __dirname

}
describe('ParamValidator Class', function () {
    describe('#Constractor', function () {
        it('Should throw an PVError when constructor call without any arguments', function (done) {
            let error = null;
            try {
                let paramValidator = new ParamValidator();
            }
            catch (e) {
                error = e;
            }

            should(error).not.be.eql(null, " Error should not be null");
            should(error instanceof PVError).be.eql(true, ' error should be instance of PVError')
            done();
        });
        it('should be throw an PVError when base dir missed in arguments', function (done) {
            "use strict";
            let error = null;
            try {
                new ParamValidator({});
            }
            catch (e) {
                error = e;
            }
            should(error).not.be.eql(null, " Error should not be null");
            should(error instanceof PVError).be.eql(true, ' error should be instance of PVError')
            done()

        })
        it('should be throw an PVError when base dir is incorrect', function (done) {
            "use strict";
            let error = null;
            try {
                new ParamValidator({projectBaseDIR: 'tmp/dir/x/z/y/test/amin'});
            }
            catch (e) {
                error = e;
            }
            should(error).not.be.eql(null, " Error should not be null");
            should(error instanceof PVError).be.eql(true, ' error should be instance of PVError')
            done()

        })
        it('should be throw an PVError when validatorBaseRepo is incorrect', function (done) {
            "use strict";
            let error = null;
            try {
                new ParamValidator({projectBaseDIR: __dirname, validatorBaseRepo: 'fake/path'});
            }
            catch (e) {
                error = e;
            }
            should(error).not.be.eql(null, " Error should not be null");
            should(error instanceof PVError).be.eql(true, ' error should be instance of PVError')
            done()

        })
        it('should be throw an PVError when scriptBaseRepo is incorrect', function (done) {
            "use strict";
            let error = null;
            try {
                new ParamValidator({
                    projectBaseDIR: __dirname,
                    validatorBaseRepo: __dirname,
                    scriptBaseRepo: 'fake/path'
                });
            }
            catch (e) {
                error = e;
            }
            should(error).not.be.eql(null, " Error should not be null");
            should(error instanceof PVError).be.eql(true, ' error should be instance of PVError')
            done()

        })
        it('should create the ParamValidator correctly and all necessary getter and setter work', function (done) {
                "use strict";

                let error = null;
                let paramValidator = null;
                try {
                    paramValidator = new ParamValidator(config, console.log, {}, 'test');
                    paramValidator.logger
                    paramValidator.scriptBaseRepo
                    paramValidator.validatorBaseRepo
                    paramValidator.includePrefix
                    paramValidator.excludePrefix
                    paramValidator.environment
                    paramValidator.isItSails
                    paramValidator.routes
                }
                catch (e) {
                    error = e;
                }
                should(error).be.eql(null, "some arguments in ParamValidator, constructor is missed");
                done()

            }
        )
    });
});
