/**
 * Created by roten on 8/10/17.
 */
const path = require('path');
module.exports = {
    projectBaseDIR: __dirname,
    validatorBaseRepo: path.resolve(__dirname, 'sampleJsonBank'),
    scriptBaseRepo: path.resolve(__dirname, 'sampleJsonBank', 'script'),
    excludePrefix: null,
    includePrefix: null
}
