const PVError = require('./lib/Error/PVError');
const FS = require('fs');
const Path = require('path');

const _validatorBaseRepo = new WeakMap();
const _scriptBaseRepo = new WeakMap();
const _excludePrefix = new WeakMap();
const _includePrefix = new WeakMap();
const _framework = new WeakMap();
const _environment = new WeakMap();
const _routes = new WeakMap();
const _logger = new WeakMap();

let Handler = null;

class ParamValidator {
    constructor(config, logger, routes, environment) {
        if (config == undefined) {
            throw new PVError("arguments missed");
        }
        if (config.projectBaseDIR === undefined || !FS.existsSync(config.projectBaseDIR)) {
            throw new PVError('base project not set ')
        }
        Handler = this;
        _framework.set(Handler, 'sails');

        Handler.validatorBaseRepo = config.validatorBaseRepo || null;
        if (Handler.validatorBaseRepo != null) {
            Handler.validatorBaseRepo = Path.resolve(config.projectBaseDIR, Handler.validatorBaseRepo);
        }
        Handler.scriptBaseRepo = config.scriptBaseRepo || config.validatorBaseRepo
        if (Handler.scriptBaseRepo != null) {
            Handler.scriptBaseRepo = Path.resolve(config.projectBaseDIR, Handler.scriptBaseRepo);
        }
        Handler.includePrefix = config.includePrefix || null;
        Handler.excludePrefix = config.excludePrefix || null;
        if (Handler.validatorBaseRepo == null || !FS.existsSync(Handler.validatorBaseRepo)) {
            throw new PVError('Validator Base Repo Address required');
        }
        if (Handler.scriptBaseRepo == null || !FS.existsSync(Handler.scriptBaseRepo)) {
            throw new PVError('Script Base Repo Address Required');
        }

        // config public config
        if (Handler.isItSails) {
            _environment.set(Handler, environment);
            _routes.set(Handler, routes);
            _logger.set(Handler, logger)
        }
    }

    get logger() {
        return _logger.get(Handler)
    }

    get routes() {
        return _routes.get(Handler);
    }

    get environment() {
        return _environment.get(Handler);
    }

    get isItSails() {
        return _framework.get(Handler) == 'sails'
    }

    get validatorBaseRepo() {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            return _validatorBaseRepo.get(Handler);
        }
    }

    set validatorBaseRepo(validatorBaseRepo) {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            _validatorBaseRepo.set(Handler, validatorBaseRepo);
        }
    }

    get scriptBaseRepo() {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            return _scriptBaseRepo.get(Handler);
        }
    }

    set scriptBaseRepo(scriptBaseRepo) {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            _scriptBaseRepo.set(Handler, scriptBaseRepo);
        }
    }

    get excludePrefix() {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            return _excludePrefix.get(Handler);
        }
    }

    set excludePrefix(excludePrefix) {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            _excludePrefix.set(Handler, excludePrefix)
        }
    }

    get includePrefix() {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            return _includePrefix.get(Handler);
        }
    }

    set includePrefix(includePrefix) {
        if (Handler == null) {
            throw new PVError('ParamValidator Config is not correct');
        }
        else {
            _includePrefix.set(Handler, includePrefix)
        }
    }

}
ParamValidator.prototype.validator = require('./lib/MiddlewareInterface')
module.exports = ParamValidator;