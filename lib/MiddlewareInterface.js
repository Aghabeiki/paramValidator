const PVError = require('./Error/SearchCarError');
const URLPattern = require('url-pattern');
const ParamValidator = require('./Validator');
const _ = require('lodash');

module.exports = function (req, res, next) {

    try {
        const that = this;
        if (that.includePrefix !== null) {
            let rg = new RegExp(that.includePrefix, 'i');

            if (!rg.test(req.url.toLowerCase())) {
                return next()
            }
        }

        if (that.excludePrefix !== null) {
            let rg = new RegExp(that.excludePrefix, 'i');

            if (rg.test(req.url.toLowerCase())) {
                return next()
            }
        }

        let paramValidatorCB = function (err) {
            "use strict";
            if (err) {
                if (err instanceof PVError) {
                    if (err.getErrorTypeCode() === require('./Error/ErrorTypeEnume').ParamValidatorNotFound) {
                        if (that.environment === 'production') {
                            that.logger.warn('Param validator detect an unimplemented validator for url %s and method %s.', req.url, req.method);
                            return next();
                        }
                        else {
                            return res.json(400, {
                                error_code: 400,
                                error_message: 'Invalid parameter',
                                error_detail: err
                            });

                        }
                    }
                    else {
                        return res.json(400, {
                            error_code: 400,
                            error_message: 'Invalid parameter',
                            error_detail: err.message
                        });
                    }
                }// error is based on GoQuo Error
                else {
                    return res.json(400, {
                        error_code: 400,
                        error_message: 'Invalid parameter',
                        error_detail: err.message
                    });
                }
            }// err fined
            else {
                next();
            }
        };


        const targetURL = {};
        if (req.url.indexOf('?') !== -1) {
            targetURL.queryParam = req.url
                .slice(req.url.indexOf('?') + 1, req.url.length)
                .replace(new RegExp('\&{1,}', 'g'), '&').split('&')
                .map(params => {
                    "use strict";
                    let tmp = {}
                    tmp[params.split('=')[0]] = params.split('=')[1];
                    return tmp;
                })
            targetURL.url = req.url.slice(0, req.url.indexOf('?'));
        }
        else {
            targetURL.queryParam = [];
            targetURL.url = req.url;
        }
        if (targetURL.url[targetURL.url.length - 1] == '/') {
            targetURL.url = targetURL.url.slice(0, targetURL.url.length - 1)
        }

        let paramValidator = new ParamValidator(req.method, targetURL.url, that.validatorBaseRepo, that.scriptBaseRepo);
        if (req.method.toLowerCase() === 'get') {

            let queryString = Object.keys(that.routes).filter(route => {
                "use strict";
                return (route.toLowerCase().startsWith('get') &&
                ((new URLPattern(route.toLowerCase().replace('get ', '')).match(targetURL.url) !== null) ))
            }).map(route => {
                "use strict";
                let bank = {};
                let tmp = route.replace('get ', '');

                bank[tmp] = (new URLPattern(tmp)).match(targetURL.url)

                return bank;
            })
            if (queryString.length == 0) {
                queryString = Object.keys(that.routes).filter(route => {
                    "use strict";
                    return (route.toLowerCase().startsWith('get') &&
                    ((route.toLowerCase().replace('get ', '').startsWith(targetURL.url))))
                }).map(route => {
                    "use strict";
                    let bank = {};
                    let tmp = route.replace('get ', '');

                    bank[tmp] = (new URLPattern(tmp)).match(targetURL.url)

                    return bank;
                })
            }


            if (queryString.length == 0) {
                that.logger.debug(('the route is not found in query strings'));
                return next();
            }
            else if (queryString.length === 1) {
                let query = queryString[0][Object.keys(queryString[0])[0]] || {}

                query.headerParams = _.cloneDeep(req.headers);
                query.queryParam = targetURL.queryParam.reduce((p, v) => {
                    "use strict";
                    p[Object.keys(v)[0]] = v[Object.keys(v)[0]];
                    return p;
                }, {})
                paramValidator.validate(query, paramValidatorCB);
            }
            else if (queryString.length !== 1 && paramValidator.isScriptBase()) {
                queryString = queryString.map(parts => {
                    "use strict";
                    let url = Object.keys(parts)[0];
                    let val = parts[url].split('/').map(valPart => {
                        return valPart.replace(":", '')
                    });
                    return {url: url, params: val};
                })
                let URLpaterns = req.url.split('/').filter(parts => {
                    return parts.length !== 0
                }).reduce((p, v, i, arr) => {
                    "use strict";
                    if (p.length == 0) {
                        return [{
                            url: '/' + v, params: arr.filter(param => {
                                return param !== v
                            })
                        }];
                    }
                    else {
                        p.push({
                            url: p[p.length - 1].url + '/' + v, params: arr.slice(i + 1, arr.length)
                        });
                        return p;

                    }
                }, []);

                let finedRoute = queryString.filter(urlPattern => {
                    "use strict";
                    let anyMatch = URLpaterns.filter(reqPaterns => {
                        return (reqPaterns.url[reqPaterns.url.length - 1] == '/' ? reqPaterns.url.slice(0, reqPaterns.url.length - 1) : reqPaterns.url).toLowerCase() == urlPattern.url.toLowerCase() && reqPaterns.params.length == urlPattern.params.length
                    });
                    return anyMatch.length != 0
                }).map(finedPattern => {
                    "use strict";
                    let paramVal = URLpaterns.filter(reePatterns => {
                        return (reePatterns.url[reePatterns.url.length - 1] == '/' ? reePatterns.url.slice(0, reePatterns.url.length - 1) : reePatterns.url).toLowerCase() == finedPattern.url.toLowerCase() && reePatterns.params.length == finedPattern.params.length
                    });
                    if (paramVal.length == 1) {
                        return {
                            url: finedPattern.url[finedPattern.url.length - 1] == '/' ? finedPattern.url.slice(0, finedPattern.url.length - 1) : finedPattern.url,
                            paramVal: paramVal[0].params,
                            paramsKey: finedPattern.params
                        }
                    }
                    else {
                        return null;
                    }
                }).filter(elem => {
                    "use strict";
                    return elem != null;
                }).reduce((p, v) => {
                    "use strict";
                    let okay = true;
                    for (let i = 0; i < p.length; i++)
                        if (p[i].url == v.url) {
                            okay = false;
                            break;
                        }
                    if (okay) {
                        p.push(v);
                    }
                    return p;


                }, [])


                if (finedRoute.length == 1) {
                    let query = {};
                    finedRoute[0].paramsKey.forEach((v, i) => {
                        "use strict";
                        query[v] = finedRoute[0].paramVal[i];
                    })
                    query.headerParams = req.headers;
                    paramValidator.validate(query, paramValidatorCB);
                }
                else {
                    return res.json(400, {
                        error_code: 400,
                        error_message: 'Invalid parameter',
                        error_detail: 'cannot extract Query String for get request, I find some complex URL definition '
                    });
                }
            }
            else if (queryString.length !== 1 && !paramValidator.isScriptBase()) {
                return res.json(400, {
                    error_code: 400,
                    error_message: 'Invalid param validator configuration',
                    error_detail: 'in get model should use Scripting method for validation'
                });
            }
            else {
                return res.json(400, {
                    error_code: 400,
                    error_message: 'Invalid parameter',
                    error_detail: 'cannot extract Query String for get request'
                });
            }
        }
        else {
            paramValidator.validate(req.body, paramValidatorCB);
        }

    }
    catch (e) {
        return res.json(400, {
            error_code: 400,
            error_message: 'Invalid parameter',
            error_detail: e.message
        });
    }
}
