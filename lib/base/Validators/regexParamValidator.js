module.exports=function (paramConfig, paramValue) {
    "use strict";
    if (paramConfig.regex64 === undefined)
        return true;
    //
    let regex = null;
    try {
        regex = new RegExp(Buffer.from(paramConfig.regex64, 'base64').toString());
    }
    catch (e) {
        throw new Error("Invalid validator configuration , please check ur regex format");
    }
    if (regex) {
        return regex.test(paramValue)
    }
    else {
        return false;
    }
}