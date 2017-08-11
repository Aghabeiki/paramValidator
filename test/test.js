let should = require('should');
describe('Helper', function () {
    describe('#JSON Bank Loader', function () {
        it('should be true when load the test', function (done) {

            const configLoader = require('../lib/Helper/ConfigBankLoader');
            const path = require('path');
            const config = require('./resources/config')
            const res = configLoader(path.resolve(config.validatorBaseRepo, 'test'));
            res.should.be.eql({
                '/airlines/:airline_code/callcenter': {
                    get: {
                        TITLE: 'Call Center',
                        URL: '/airlines/:airline_code/callcenter',
                        METHOD: 'GET',
                        NAMESPACE: 'get airline call center',
                        SCRIPT: './script/Airlines.CallCenter.js'
                    }
                },
                '/airlines/:airline_code': {
                    get: {
                        TITLE: 'Get Airline',
                        URL: '/airlines/:airline_code',
                        METHOD: 'get',
                        NAMESPACE: 'Get Airline details',
                        SCRIPT: './script/Airlines.GetAirline.js'
                    }
                },
                '/airlines': {
                    get: {
                        TITLE: 'Get All Airlines',
                        URL: '/airlines',
                        METHOD: 'get',
                        NAMESPACE: 'Get All Airlines',
                        SCRIPT: './script/Airlines.GetAllAirlines.js'
                    }
                },
                '/airlines/:airline_code/office': {
                    get: {
                        TITLE: 'Offices',
                        URL: '/airlines/:airline_code/office',
                        METHOD: 'GET',
                        NAMESPACE: 'Get Airlines Office Details',
                        SCRIPT: './script/Airlines.Offices.js'
                    }
                },
                '/airlines/:airline_code/representative': {
                    get: {
                        TITLE: 'Representative',
                        URL: '/airlines/:airline_code/representative',
                        METHOD: 'GET',
                        NAMESPACE: 'Get Airline representative details',
                        SCRIPT: './script/Airlines.Representative.js'
                    }
                },
                '/airlines/:airline_code/representative2': {
                    'get': {
                        'METHOD': 'GET',
                        'NAMESPACE': 'Get Airline representative2 details',
                        'SCRIPT': './script/Airlines.Representative.js',
                        'TITLE': 'Representative2',
                        'URL': '/airlines/:airline_code/representative2'
                    }
                }
            });
            should.equal(Object.keys(res).length, 6);
            done();
        });
        it('should be true when load the test1', function (done) {

            const configLoader = require('../lib/Helper/ConfigBankLoader');
            const path = require('path');
            const config = require('./resources/config')
            const res = configLoader(path.resolve(config.validatorBaseRepo, 'test1'));
            res.should.be.eql({
                '/companions': {
                    'delete': {
                        'BODY': {},
                        'METHOD': 'delete',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'get': {
                        'BODY': {},
                        'METHOD': 'get',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'post': {
                        'BODY': {},
                        'METHOD': 'post',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'put': {
                        'BODY': {},
                        'METHOD': 'put',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    }
                }
            });
            should.equal(Object.keys(res).length, 1);
            done();
        });
        it('should be true when load the test2', function (done) {

            const configLoader = require('../lib/Helper/ConfigBankLoader');
            const path = require('path');
            const config = require('./resources/config')
            const res = configLoader(path.resolve(config.validatorBaseRepo, 'test2'));
            res.should.be.eql({
                '/companions': {
                    'delete': {
                        'BODY': {},
                        'METHOD': 'delete',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'get': {
                        'BODY': {},
                        'METHOD': 'get',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'post': {
                        'BODY': {},
                        'METHOD': 'post',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    },
                    'put': {
                        'BODY': {},
                        'METHOD': 'put',
                        'NAMESPACE': 'get airline call center',
                        'TITLE': 'Companions',
                        'URL': '/companions'
                    }
                }
            });
            should.equal(Object.keys(res).length, 1);
            done();
        });
        it('should be throw an error when load the simple', function (done) {

            const configLoader = require('../lib/Helper/ConfigBankLoader');
            const path = require('path');
            const config = require('./resources/config')
            try {
                const res = configLoader(path.resolve(config.validatorBaseRepo, 'simple'));
            }
            catch (e) {
                e.message.should.be.eql(' here I have a problem duplicate config');
                done()
            }


        });
    });
});


