const PVError = require('./Error/PVError');
const ParamValidatorNotImplemented = require('./Error/ParamValidatorNotImplemented');
const ParamNotFound = require('./Error/ParamNotFound');
const ParamNotValid = require('./Error/ParamNotValid')

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

let ValidatorHandler = null;
const _validationErrorType = new WeakMap();
const _target = new WeakMap();
const _scriptPath = new WeakMap();
const _targetURL = new WeakMap();


const validateEmail = require('./Validators/validateEmail')
const compareWithField = require('./Validators/compareWithField')
const regexParamValidator = require('./Validators/regexParamValidator')
const BankLoader = require('./Helper/ConfigBankLoader');

class Validator {

    constructor(method, url, bankPath, scriptPath) {
        ValidatorHandler = this;
        ValidatorHandler.scriptPath = scriptPath;
        _validationErrorType.set(ValidatorHandler, {
            InvalidDataStructure: 0,
            InvalidDataType: 1,
            MissedRequiredParam: 2,
            ParamValidatorNotFound: 3
        });

        // load bank

        let bank = BankLoader(bankPath)


        try {
            let targetURL = Object.keys(bank).filter(URL => {
                let URLPattern = require('url-pattern')
                let urlPattern = new URLPattern(URL);
                return urlPattern.match(url) !== null;
            })
            if (targetURL.length == 1) {
                _target.set(ValidatorHandler, bank[targetURL[0]][method.toLowerCase()]);
                _targetURL.set(ValidatorHandler, targetURL[0]);
            }
            else {
                let targetUrl = '';
                if (url[url.length - 1] == '/') {
                    targetUrl = url.substring(0, url.length - 1);
                }
                else {
                    targetUrl = url;
                }
                _targetURL.set(ValidatorHandler, targetUrl);
                _target.set(ValidatorHandler, bank[targetUrl.toLowerCase()][method.toLowerCase()]);
            }
        }
        catch (e) {
            _target.set(ValidatorHandler, undefined);
        }
    }

    set scriptPath(scriptPath) {
        _scriptPath.set(ValidatorHandler, scriptPath)
    }

    get scriptPath() {
        return _scriptPath.get(ValidatorHandler);
    }

    get targetURL() {
        return _targetURL.get(ValidatorHandler);
    }

    validate(param, cb) {
        let cbCalled = false;
        let that = this;
        const target = _target.get(ValidatorHandler);
        if (target === undefined) {
            cbCalled = true;
            return cb(new ParamValidatorNotImplemented());
        }
        if (target.SCRIPT !== undefined) {
            // run the script
            try {

                let scriptTargetPath = path.resolve(that.scriptPath, target.SCRIPT);
                if (!fs.existsSync(scriptTargetPath)) {
                    throw new PVError('the script config is not correct, ', target.SCRIPT)
                }
                let res = require(scriptTargetPath).validator(param);
                if (res) {
                    cb(null)
                }
                else {
                    cb(new Error("unknown error "))
                }
            }
            catch (e) {
                cb(e);
            }
            return;
        }

        // check the target exist

        // check the required fields
        let matchRequireRes = this.matchRequirement(target.BODY, param)
        if (matchRequireRes !== null) {
            let missedPath = "";
            matchRequireRes.forEach(pair => {
                if (pair.missed) {
                    missedPath += (missedPath === '' ? '' : ",") + pair.path;
                }
            });

            cbCalled = true;
            return cb(new ParamNotFound("Param not found but it required, " + missedPath));
        }
        // check the fields data type
        let mathDataTypeRes = this.matchFieldsDataType(target.BODY, param).filter(row => {
            "use strict";
            if (row[Object.keys(row)[0]].status !== undefined) {
                return row[Object.keys(row)[0]].status === false;
            }
            else {
                return true;
            }

        });
        if (mathDataTypeRes.length !== 0) {

            cbCalled = true;
            return cb(new ParamNotValid('Some Param is not Valid ' + JSON.stringify(mathDataTypeRes)));
        }

        // check the other fields param( like length enum and etc.. )


        if (cbCalled === false) {
            cb(null);
        }
    }

    getAllPath(target, basePath) {
        let out = {
            required: [],
            notRequired: []
        };
        if (basePath == undefined)
            basePath = '';
        let parentsKey = Object.keys(target).filter(key => {
            return target[key].type === undefined
        });
        let valuesKeyReq = Object.keys(target).filter(key => {
            return target[key].type !== undefined && (target[key].required === true || target[key].required === undefined)
        });
        let valuesKeyNotReq = Object.keys(target).filter(key => {
            return target[key].type !== undefined && (target[key].required === false)
        });

        valuesKeyReq.forEach(valueKey => {
            out.required.push((basePath !== '' ? basePath + '.' : '') + valueKey);
        });
        valuesKeyNotReq.forEach(valueKey => {
            out.notRequired.push((basePath !== '' ? basePath + '.' : '') + valueKey);
        });
        let that = this;
        parentsKey.forEach(parentKey => {

            let tmp = that.getAllPath(target[parentKey], (basePath === '' ? parentKey : basePath + '.' + parentKey));
            tmp.required.forEach(pair => {
                if (pair[0] === '.')
                    pair = pair.substring(1, pair.length);
                out.required.push(pair);
            })
            tmp.notRequired.forEach((pair) => {
                if (pair[0] === '.')
                    pair = pair.substring(1, pair.length);
                out.notRequired.push(pair);
            })
        })

        return out;


    }

    matchRequirement(target, param) {
        // load all the path
        let errorStack = [];
        let allPath = this.getAllPath(target);
        allPath.required.forEach(path => {
            let pathIsValid = true;
            let paramTmp = _.cloneDeep(param);
            let keyPath = path.split('.');
            for (let i = 0; i < keyPath.length && pathIsValid; i++) {
                if (paramTmp[keyPath[i]] === undefined) {
                    pathIsValid = false;
                }
                else {
                    paramTmp = _.cloneDeep(paramTmp[keyPath[i]]);
                }
            }
            if (pathIsValid === false) {
                errorStack.push({path: path, missed: true});
            }

        });
        if (errorStack.length !== 0)
            return errorStack;
        else
            return null;
    }

    isScriptBase() {
        const target = _target.get(ValidatorHandler);
        if (target === undefined) {

            return cb(new ParamValidatorNotImplemented());
        }
        else {
            return target.SCRIPT !== undefined
        }

    }

    getParamConfig(target, path) {
        let paths = path.split('.');
        let tmpTarget = _.cloneDeep(target)
        for (let i = 0; i < paths.length; i++) {
            tmpTarget = tmpTarget[paths[i]];
        }
        return _.cloneDeep(tmpTarget);
    }

    getParamVal(param, path) {
        return this.getParamConfig(param, path);
    }

    paramConfigChecker(paramConfig, paramValue) {
        let res = {}
        switch (paramConfig.type.toLowerCase()) {
            case 'number':

                res.requiredDataType = paramConfig.type;
                res.dataTypePassed = typeof paramValue === 'number';
                res.dataFormatPass = regexParamValidator(paramConfig, paramValue.toString())
                res.status = res.dataTypePassed && res.dataFormatPass;
                if (paramConfig.min !== undefined) {
                    res.minValueAllowed = paramConfig.min;
                    res.minValuePassed = paramValue >= paramConfig.min
                    res.status = res.status && res.minValuePassed
                }
                if (paramConfig.max !== undefined) {
                    res.maxValueAllowed = paramConfig.max;
                    res.maxValuePassed = paramValue <= paramConfig.max
                    res.status = res.status && res.maxValuePassed
                }
                break;
            case 'string':
                res.requiredDataType = paramConfig.type;
                res.dataTypePassed = typeof paramValue === 'string';
                res.dataFormatPass = regexParamValidator(paramConfig, paramValue)
                res.status = res.dataTypePassed && res.dataFormatPass;
                if (paramConfig.minLength !== undefined) {
                    res.minLengthAllowed = paramConfig.minLength;
                    res.minLengthPassed = paramValue.toString().length >= paramConfig.minLength
                    res.status = res.status && res.minLengthPassed
                }
                if (paramConfig.maxLength !== undefined) {
                    res.maxLengthAllowed = paramConfig.maxLength;
                    res.maxLengthPassed = paramValue.toString().length <= paramConfig.maxLength
                    res.status = res.status && res.maxLengthPassed
                }
                if (paramConfig.length !== undefined) {
                    res.lengthAllowed = paramConfig.length;
                    res.lengthPassed = paramValue.toString().length == paramConfig.length;
                    res.status = res.status && res.lengthPassed
                }
                break;
            case 'date':
                res.requiredDataType = paramConfig.type;
                res.dataTypePassed = Date.parse(paramValue) === NaN ? false : true;
                res.dataFormatPass = regexParamValidator(paramConfig, paramValue)
                res.status = res.dataTypePassed && res.dataFormatPass;
                break;
            case 'email':
                res.requiredDataType = paramConfig.type;
                res.dataTypePassed = typeof paramValue === 'string' && validateEmail(paramValue)
                res.dataFormatPass = regexParamValidator(paramConfig, paramValue)
                res.status = res.dataTypePassed && res.dataFormatPass;
                break;
            case 'phone':
                res.requiredDataType = paramConfig.type;
                try {
                    res.dataTypePassed = typeof paramValue === 'string' && phoneUtil.isValidNumber(phoneUtil.parse(paramValue));
                }
                catch (e) {
                    res.message = e.message;
                    res.dataTypePassed = false;
                }
                finally {
                    res.dataFormatPass = regexParamValidator(paramConfig, paramValue)
                    res.status = res.dataTypePassed && res.dataFormatPass;
                    res.status = res.dataTypePassed
                }

                break;
            case 'boolean':
                res.requiredDataType = paramConfig.type;
                try {
                    res.dataTypePassed = typeof paramValue === 'boolean';
                }
                catch (e) {
                    res.message = e.message;
                    res.dataTypePassed = false;
                }
                finally {
                    res.status = res.dataTypePassed
                }
                break;
            case 'array':
                res.requiredDataType = paramConfig.type;
                res.dataTypePassed = Array.isArray(paramValue)
                if (paramConfig.rows !== undefined && res.dataTypePassed) {
                    let that = this;
                    res.rows = paramValue.map(row => {
                        return that.paramConfigChecker(paramConfig.rows, row)
                    })
                    res.status = res.rows.reduce((p, v) => {
                        return p && v.status
                    }, true)
                }
                else if (res.dataTypePassed == false) {
                    res.status = false;
                }
                else {
                    // todo should implement for row by row checking
                    throw new PVError("array one by one not implemented ")
                    res.status = false;
                }
                break;
            case 'object':
                res.requiredDataType = paramConfig.type;
                let objectDetails = paramConfig.body;
                let that = this;
                let matchRequireRes = that.matchRequirement(objectDetails, paramValue)
                if (matchRequireRes != null) {
                    res.missedItemUnderObject = JSON.stringify(matchRequireRes);
                    res.status = false;
                }
                else {
                    let matchFieldsRes = that.matchFieldsDataType(objectDetails, paramValue)
                    res.status = true;
                    res.childs = [];
                    matchFieldsRes.filter(matchFieldRes => {
                        return !matchFieldRes[Object.keys(matchFieldRes)[0]].status
                    }).forEach(problem => {
                        res.status = false;
                        res.childs.push(problem);
                    })

                }


                break;
            default:

                throw new Error(' data type ' + paramConfig.type + ', not implemented ');
        }

        return res;
    }

    matchFieldsDataType(target, param) {
        let that = this;
        let allPath = that.getAllPath(target);
        let res = [];
        let allParamPath = []
        allPath.required.forEach(path => {
            let pass = {};
            pass[path] = {};

            const paramConfig = that.getParamConfig(target, path);
            const paramValue = that.getParamVal(param, path);
            if (paramConfig.type.split('|').length > 1) {
                // should work on two or more way !
                let tmpType = paramConfig.type.split('|');

                let totalRes = [];
                tmpType.forEach(type => {
                    let tmp = _.cloneDeep(paramConfig);
                    tmp.type = type;
                    totalRes.push(that.paramConfigChecker(tmp, paramValue));
                });
                let myRes = totalRes.filter(res => {
                    return res.status == true
                });
                if (myRes.length == 1) {
                    pass[path] = myRes[0]
                }
                else if (myRes.length == 0) {
                    let myRes = {}
                    let index = 0;
                    totalRes.forEach(res => {
                        myRes[tmpType[index]] = res;
                        index++;
                    })
                    // mean nothing match
                    pass[path] = myRes;
                }
                else if (myRes.length > 1) {
                    // more then one match ! not possible :D
                    throw new Error("Something interesting happened two data type is valid in the same time :D ");
                }

            }
            else {
                pass[path] = that.paramConfigChecker(paramConfig, paramValue);
            }

            {
                allParamPath.push({name: path, config: paramConfig, value: paramValue})
            }
            res.push(pass);
        });
        allPath.notRequired.forEach(path => {
            let pass = {};
            pass[path] = {};

            const paramConfig = that.getParamConfig(target, path);
            const paramValue = that.getParamVal(param, path);
            if (paramValue !== undefined) {

                if (paramConfig.type.split('|').length > 1) {
                    // should work on two or more way !
                    let tmpType = paramConfig.type.split('|');

                    let totalRes = [];
                    tmpType.forEach(type => {
                        let tmp = _.cloneDeep(paramConfig);
                        tmp.type = type;
                        totalRes.push(that.paramConfigChecker(tmp, paramValue));
                    });
                    let myRes = totalRes.filter(res => {
                        return res.status == true
                    });
                    if (myRes.length == 1) {
                        pass[path] = myRes[0]
                    }
                    else if (myRes.length == 0) {
                        let myRes = {}
                        let index = 0;
                        totalRes.forEach(res => {
                            myRes[tmpType[index]] = res;
                            index++;
                        })
                        // mean nothing match
                        pass[path] = myRes;
                    }
                    else if (myRes.length > 1) {
                        // more then one match ! not possible :D
                        throw new Error("Something interesting happened two data type is valid in the same time :D ");
                    }

                }
                else {
                    pass[path] = that.paramConfigChecker(paramConfig, paramValue);
                }
                {
                    allParamPath.push({name: path, config: paramConfig, value: paramValue})
                }
                res.push(pass);
            }
        });
        allParamPath.filter(param => {
            "use strict";
            return Array.isArray(param.config.compareWithFiled)
        }).reduce((p, v) => {
            "use strict";
            let requireFiled = v.config.compareWithFiled.map(elem => {
                let cmd = elem.split(":")[0]
                let field = elem.split(":")[1]
                if (cmd == undefined || field == undefined)
                    throw new Error(" a problem in validator bank configuration,in compareWithFiled, the format should be something like [cmd]:[field]");

                field = allParamPath.filter((path) => {
                    return path.name.toLowerCase() == field
                });
                if (field.length != 1) {
                    field = new Error("target field not match " + elem);
                }
                else {
                    field = field[0];
                }
                return {cmd: cmd, target: field};
            })
            p.push({me: v, targets: requireFiled});
            return p;
        }, [])
            .forEach(pair => {
                res = res.map(elem => {
                    if (Object.keys(elem)[0] == pair.me.name) {

                        elem[pair.me.name].status = elem[pair.me.name].status && compareWithField(pair);
                        return elem;

                    }
                    else {
                        return elem;
                    }
                });
            });


        return res;
    }
}

module.exports = Validator;
