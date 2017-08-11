# Param-Validator

A Param Validator in Middleware for Sailsjs

**note**: \
***this project is under heavy developments.***
### Installing

Install node module

```
npm i param-validator
```

Add it as a middelware to your sails http.js .

```
 paramValidator: function (req, res, next) {
 	let paramValidator = new ParamValidator(sails.config.ParamValidator
    	, sails.log, sails.config.routes, sails.config.environment);
    paramValidator.validator(req, res, next);
},
```
#### Config :

Create a config file under Config folder with any name and put this content on it.

```
module.exports.ParamValidator = {
    projectBaseDIR: require('path').resolve(__dirname, '../'),
    validatorBaseRepo: 'api/ParamValidator/ValidatorBank',
    scriptBaseRepo: 'api/ParamValidator/ValidatorBank/script',
    excludePrefix: '^(\/upload\/center).*$',
}
```

* ###### validatorBaseRepo :
	This config is required, and point to the path of your JSON defenition of param validation

* ###### scriptBaseRepo :
	This cinfig is required, and point to the path  of your script defenition of param validation

* ##### excludePrefix :
	A regex that exclude any path from param validator


##### Param Validator

 ###### The JSON Object properties

 * **URL** \
            The URL that should validate ( should be like route config )
 * METHOD \
 			The METHOD should be GET, PUT, DELETE or POST
 * BODY or SCRIPT \
 			The way of validations :D

 ###### Validation config
 * BODY : In this method, you can define a JSON file to validate your param automatically
 	* Independed properties
 		* `type` : number, date, string, array, object, email, phone, boolean`
 			*  Multi data type could assign to a param with separator `|`
 		* `required`: define the param is required or not,default value is true
    * Depend properties
    	* type `number`
    		* min :  minimum acceptable value
    		* max :  maximum acceptable value
        * type `string`
        	* minLength : minimum acceptable lenght of string
        	* maxLength : maximum acceptable lenght of string
        	* length : acceptable lenght of string
      	* type `array`
      		* rows: in the rows we can define the param and flow the validation config as well.
        * type `object`
        	* body: the properties of the JSON Object and can use all the validation config as well.

 	* Addition operation
 		* `compareWithFiled` :  compare one pram with another ones
        	* this param defined as an array, each rows of this arrasy should defined with a single string like ` operator:param_name `
        	* acceptable operators: all the valid logical compare operand in JS!
        * `regex64` : validate a param with regex,this param should define in config file as an regex that encoded with base64

 * SCRIPT: In this method you can write your own script to validate your param in your way
 	* this param should contain the path of your validatior script file
 	* the file should be under your `scriptBaseRepo` path
 	* in valid param checking the script should return `true` value
 	* on any invalidation just throw an Error
 	* any Error message that you throwen will be send and formated in response
 	* the script file should be like :

```
	 module.exports.validator = function (params) {
 		 "use strict";

  		return true;
	}
```
#### Some Validator Config
* **Simple JSON Config**
```
	{
  "URL": "/test/:param1/callcenter/:param2",
  "METHOD": "GET",
  "BODY": {
    "param1": {
      "type": "number"
    },
    "param2": {
      "type": "number",
      "min": 1,
      "max": 4,
      "required": false
    },
  }
}
```
* **Array Base JSON Config**
```
[
  {
    "URL": "/test1",
    "METHOD": "get",
    "BODY": {
     "date_from": {
      "type": "date",
      "required": false,
      "regex64": "aBase64String",
      "compareWithFiled": [
        "<:date_to"
      ]
    },
    "date_to": {
      "type": "date",
      "required": false,
      "regex64": "aBase64String",
      "compareWithFiled": [
        ">:date_from"
      ]
    }
    }
  },
  {
    "URL": "/test2",
    "METHOD": "get",
    "SCRIPT": "./script/testScript2.js"
  }
]
```
* ***single JSON Config***
```
{
	"URL": "/test3",
    "METHOD:"post",
    "BODY":{
     "details": {
      "type": "array",
      "required": false,
      "rows": {
        "type": "object",
        "body": {
          "detail_id": {
            "type": "number"
          },
          "language": {
            "type": "string",
            "required": false,
            "regex64": "aBase64String",
            "length": 5
          },
          "title": {
            "type": "string",
            "required": false,
            "maxLength": 1024
          },
          "channel": {
            "type": "string",
            "required": false
          }
        }
      }
    }
    }
}
```
* ***A complext Config Desing***
```
{
  "group a": [
    {
      "URL": "/test5/:id",
      "METHOD": "DELETE",
      "SCRIPT": "./script/something.js"
    },
    {
      "URL": "/test6",
      "METHOD": "POST",
      "SCRIPT": "./script/something2.js"
    }
  ],
  "group b": [
    {
      "URL": "/test7",
      "METHOD": "PUT",
      "SCRIPT": "./script/something3.js"
    }
  ]
}

```




## Authors

* **Amin Aghabeiki**


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

