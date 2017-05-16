#!/usr/bin/env node
require("source-map-support/register");

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var colors_1 = __webpack_require__(3);
	var path = __webpack_require__(4);
	var mkdirp = __webpack_require__(5);
	var klawSync = __webpack_require__(6);
	var Model_1 = __webpack_require__(7);
	var Template_1 = __webpack_require__(10);
	var templateName = process.argv[2];
	var fileName = process.argv[3];
	if (!fileName || !templateName) {
	    console.error(colors_1.red('You need to pass in a template and a model to process. (yml file)'));
	    console.error(colors_1.yellow('state-machine-generator TEMPLATE_NAME YML_FILE'));
	    process.exit(1);
	}
	var model = Model_1.readStateModel(fileName);
	var templateFolder = void 0;
	if (Template_1.isSimpleTemplate(templateName)) {
	    console.log("__dirname is " + __dirname);
	    templateFolder = path.resolve(path.join(__dirname, '../src/templates/', templateName, '/'));
	} else {
	    templateFolder = templateName;
	}
	var targetFolder = path.join('.', Template_1.createPackageFolder(model.package));
	klawSync(templateFolder, { nofile: true }).map(function (file) {
	    return file.path.substring(templateFolder.length + 1);
	}).forEach(function (folderPath) {
	    folderPath = folderPath.replace(/Xyz/g, model.name);
	    mkdirp.sync(path.join(targetFolder, folderPath));
	});
	klawSync(templateFolder, { nodir: true }).map(function (file) {
	    return file.path.substring(templateFolder.length + 1);
	}).forEach(function (filePath) {
	    Template_1.applyTemplate(path.join(templateFolder, filePath), targetFolder, filePath, model);
	});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = require("colors");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = require("mkdirp");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = require("klaw-sync");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var fs = __webpack_require__(8);
	var jsYaml = __webpack_require__(9);
	/**
	 * Read the state model from the yml file.
	 * @param fileName the file to read
	 */
	function readStateModel(fileName) {
	    var result = {
	        name: 'Test',
	        package: 'com.ciplogic.test',
	        states: [],
	        transitions: []
	    };
	    var content = fs.readFileSync(fileName, 'utf-8');
	    var fileItems = jsYaml.load(content);
	    if (!fileItems.name) {
	        throw new Error('`name` property was not specified in the yml file.');
	    }
	    result.name = fileItems.name;
	    if (!fileItems.package) {
	        throw new Error('`package` property was not specified in the yml file.');
	    }
	    result.package = fileItems.package;
	    if (!fileItems.states) {
	        throw new Error('`states` property was not specified in the yml file.');
	    }
	    result.states = fileItems.states;
	    console.log("file transitions " + JSON.stringify(fileItems.transitions));
	    function addTransition(startStateName, transitionName) {
	        var startState = result.states[result.states.indexOf(startStateName)];
	        var endStateName = fileItems.transitions[startStateName][transitionName];
	        var endState = result.states[result.states.indexOf(endStateName)];
	        console.log(startStateName + " -> " + endStateName + " (" + transitionName + ")");
	        var transition = {
	            name: transitionName,
	            startState: startState,
	            endState: endState
	        };
	        result.transitions.push(transition);
	    }
	    if (!fileItems.transitions) {
	        throw new Error('`transitions` property was not specified in the yml file.');
	    }
	    Object.keys(fileItems.transitions).forEach(function (startStateName) {
	        Object.keys(fileItems.transitions[startStateName]).forEach(function (transitionName) {
	            addTransition(startStateName, transitionName);
	        });
	    });
	    console.log("Item: " + JSON.stringify(result));
	    return result;
	}
	exports.readStateModel = readStateModel;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = require("fs");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	module.exports = require("js-yaml");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var mkdirp = __webpack_require__(5);
	var path = __webpack_require__(4);
	var fs = __webpack_require__(8);
	var handlebars = __webpack_require__(11);
	var TRANSITIONS_RE = /^\s*\/\/ BEGIN_TRANSITIONS:\s*(.*)\s*$/m;
	var TRANSITIONS_END_RE = /^\s*\/\/ END_TRANSITIONS\s*$/m;
	var TRANSITION_SET_RE = /^\s*\/\/ BEGIN_TRANSITION_SET:\s*(.*)\s*$/m;
	var TRANSITION_SET_END_RE = /^\s*\/\/ END_TRANSITION_SET\s*$/m;
	var STATES_RE = /^\s*\/\/ BEGIN_STATES:\s*(.*)\s*$/m;
	var STATES_END_RE = /^\s*\/\/ END_STATES\s*$/m;
	/**
	 *
	 * @param packageName The folder sub structure to create.
	 */
	function createPackageFolder(packageName) {
	    console.log("package: " + packageName);
	    var folder = packageName.replace(/\./g, '/');
	    mkdirp.sync(folder);
	    return folder;
	}
	exports.createPackageFolder = createPackageFolder;
	function isSimpleTemplate(name) {
	    return 'java' == name || 'ts' == name;
	}
	exports.isSimpleTemplate = isSimpleTemplate;
	function replacePackageAndName(line, model) {
	    line = line.replace(/Xyz/g, model.name);
	    line = line.replace(/com\.ciplogic\.statemachine/g, model.package);
	    return line;
	}
	var transitionsReading = false;
	var transitionSetReading = false;
	var stateReading = false;
	/**
	 * Write the template file.
	 * @param templateFilePath The source template.
	 * @param targetFilePath The target file to write.
	 * @param filePath Internal path inside the template folder.
	 * @param model
	 */
	function applyTemplate(templateFilePath, targetFolder, filePath, model) {
	    filePath = filePath.replace(/Xyz/g, model.name);
	    var targetFilePath = path.join(targetFolder, filePath);
	    var resultContent = [];
	    console.log("Reading " + templateFilePath);
	    var content = fs.readFileSync(templateFilePath, 'utf-8');
	    var contentFn = handlebars.compile(content, {
	        preventIndent: true
	    });
	    var renderedContent = contentFn(model).split(/\r?\n/g);
	    console.log('Readed content: ', renderedContent);
	    renderedContent.forEach(function (line) {
	        if (transitionsReading) {
	            if (TRANSITIONS_END_RE.test(line)) {
	                transitionsReading = false;
	            }
	            return; // ignore line
	        }
	        if (transitionSetReading) {
	            if (TRANSITION_SET_END_RE.test(line)) {
	                transitionSetReading = false;
	            }
	            return; // ignore the line
	        }
	        if (stateReading) {
	            if (STATES_END_RE.test(line)) {
	                stateReading = false;
	            }
	            return; // also ingore line
	        }
	        var transitionMatch = TRANSITIONS_RE.exec(line);
	        if (transitionMatch) {
	            var pattern = transitionMatch[1];
	            model.transitions.forEach(function (transition) {
	                var transitionString = pattern.replace(/TRANSITION_NAME/g, transition.name).replace(/FROM_STATE/g, transition.startState).replace(/TO_STATE/g, transition.endState);
	                resultContent.push(replacePackageAndName(transitionString, model));
	            });
	            transitionsReading = true;
	            return;
	        }
	        var transitionSetMatch = TRANSITION_SET_RE.exec(line);
	        if (transitionSetMatch) {
	            var _pattern = transitionSetMatch[1];
	            var transitionSet = new Set(model.transitions.map(function (it) {
	                return it.name;
	            }));
	            transitionSet.forEach(function (transitionName) {
	                var transitionString = _pattern.replace(/TRANSITION_NAME/g, transitionName);
	                resultContent.push(replacePackageAndName(transitionString, model));
	            });
	            transitionSetReading = true;
	            return;
	        }
	        var stateMatch = STATES_RE.exec(line);
	        if (stateMatch) {
	            var _pattern2 = stateMatch[1];
	            model.states.forEach(function (state) {
	                var stateString = _pattern2.replace('STATE_NAME', state);
	                resultContent.push(replacePackageAndName(stateString, model));
	            });
	            stateReading = true;
	            return;
	        }
	        resultContent.push(replacePackageAndName(line, model));
	    });
	    var fileContent = resultContent.join('\n');
	    fs.writeFileSync(targetFilePath, fileContent, { encoding: 'utf-8' });
	}
	exports.applyTemplate = applyTemplate;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = require("handlebars");

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map