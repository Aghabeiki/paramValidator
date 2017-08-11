const fs = require('fs');
const PVError = require('../Error/PVError')
const path = require('path');
function loadBlock(JSONObject) {
    let bank = {};
    let theURL = JSONObject.URL.toLowerCase();
    if (theURL[theURL.length - 1] === '/')
        theURL = theURL.slice(0, theURL.length - 1);
    bank[theURL] = {}
    bank[theURL][JSONObject.METHOD.toLowerCase()] = JSONObject;
    return bank;
}
function mergeBank(bank, JSONObject) {
    "use strict";

    const theURL = Object.keys(JSONObject)[0];
    Object.keys(JSONObject[theURL]).forEach(method=>{
        if (bank[theURL] === undefined) {
            bank[theURL] = {}
        }
        if (bank[theURL][method] !== undefined) {
            throw new PVError(' here I have a problem duplicate config');
        }
        else {
            bank[theURL][method] = JSONObject[theURL][method];
        }
    })

    return bank;

}
function jsonValidator(JSONObjects) {
    if (Array.isArray(JSONObjects)) {
        return JSONObjects.map(jsonValidator).reduce(mergeBank, {});
    }
    else if (JSONObjects.URL !== undefined && JSONObjects.METHOD !== undefined &&
        (JSONObjects.SCRIPT !== undefined || JSONObjects.BODY !== undefined)) {
        // it's a block
        return loadBlock(JSONObjects);
    }
    else {
        return Object.keys(JSONObjects)
            .reduce((p, JSONObject) => {
                "use strict";
                if (Array.isArray(JSONObjects[JSONObject])) {
                    // load array one by one
                    let processedArray = jsonValidator(JSONObjects[JSONObject]);
                    return Object.keys(processedArray)
                        .reduce((p, key) => {
                            let tmp = {}
                            tmp[key] = processedArray[key];
                            return mergeBank(p, tmp);
                        }, p);

                }
                else if (JSONObjects[JSONObject].URL !== undefined && JSONObjects[JSONObject].METHOD !== undefined &&
                    (JSONObjects[JSONObject].SCRIPT !== undefined || JSONObjects[JSONObject].BODY !== undefined)) {
                    // it's a block
                    return mergeBank(p, loadBlock(JSONObjects[JSONObject]))
                }
                else {
                    // it's not good param config
                    throw new PVError("Param config is not valid on " + JSON.stringify(JSONObjects[JSONObject]));
                }
            }, {})
    }

}

module.exports = function (basePath) {
    return require('fs').readdirSync(basePath).filter(file => {
        "use strict";
        return path.extname(file).toLowerCase() == '.json'
    })
        .map(file => {
            "use strict";
            return jsonValidator(JSON.parse(fs.readFileSync(path.join(basePath, file)).toString()))
        })
        .reduce((bank, bankParts) => {
            "use strict";
            return Object.keys(bankParts).reduce((p, key) => {
                let tmp = {};
                tmp[key] = bankParts[key];
                return mergeBank(p, tmp);
            }, bank);
        }, {})
}
