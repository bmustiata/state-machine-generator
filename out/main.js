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
	    templateFolder = path.resolve(templateName);
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
	        transitions: [],
	        transitionSet: []
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
	            if (result.transitionSet.indexOf(transitionName) < 0) {
	                result.transitionSet.push(transitionName);
	            }
	            addTransition(startStateName, transitionName);
	        });
	    });
	    var finalResult = Object.assign({}, fileItems, result);
	    console.log("Item: " + JSON.stringify(finalResult));
	    return finalResult;
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
	var TemplateStateMachine_1 = __webpack_require__(12);
	var TRANSITIONS_RE = /^\s*\/\/ BEGIN_TRANSITIONS:\s*(.*)\s*$/m;
	var TRANSITIONS_END_RE = /^\s*\/\/ END_TRANSITIONS\s*$/m;
	var TRANSITION_SET_RE = /^\s*\/\/ BEGIN_TRANSITION_SET:\s*(.*)\s*$/m;
	var TRANSITION_SET_END_RE = /^\s*\/\/ END_TRANSITION_SET\s*$/m;
	var STATES_RE = /^\s*\/\/ BEGIN_STATES:\s*(.*)\s*$/m;
	var STATES_END_RE = /^\s*\/\/ END_STATES\s*$/m;
	var HANDLEBARS_RE = /^\s*\/\/\s*BEGIN_HANDLEBARS\s*$/m;
	var HANDLEBARS_CONTENT = /^\s*\/\/(.*)$/m;
	var HANDLEBARS_END_RE = /^\s*\/\/\s*END_HANDLEBARS\s*$/m;
	handlebars.registerHelper('capitalize', function (s) {
	    if (!s) {
	        return s;
	    }
	    return s.substr(0, 1).toUpperCase() + s.substr(1);
	});
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
	var BUNDLED_TEMPLATES = {
	    java: true,
	    ts: true,
	    dot: true,
	    asciidoctor: true
	};
	function isSimpleTemplate(name) {
	    return name in BUNDLED_TEMPLATES;
	}
	exports.isSimpleTemplate = isSimpleTemplate;
	function replacePackageAndName(line, model) {
	    line = line.replace(/Xyz/g, model.name);
	    line = line.replace(/com\.ciplogic\.statemachine/g, model.package);
	    return line;
	}
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
	    var readStateMachine = new TemplateStateMachine_1.TemplateStateMachine();
	    readStateMachine.onData(TemplateStateMachine_1.TemplateState.NORMAL_TEXT, function (line) {
	        var transitionMatch = TRANSITIONS_RE.exec(line);
	        if (transitionMatch) {
	            var pattern = transitionMatch[1];
	            readStateMachine.changeState(TemplateStateMachine_1.TemplateState.TRANSITIONS, pattern);
	            return;
	        }
	        var transitionSetMatch = TRANSITION_SET_RE.exec(line);
	        if (transitionSetMatch) {
	            var _pattern = transitionSetMatch[1];
	            readStateMachine.changeState(TemplateStateMachine_1.TemplateState.TRANSITION_SET, _pattern);
	            return;
	        }
	        var statesMatch = STATES_RE.exec(line);
	        if (statesMatch) {
	            var _pattern2 = statesMatch[1];
	            readStateMachine.changeState(TemplateStateMachine_1.TemplateState.STATES, _pattern2);
	            return;
	        }
	        if (HANDLEBARS_RE.test(line)) {
	            return TemplateStateMachine_1.TemplateState.HANDLEBARS;
	        }
	        resultContent.push(replacePackageAndName(line, model));
	    });
	    readStateMachine.onData(TemplateStateMachine_1.TemplateState.HANDLEBARS, function (line) {
	        if (HANDLEBARS_END_RE.test(line)) {
	            return TemplateStateMachine_1.TemplateState.NORMAL_TEXT;
	        }
	        var handlebarsContentMatcher = HANDLEBARS_CONTENT.exec(line);
	        if (!handlebarsContentMatcher) {
	            console.error("All lines in the handlebars block should be " + "preceeded by a comment `//`, that will be removed. Line:", line);
	            process.exit(2);
	        }
	        resultContent.push(replacePackageAndName(handlebarsContentMatcher[1], model));
	    });
	    readStateMachine.onData(TemplateStateMachine_1.TemplateState.STATES, function (line) {
	        if (STATES_END_RE.test(line)) {
	            return TemplateStateMachine_1.TemplateState.NORMAL_TEXT;
	        }
	    });
	    readStateMachine.onData(TemplateStateMachine_1.TemplateState.TRANSITIONS, function (line) {
	        if (TRANSITIONS_END_RE.test(line)) {
	            return TemplateStateMachine_1.TemplateState.NORMAL_TEXT;
	        }
	    });
	    readStateMachine.onData(TemplateStateMachine_1.TemplateState.TRANSITION_SET, function (line) {
	        if (TRANSITION_SET_END_RE.test(line)) {
	            return TemplateStateMachine_1.TemplateState.NORMAL_TEXT;
	        }
	    });
	    readStateMachine.afterEnter(TemplateStateMachine_1.TemplateState.TRANSITIONS, function (ev) {
	        model.transitions.forEach(function (transition) {
	            var pattern = ev.data;
	            var transitionString = pattern.replace(/TRANSITION_NAME/g, transition.name).replace(/FROM_STATE/g, transition.startState).replace(/TO_STATE/g, transition.endState);
	            resultContent.push(replacePackageAndName(transitionString, model));
	        });
	    });
	    readStateMachine.afterEnter(TemplateStateMachine_1.TemplateState.TRANSITION_SET, function (ev) {
	        var pattern = ev.data;
	        model.transitionSet.forEach(function (transitionName) {
	            var transitionString = pattern.replace(/TRANSITION_NAME/g, transitionName);
	            resultContent.push(replacePackageAndName(transitionString, model));
	        });
	    });
	    readStateMachine.afterEnter(TemplateStateMachine_1.TemplateState.STATES, function (ev) {
	        model.states.forEach(function (state) {
	            var pattern = ev.data;
	            var stateString = pattern.replace('STATE_NAME', state);
	            resultContent.push(replacePackageAndName(stateString, model));
	        });
	    });
	    var resultContent = [];
	    var content = fs.readFileSync(templateFilePath, 'utf-8').split(/\r?\n/g);
	    content.forEach(function (data) {
	        return readStateMachine.sendData(data);
	    });
	    var contentFn = handlebars.compile(resultContent.join('\n'), {
	        preventIndent: true
	    });
	    var renderedContent = contentFn(model);
	    fs.writeFileSync(targetFilePath, renderedContent, { encoding: 'utf-8' });
	}
	exports.applyTemplate = applyTemplate;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = require("handlebars");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var TemplateState;
	(function (TemplateState) {
	    TemplateState[TemplateState["NORMAL_TEXT"] = 0] = "NORMAL_TEXT";
	    TemplateState[TemplateState["TRANSITIONS"] = 1] = "TRANSITIONS";
	    TemplateState[TemplateState["TRANSITION_SET"] = 2] = "TRANSITION_SET";
	    TemplateState[TemplateState["STATES"] = 3] = "STATES";
	    TemplateState[TemplateState["HANDLEBARS"] = 4] = "HANDLEBARS";
	})(TemplateState = exports.TemplateState || (exports.TemplateState = {}));
	
	var TemplateStateChangeEvent = function () {
	    function TemplateStateChangeEvent(_previousState, _targetState, data) {
	        _classCallCheck(this, TemplateStateChangeEvent);
	
	        this._previousState = _previousState;
	        this._targetState = _targetState;
	        this.data = data;
	    }
	
	    _createClass(TemplateStateChangeEvent, [{
	        key: "cancel",
	        value: function cancel() {
	            this._cancelled = true;
	        }
	    }, {
	        key: "previousState",
	        get: function get() {
	            return this._previousState;
	        }
	    }, {
	        key: "targetState",
	        get: function get() {
	            return this._targetState;
	        }
	    }]);
	
	    return TemplateStateChangeEvent;
	}();
	
	exports.TemplateStateChangeEvent = TemplateStateChangeEvent;
	
	var TemplateStateError = function (_Error) {
	    _inherits(TemplateStateError, _Error);
	
	    function TemplateStateError() {
	        _classCallCheck(this, TemplateStateError);
	
	        return _possibleConstructorReturn(this, (TemplateStateError.__proto__ || Object.getPrototypeOf(TemplateStateError)).apply(this, arguments));
	    }
	
	    return TemplateStateError;
	}(Error);
	
	exports.TemplateStateError = TemplateStateError;
	var transitionSet = {};
	var linkMap = {};
	registerTransition("startTransitions", TemplateState.NORMAL_TEXT, TemplateState.TRANSITIONS);
	registerTransition("startTransitionSet", TemplateState.NORMAL_TEXT, TemplateState.TRANSITION_SET);
	registerTransition("startStates", TemplateState.NORMAL_TEXT, TemplateState.STATES);
	registerTransition("startHandlebars", TemplateState.NORMAL_TEXT, TemplateState.HANDLEBARS);
	registerTransition("normalText", TemplateState.TRANSITIONS, TemplateState.NORMAL_TEXT);
	registerTransition("normalText", TemplateState.TRANSITION_SET, TemplateState.NORMAL_TEXT);
	registerTransition("normalText", TemplateState.STATES, TemplateState.NORMAL_TEXT);
	registerTransition("normalText", TemplateState.HANDLEBARS, TemplateState.NORMAL_TEXT);
	
	var TemplateStateMachine = function () {
	    function TemplateStateMachine(initialState) {
	        _classCallCheck(this, TemplateStateMachine);
	
	        this.currentState = null;
	        this.transitionListeners = {};
	        this.dataListeners = {};
	        this.initialState = initialState || 0;
	        this.transitionListeners[TemplateState.NORMAL_TEXT] = new EventListener();
	        this.transitionListeners[TemplateState.TRANSITIONS] = new EventListener();
	        this.transitionListeners[TemplateState.TRANSITION_SET] = new EventListener();
	        this.transitionListeners[TemplateState.STATES] = new EventListener();
	        this.transitionListeners[TemplateState.HANDLEBARS] = new EventListener();
	        this.dataListeners[TemplateState.NORMAL_TEXT] = new EventListener();
	        this.dataListeners[TemplateState.TRANSITIONS] = new EventListener();
	        this.dataListeners[TemplateState.TRANSITION_SET] = new EventListener();
	        this.dataListeners[TemplateState.STATES] = new EventListener();
	        this.dataListeners[TemplateState.HANDLEBARS] = new EventListener();
	    }
	
	    _createClass(TemplateStateMachine, [{
	        key: "startTransitions",
	        value: function startTransitions(data) {
	            return this.transition("startTransitions", data);
	        }
	    }, {
	        key: "startTransitionSet",
	        value: function startTransitionSet(data) {
	            return this.transition("startTransitionSet", data);
	        }
	    }, {
	        key: "startStates",
	        value: function startStates(data) {
	            return this.transition("startStates", data);
	        }
	    }, {
	        key: "startHandlebars",
	        value: function startHandlebars(data) {
	            return this.transition("startHandlebars", data);
	        }
	    }, {
	        key: "normalText",
	        value: function normalText(data) {
	            return this.transition("normalText", data);
	        }
	    }, {
	        key: "ensureStateMachineInitialized",
	        value: function ensureStateMachineInitialized() {
	            if (this.currentState == null) {
	                this.changeStateImpl(this.initialState, null);
	            }
	        }
	    }, {
	        key: "changeState",
	        value: function changeState(targetState, data) {
	            this.ensureStateMachineInitialized();
	            return this.changeStateImpl(targetState, data);
	        }
	    }, {
	        key: "changeStateImpl",
	        value: function changeStateImpl(targetState, data) {
	            if (typeof targetState == 'undefined') {
	                throw new Error('No target state specified. Can not change the state.');
	            }
	            var stateChangeEvent = new TemplateStateChangeEvent(this.currentState, targetState, data);
	            if (this.currentChangeStateEvent) {
	                throw new TemplateStateError("The TemplateStateMachine is already in a changeState (" + this.currentChangeStateEvent.previousState + " -> " + this.currentChangeStateEvent.targetState + "). " + ("Transitioning the state machine (" + this.currentState + " -> " + targetState + ") in `before` events is not supported."));
	            }
	            if (this.currentState != null && !transitionSet[this.currentState << 16 | targetState]) {
	                console.error("No transition exists between " + this.currentState + " -> " + targetState + ".");
	                console.error(new Error().stack);
	                return this.currentState;
	            }
	            this.currentChangeStateEvent = stateChangeEvent;
	            if (stateChangeEvent.previousState != null) {
	                this.transitionListeners[stateChangeEvent.previousState].fire(EventType.BEFORE_LEAVE, stateChangeEvent);
	            }
	            this.transitionListeners[stateChangeEvent.targetState].fire(EventType.BEFORE_ENTER, stateChangeEvent);
	            if (stateChangeEvent._cancelled) {
	                return this.currentState;
	            }
	            this.currentState = targetState;
	            this.currentChangeStateEvent = null;
	            if (stateChangeEvent.previousState != null) {
	                this.transitionListeners[stateChangeEvent.previousState].fire(EventType.AFTER_LEAVE, stateChangeEvent);
	            }
	            this.transitionListeners[stateChangeEvent.targetState].fire(EventType.AFTER_ENTER, stateChangeEvent);
	            return this.currentState;
	        }
	    }, {
	        key: "transition",
	        value: function transition(linkName, data) {
	            this.ensureStateMachineInitialized();
	            var sourceState = linkMap[this.currentState];
	            if (!sourceState) {
	                return null;
	            }
	            var targetState = sourceState[linkName];
	            if (typeof targetState == 'undefined') {
	                return null;
	            }
	            return this.changeState(targetState, data);
	        }
	    }, {
	        key: "beforeEnter",
	        value: function beforeEnter(state, callback) {
	            return this.transitionListeners[state].addListener(EventType.BEFORE_ENTER, callback);
	        }
	    }, {
	        key: "afterEnter",
	        value: function afterEnter(state, callback) {
	            return this.transitionListeners[state].addListener(EventType.AFTER_ENTER, callback);
	        }
	    }, {
	        key: "beforeLeave",
	        value: function beforeLeave(state, callback) {
	            return this.transitionListeners[state].addListener(EventType.BEFORE_LEAVE, callback);
	        }
	    }, {
	        key: "afterLeave",
	        value: function afterLeave(state, callback) {
	            return this.transitionListeners[state].addListener(EventType.AFTER_LEAVE, callback);
	        }
	    }, {
	        key: "onData",
	        value: function onData(state, callback) {
	            return this.dataListeners[state].addListener('data', callback);
	        }
	    }, {
	        key: "sendData",
	        value: function sendData(data) {
	            this.ensureStateMachineInitialized();
	            var targetState = this.dataListeners[this.currentState].fire('data', data);
	            if (targetState != null) {
	                return this.changeState(targetState, data);
	            }
	            return this.currentState;
	        }
	    }, {
	        key: "state",
	        get: function get() {
	            this.ensureStateMachineInitialized();
	            return this.currentState;
	        }
	    }]);
	
	    return TemplateStateMachine;
	}();
	
	exports.TemplateStateMachine = TemplateStateMachine;
	function registerTransition(name, fromState, toState) {
	    transitionSet[fromState << 16 | toState] = true;
	    if (!name) {
	        return;
	    }
	    var fromMap = linkMap[fromState];
	    if (!fromMap) {
	        fromMap = linkMap[fromState] = {};
	    }
	    fromMap[name] = toState;
	}
	var EventType = {
	    BEFORE_ENTER: 'before-enter',
	    BEFORE_LEAVE: 'before-leave',
	    AFTER_LEAVE: 'after-leave',
	    AFTER_ENTER: 'after-enter'
	};
	
	var EventListener = function () {
	    function EventListener() {
	        _classCallCheck(this, EventListener);
	
	        this.registered = {};
	    }
	
	    _createClass(EventListener, [{
	        key: "addListener",
	        value: function addListener(eventName, callback) {
	            var eventListeners = this.registered[eventName];
	            if (!eventListeners) {
	                eventListeners = this.registered[eventName] = new Set();
	            }
	            eventListeners.add(callback);
	            return {
	                detach: function detach() {
	                    eventListeners.delete(callback);
	                }
	            };
	        }
	    }, {
	        key: "fire",
	        value: function fire(eventName, ev) {
	            if (!this.registered[eventName]) {
	                return;
	            }
	            var result = void 0;
	            this.registered[eventName].forEach(function (it) {
	                try {
	                    var potentialResult = it.call(null, ev);
	                    if (typeof potentialResult !== 'undefined' && typeof result != 'undefined') {
	                        throw new TemplateStateError("Data is already returned.");
	                    }
	                    result = potentialResult;
	                } catch (e) {
	                    if (e instanceof TemplateStateError) {
	                        throw e;
	                    }
	                }
	            });
	            return result;
	        }
	    }]);

	    return EventListener;
	}();

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map