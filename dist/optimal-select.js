(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["OptimalSelect"] = factory();
	else
		root["OptimalSelect"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/adapt.js"
/*!**********************!*\
  !*** ./src/adapt.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ adapt)
/* harmony export */ });
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * # Adapt
 *
 * Check and extend the environment for universal usage.
 */

/**
 * Modify the context based on the environment
 *
 * @param  {HTMLELement} element - [description]
 * @param  {Object}      options - [description]
 * @return {boolean}             - [description]
 */
function adapt(element, options) {
  // detect environment setup
  if (__webpack_require__.g.document) {
    return false;
  } else {
    __webpack_require__.g.document = options.context || function () {
      var root = element;
      while (root.parent) {
        root = root.parent;
      }
      return root;
    }();
  }

  // https://github.com/fb55/domhandler/blob/master/index.js#L75
  var ElementPrototype = Object.getPrototypeOf(__webpack_require__.g.document);

  // alternative descriptor to access elements with filtering invalid elements (e.g. textnodes)
  if (!Object.getOwnPropertyDescriptor(ElementPrototype, 'childTags')) {
    Object.defineProperty(ElementPrototype, 'childTags', {
      enumerable: true,
      get: function get() {
        return this.children.filter(function (node) {
          // https://github.com/fb55/domelementtype/blob/master/index.js#L12
          return node.type === 'tag' || node.type === 'script' || node.type === 'style';
        });
      }
    });
  }
  if (!Object.getOwnPropertyDescriptor(ElementPrototype, 'attributes')) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
    Object.defineProperty(ElementPrototype, 'attributes', {
      enumerable: true,
      get: function get() {
        var attribs = this.attribs;
        var attributesNames = Object.keys(attribs);
        var NamedNodeMap = attributesNames.reduce(function (attributes, attributeName, index) {
          attributes[index] = {
            name: attributeName,
            value: attribs[attributeName]
          };
          return attributes;
        }, {});
        Object.defineProperty(NamedNodeMap, 'length', {
          enumerable: false,
          configurable: false,
          value: attributesNames.length
        });
        return NamedNodeMap;
      }
    });
  }
  if (!ElementPrototype.getAttribute) {
    // https://docs.webplatform.org/wiki/dom/Element/getAttribute
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
    ElementPrototype.getAttribute = function (name) {
      return this.attribs[name] || null;
    };
  }
  if (!ElementPrototype.getElementsByTagName) {
    // https://docs.webplatform.org/wiki/dom/Document/getElementsByTagName
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
    ElementPrototype.getElementsByTagName = function (tagName) {
      var HTMLCollection = [];
      traverseDescendants(this.childTags, function (descendant) {
        if (descendant.name === tagName || tagName === '*') {
          HTMLCollection.push(descendant);
        }
      });
      return HTMLCollection;
    };
  }
  if (!ElementPrototype.getElementsByClassName) {
    // https://docs.webplatform.org/wiki/dom/Document/getElementsByClassName
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
    ElementPrototype.getElementsByClassName = function (className) {
      var names = className.trim().replace(/\s+/g, ' ').split(' ');
      var HTMLCollection = [];
      traverseDescendants([this], function (descendant) {
        var descendantClassName = descendant.attribs["class"];
        if (descendantClassName && names.every(function (name) {
          return descendantClassName.indexOf(name) > -1;
        })) {
          HTMLCollection.push(descendant);
        }
      });
      return HTMLCollection;
    };
  }
  if (!ElementPrototype.querySelectorAll) {
    // https://docs.webplatform.org/wiki/css/selectors_api/querySelectorAll
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
    ElementPrototype.querySelectorAll = function (selectors) {
      var _this = this;
      selectors = selectors.replace(/(>)(\S)/g, '$1 $2').trim(); // add space for '>' selector

      // using right to left execution => https://github.com/fb55/css-select#how-does-it-work
      var instructions = getInstructions(selectors);
      var discover = instructions.shift();
      var total = instructions.length;
      return discover(this).filter(function (node) {
        var step = 0;
        while (step < total) {
          node = instructions[step](node, _this);
          if (!node) {
            // hierarchy doesn't match
            return false;
          }
          step += 1;
        }
        return true;
      });
    };
  }
  if (!ElementPrototype.contains) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    ElementPrototype.contains = function (element) {
      var inclusive = false;
      traverseDescendants([this], function (descendant, done) {
        if (descendant === element) {
          inclusive = true;
          done();
        }
      });
      return inclusive;
    };
  }
  return true;
}

/**
 * Retrieve transformation steps
 *
 * @param  {Array.<string>}   selectors - [description]
 * @return {Array.<Function>}           - [description]
 */
function getInstructions(selectors) {
  return selectors.split(' ').reverse().map(function (selector, step) {
    var discover = step === 0;
    var _selector$split = selector.split(':'),
      _selector$split2 = _slicedToArray(_selector$split, 2),
      type = _selector$split2[0],
      pseudo = _selector$split2[1];
    var validate = null;
    var instruction = null;
    switch (true) {
      // child: '>'
      case />/.test(type):
        instruction = function checkParent(node) {
          return function (validate) {
            return validate(node.parent) && node.parent;
          };
        };
        break;

      // class: '.'
      case /^\./.test(type):
        var names = type.substr(1).split('.');
        validate = function validate(node) {
          var nodeClassName = node.attribs["class"];
          return nodeClassName && names.every(function (name) {
            return nodeClassName.indexOf(name) > -1;
          });
        };
        instruction = function checkClass(node, root) {
          if (discover) {
            return node.getElementsByClassName(names.join(' '));
          }
          return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
        };
        break;

      // attribute: '[key="value"]'
      case /^\[/.test(type):
        var _type$replace$split = type.replace(/\[|\]|"/g, '').split('='),
          _type$replace$split2 = _slicedToArray(_type$replace$split, 2),
          attributeKey = _type$replace$split2[0],
          attributeValue = _type$replace$split2[1];
        validate = function validate(node) {
          var hasAttribute = Object.keys(node.attribs).indexOf(attributeKey) > -1;
          if (hasAttribute) {
            // regard optional attributeValue
            if (!attributeValue || node.attribs[attributeKey] === attributeValue) {
              return true;
            }
          }
          return false;
        };
        instruction = function checkAttribute(node, root) {
          if (discover) {
            var NodeList = [];
            traverseDescendants([node], function (descendant) {
              if (validate(descendant)) {
                NodeList.push(descendant);
              }
            });
            return NodeList;
          }
          return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
        };
        break;

      // id: '#'
      case /^#/.test(type):
        var id = type.substr(1);
        validate = function validate(node) {
          return node.attribs.id === id;
        };
        instruction = function checkId(node, root) {
          if (discover) {
            var NodeList = [];
            traverseDescendants([node], function (descendant, done) {
              if (validate(descendant)) {
                NodeList.push(descendant);
                done();
              }
            });
            return NodeList;
          }
          return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
        };
        break;

      // universal: '*'
      case /\*/.test(type):
        validate = function validate(node) {
          return true;
        };
        instruction = function checkUniversal(node, root) {
          if (discover) {
            var NodeList = [];
            traverseDescendants([node], function (descendant) {
              return NodeList.push(descendant);
            });
            return NodeList;
          }
          return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
        };
        break;

      // tag: '...'
      default:
        validate = function validate(node) {
          return node.name === type;
        };
        instruction = function checkTag(node, root) {
          if (discover) {
            var NodeList = [];
            traverseDescendants([node], function (descendant) {
              if (validate(descendant)) {
                NodeList.push(descendant);
              }
            });
            return NodeList;
          }
          return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
        };
    }
    if (!pseudo) {
      return instruction;
    }
    var rule = pseudo.match(/-(child|type)\((\d+)\)$/);
    var kind = rule[1];
    var index = parseInt(rule[2], 10) - 1;
    var validatePseudo = function validatePseudo(node) {
      if (node) {
        var compareSet = node.parent.childTags;
        if (kind === 'type') {
          compareSet = compareSet.filter(validate);
        }
        var nodeIndex = compareSet.findIndex(function (child) {
          return child === node;
        });
        if (nodeIndex === index) {
          return true;
        }
      }
      return false;
    };
    return function enhanceInstruction(node) {
      var match = instruction(node);
      if (discover) {
        return match.reduce(function (NodeList, matchedNode) {
          if (validatePseudo(matchedNode)) {
            NodeList.push(matchedNode);
          }
          return NodeList;
        }, []);
      }
      return validatePseudo(match) && match;
    };
  });
}

/**
 * Walking recursive to invoke callbacks
 *
 * @param {Array.<HTMLElement>} nodes   - [description]
 * @param {Function}            handler - [description]
 */
function traverseDescendants(nodes, handler) {
  nodes.forEach(function (node) {
    var progress = true;
    handler(node, function () {
      return progress = false;
    });
    if (node.childTags && progress) {
      traverseDescendants(node.childTags, handler);
    }
  });
}

/**
 * Bubble up from bottom to top
 *
 * @param  {HTMLELement} node     - [description]
 * @param  {HTMLELement} root     - [description]
 * @param  {Function}    validate - [description]
 * @return {HTMLELement}          - [description]
 */
function getAncestor(node, root, validate) {
  while (node.parent) {
    node = node.parent;
    if (validate(node)) {
      return node;
    }
    if (node === root) {
      break;
    }
  }
  return null;
}

/***/ },

/***/ "./src/common.js"
/*!***********************!*\
  !*** ./src/common.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCommonAncestor: () => (/* binding */ getCommonAncestor),
/* harmony export */   getCommonProperties: () => (/* binding */ getCommonProperties)
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./src/utilities.js");
/**
 * # Common
 *
 * Process collections for similarities.
 */



/**
 * Find the last common ancestor of elements
 *
 * @param  {Array.<HTMLElements>} elements - [description]
 * @return {HTMLElement}                   - [description]
 */
function getCommonAncestor(elements) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$root = options.root,
    root = _options$root === void 0 ? document : _options$root;
  var ancestors = [];
  elements.forEach(function (element, index) {
    var parents = [];
    while (element !== root) {
      element = element.parentNode;
      parents.unshift(element);
    }
    ancestors[index] = parents;
  });
  ancestors.sort(function (curr, next) {
    return curr.length - next.length;
  });
  var shallowAncestor = ancestors.shift();
  var ancestor = null;
  var _loop = function _loop() {
    var parent = shallowAncestor[i];
    var missing = ancestors.some(function (otherParents) {
      return !otherParents.some(function (otherParent) {
        return otherParent === parent;
      });
    });
    if (missing) {
      // TODO: find similar sub-parents, not the top root, e.g. sharing a class selector
      return 1; // break
    }
    ancestor = parent;
  };
  for (var i = 0, l = shallowAncestor.length; i < l; i++) {
    if (_loop()) break;
  }
  return ancestor;
}

/**
 * Get a set of common properties of elements
 *
 * @param  {Array.<HTMLElement>} elements - [description]
 * @param  {Object}              options  - [description]
 * @param  {number}              options.outlierTolerance - Tolerance for outliers (0-1).
 *                               0 means all elements must have the property (default).
 *                               0.2 means 20% outliers are ignored (80% threshold).
 * @return {Object}                       - [description]
 */
function getCommonProperties(elements) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$ignore = options.ignore,
    ignore = _options$ignore === void 0 ? {} : _options$ignore,
    _options$outlierToler = options.outlierTolerance,
    outlierTolerance = _options$outlierToler === void 0 ? 0 : _options$outlierToler;

  // Calculate majority threshold from outlier tolerance
  var majorityThreshold = 1 - outlierTolerance;
  var totalElements = elements.length;

  // Normalize ignore predicates (same logic as match.js)
  var normalizedIgnore = {};
  Object.keys(ignore).forEach(function (type) {
    var predicate = ignore[type];
    if (typeof predicate === 'function') {
      normalizedIgnore[type] = predicate;
      return;
    }
    if (typeof predicate === 'number') {
      predicate = predicate.toString();
    }
    if (typeof predicate === 'string') {
      predicate = new RegExp((0,_utilities__WEBPACK_IMPORTED_MODULE_0__.escapeValue)(predicate).replace(/\\/g, '\\\\'));
    }
    if (typeof predicate === 'boolean') {
      predicate = predicate ? /(?:)/ : /.^/;
    }
    // check class-/attributename for regex
    normalizedIgnore[type] = function (name, value) {
      return predicate.test(value);
    };
  });
  var checkIgnore = function checkIgnore(type, name, value) {
    var predicate = normalizedIgnore[type];
    if (!predicate) return false;
    return predicate(name, value);
  };

  // Frequency counters
  var classCounter = {}; // className -> count
  var attributeCounter = {}; // "name=value" -> { name, value, count }
  var tagCounter = {}; // tagName -> count

  // Count frequencies for all elements
  elements.forEach(function (element) {
    // ~ classes
    var classAttr = element.getAttribute('class');
    if (classAttr) {
      var classes = classAttr.trim().split(' ').filter(function (className) {
        return className && !checkIgnore('class', className, className);
      });
      classes.forEach(function (className) {
        classCounter[className] = (classCounter[className] || 0) + 1;
      });
    }

    // ~ attributes
    var elementAttributes = element.attributes;
    Object.keys(elementAttributes).forEach(function (key) {
      var attribute = elementAttributes[key];
      var attributeName = attribute.name;
      var attributeValue = attribute.value;
      // NOTE: workaround detection for non-standard phantomjs NamedNodeMap behaviour
      // (issue: https://github.com/ariya/phantomjs/issues/14634)
      if (attribute && attributeName !== 'class') {
        // Filter out ignored attributes
        if (!checkIgnore(attributeName, attributeName, attributeValue) && !checkIgnore('attribute', attributeName, attributeValue)) {
          var _key = "".concat(attributeName, "=").concat(attributeValue);
          if (!attributeCounter[_key]) {
            attributeCounter[_key] = {
              name: attributeName,
              value: attributeValue,
              count: 0
            };
          }
          attributeCounter[_key].count++;
        }
      }
    });

    // ~ tag
    var tag = element.tagName.toLowerCase();
    if (!checkIgnore('tag', null, tag)) {
      tagCounter[tag] = (tagCounter[tag] || 0) + 1;
    }
  });

  // Build common properties based on majority threshold
  var commonProperties = {
    classes: [],
    attributes: {},
    tag: null
  };

  // Filter classes by threshold
  var majorityClasses = Object.keys(classCounter).filter(function (className) {
    return classCounter[className] / totalElements >= majorityThreshold;
  });
  if (majorityClasses.length) {
    commonProperties.classes = majorityClasses;
  } else {
    delete commonProperties.classes;
  }

  // Filter attributes by threshold (keep only the most frequent value per attribute name)
  var majorityAttributes = {};
  var attributeMaxCount = {}; // Track max count per attribute name
  Object.keys(attributeCounter).forEach(function (key) {
    var _attributeCounter$key = attributeCounter[key],
      name = _attributeCounter$key.name,
      value = _attributeCounter$key.value,
      count = _attributeCounter$key.count;
    if (count / totalElements >= majorityThreshold) {
      // Only keep the most frequent value for each attribute name
      if (!attributeMaxCount[name] || count > attributeMaxCount[name]) {
        majorityAttributes[name] = value;
        attributeMaxCount[name] = count;
      }
    }
  });
  if (Object.keys(majorityAttributes).length) {
    commonProperties.attributes = majorityAttributes;
  } else {
    delete commonProperties.attributes;
  }

  // Find majority tag (most frequent tag that meets threshold)
  var majorityTag = null;
  var maxTagCount = 0;
  Object.keys(tagCounter).forEach(function (tag) {
    var count = tagCounter[tag];
    if (count / totalElements >= majorityThreshold && count > maxTagCount) {
      majorityTag = tag;
      maxTagCount = count;
    }
  });
  if (majorityTag) {
    commonProperties.tag = majorityTag;
  } else {
    delete commonProperties.tag;
  }
  return commonProperties;
}

/***/ },

/***/ "./src/match.js"
/*!**********************!*\
  !*** ./src/match.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ match)
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./src/utilities.js");
/**
 * # Match
 *
 * Retrieve selector for a node.
 */


var defaultIgnore = {
  attribute: function attribute(attributeName) {
    return ['style', 'data-reactid', 'data-react-checksum'].indexOf(attributeName) > -1;
  }
};

/**
 * Get the path of the element
 *
 * @param  {HTMLElement} node    - [description]
 * @param  {Object}      options - [description]
 * @return {string}              - [description]
 */
function match(node, options) {
  var _options$root = options.root,
    root = _options$root === void 0 ? document : _options$root,
    _options$skip = options.skip,
    skip = _options$skip === void 0 ? null : _options$skip,
    _options$priority = options.priority,
    priority = _options$priority === void 0 ? ['id', 'class', 'href', 'src'] : _options$priority,
    _options$ignore = options.ignore,
    ignore = _options$ignore === void 0 ? {} : _options$ignore;
  var path = [];
  var element = node;
  var length = path.length;
  var ignoreClass = false;
  var skipCompare = skip && (Array.isArray(skip) ? skip : [skip]).map(function (entry) {
    if (typeof entry !== 'function') {
      return function (element) {
        return element === entry;
      };
    }
    return entry;
  });
  var skipChecks = function skipChecks(element) {
    return skip && skipCompare.some(function (compare) {
      return compare(element);
    });
  };
  Object.keys(ignore).forEach(function (type) {
    if (type === 'class') {
      ignoreClass = true;
    }
    var predicate = ignore[type];
    if (typeof predicate === 'function') return;
    if (typeof predicate === 'number') {
      predicate = predicate.toString();
    }
    if (typeof predicate === 'string') {
      predicate = new RegExp((0,_utilities__WEBPACK_IMPORTED_MODULE_0__.escapeValue)(predicate).replace(/\\/g, '\\\\'));
    }
    if (typeof predicate === 'boolean') {
      predicate = predicate ? /(?:)/ : /.^/;
    }
    // check class-/attributename for regex
    ignore[type] = function (name, value) {
      return predicate.test(value);
    };
  });
  if (ignoreClass) {
    var ignoreAttribute = ignore.attribute;
    ignore.attribute = function (name, value, defaultPredicate) {
      return ignore["class"](value) || ignoreAttribute && ignoreAttribute(name, value, defaultPredicate);
    };
  }
  while (element !== root) {
    if (skipChecks(element) !== true) {
      // ~ global
      if (checkAttributes(priority, element, ignore, path, root)) break;
      if (checkTag(element, ignore, path, root)) break;

      // ~ local
      checkAttributes(priority, element, ignore, path);
      if (path.length === length) {
        checkTag(element, ignore, path);
      }

      // define only one part each iteration
      if (path.length === length) {
        checkChilds(priority, element, ignore, path);
      }
    }
    element = element.parentNode;
    length = path.length;
  }
  if (element === root) {
    var pattern = findPattern(priority, element, ignore);
    path.unshift(pattern);
  }
  return path.join(' ');
}

/**
 * Extend path with attribute identifier
 *
 * @param  {Array.<string>} priority - [description]
 * @param  {HTMLElement}    element  - [description]
 * @param  {Object}         ignore   - [description]
 * @param  {Array.<string>} path     - [description]
 * @param  {HTMLElement}    parent   - [description]
 * @return {boolean}                 - [description]
 */
function checkAttributes(priority, element, ignore, path) {
  var parent = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : element.parentNode;
  var pattern = findAttributesPattern(priority, element, ignore);
  if (pattern) {
    var matches = parent.querySelectorAll(pattern);
    if (matches.length === 1) {
      path.unshift(pattern);
      return true;
    }
  }
  return false;
}

/**
 * Lookup attribute identifier
 *
 * @param  {Array.<string>} priority - [description]
 * @param  {HTMLElement}    element  - [description]
 * @param  {Object}         ignore   - [description]
 * @return {string?}                 - [description]
 */
function findAttributesPattern(priority, element, ignore) {
  var attributes = element.attributes;
  var sortedKeys = Object.keys(attributes).sort(function (curr, next) {
    var currPos = priority.indexOf(attributes[curr].name);
    var nextPos = priority.indexOf(attributes[next].name);
    if (nextPos === -1) {
      if (currPos === -1) {
        return 0;
      }
      return -1;
    }
    return currPos - nextPos;
  });
  for (var i = 0, l = sortedKeys.length; i < l; i++) {
    var key = sortedKeys[i];
    var attribute = attributes[key];
    var attributeName = attribute.name;
    var attributeValue = (0,_utilities__WEBPACK_IMPORTED_MODULE_0__.escapeValue)(attribute.value);
    var currentIgnore = ignore[attributeName] || ignore.attribute;
    var currentDefaultIgnore = defaultIgnore[attributeName] || defaultIgnore.attribute;
    if (checkIgnore(currentIgnore, attributeName, attributeValue, currentDefaultIgnore)) {
      continue;
    }
    var pattern = "[".concat(attributeName, "=\"").concat(attributeValue, "\"]");
    if (/\b\d/.test(attributeValue) === false) {
      if (attributeName === 'id') {
        pattern = "#".concat(attributeValue);
      }
      if (attributeName === 'class') {
        var className = attributeValue.trim().replace(/\s+/g, '.');
        pattern = ".".concat(className);
      }
    }
    return pattern;
  }
  return null;
}

/**
 * Extend path with tag identifier
 *
 * @param  {HTMLElement}    element - [description]
 * @param  {Object}         ignore  - [description]
 * @param  {Array.<string>} path    - [description]
 * @param  {HTMLElement}    parent  - [description]
 * @return {boolean}                - [description]
 */
function checkTag(element, ignore, path) {
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : element.parentNode;
  var pattern = findTagPattern(element, ignore);
  if (pattern) {
    var matches = parent.getElementsByTagName(pattern);
    if (matches.length === 1) {
      path.unshift(pattern);
      return true;
    }
  }
  return false;
}

/**
 * Lookup tag identifier
 *
 * @param  {HTMLElement} element - [description]
 * @param  {Object}      ignore  - [description]
 * @return {boolean}             - [description]
 */
function findTagPattern(element, ignore) {
  var tagName = element.tagName.toLowerCase();
  if (checkIgnore(ignore.tag, null, tagName)) {
    return null;
  }
  return tagName;
}

/**
 * Extend path with specific child identifier
 *
 * NOTE: 'childTags' is a custom property to use as a view filter for tags using 'adapter.js'
 *
 * @param  {Array.<string>} priority - [description]
 * @param  {HTMLElement}    element  - [description]
 * @param  {Object}         ignore   - [description]
 * @param  {Array.<string>} path     - [description]
 * @return {boolean}                 - [description]
 */
function checkChilds(priority, element, ignore, path) {
  var parent = element.parentNode;
  var children = parent.childTags || parent.children;
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    if (child === element) {
      var childPattern = findPattern(priority, child, ignore);
      if (!childPattern) {
        return console.warn("\n          Element couldn't be matched through strict ignore pattern!\n        ", child, ignore, childPattern);
      }
      var pattern = "> ".concat(childPattern, ":nth-child(").concat(i + 1, ")");
      path.unshift(pattern);
      return true;
    }
  }
  return false;
}

/**
 * Lookup identifier
 *
 * @param  {Array.<string>} priority - [description]
 * @param  {HTMLElement}    element  - [description]
 * @param  {Object}         ignore   - [description]
 * @return {string}                  - [description]
 */
function findPattern(priority, element, ignore) {
  var pattern = findAttributesPattern(priority, element, ignore);
  if (!pattern) {
    pattern = findTagPattern(element, ignore);
  }
  return pattern;
}

/**
 * Validate with custom and default functions
 *
 * @param  {Function} predicate        - [description]
 * @param  {string?}  name             - [description]
 * @param  {string}   value            - [description]
 * @param  {Function} defaultPredicate - [description]
 * @return {boolean}                   - [description]
 */
function checkIgnore(predicate, name, value, defaultPredicate) {
  if (!value) {
    return true;
  }
  var check = predicate || defaultPredicate;
  if (!check) {
    return false;
  }
  return check(name, value, defaultPredicate);
}

/***/ },

/***/ "./src/optimize.js"
/*!*************************!*\
  !*** ./src/optimize.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ optimize)
/* harmony export */ });
/* harmony import */ var _adapt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./adapt */ "./src/adapt.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities */ "./src/utilities.js");
/**
 * # Optimize
 *
 * 1.) Improve efficiency through shorter selectors by removing redundancy
 * 2.) Improve robustness through selector transformation
 */




/**
 * Apply different optimization techniques
 *
 * @param  {string}                          selector - [description]
 * @param  {HTMLElement|Array.<HTMLElement>} element  - [description]
 * @param  {Object}                          options  - [description]
 * @return {string}                                   - [description]
 */
function optimize(selector, elements) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // convert single entry and NodeList
  if (!Array.isArray(elements)) {
    elements = !elements.length ? [elements] : (0,_utilities__WEBPACK_IMPORTED_MODULE_1__.convertNodeList)(elements);
  }
  if (!elements.length || elements.some(function (element) {
    return element.nodeType !== 1;
  })) {
    throw new Error("Invalid input - to compare HTMLElements its necessary to provide a reference of the selected node(s)! (missing \"elements\")");
  }
  var globalModified = (0,_adapt__WEBPACK_IMPORTED_MODULE_0__["default"])(elements[0], options);

  // chunk parts outside of quotes (http://stackoverflow.com/a/25663729)
  var path = selector.replace(/> /g, '>').split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  if (path.length < 2) {
    return optimizePart('', selector, '', elements);
  }
  var shortened = [path.pop()];
  while (path.length > 1) {
    var current = path.pop();
    var prePart = path.join(' ');
    var postPart = shortened.join(' ');
    var pattern = "".concat(prePart, " ").concat(postPart);
    var matches = document.querySelectorAll(pattern);
    if (matches.length !== elements.length) {
      shortened.unshift(optimizePart(prePart, current, postPart, elements));
    }
  }
  shortened.unshift(path[0]);
  path = shortened;

  // optimize start + end
  path[0] = optimizePart('', path[0], path.slice(1).join(' '), elements);
  path[path.length - 1] = optimizePart(path.slice(0, -1).join(' '), path[path.length - 1], '', elements);
  if (globalModified) {
    delete __webpack_require__.g.document;
  }
  return path.join(' ').replace(/>/g, '> ').trim();
}

/**
 * Improve a chunk of the selector
 *
 * @param  {string}              prePart  - [description]
 * @param  {string}              current  - [description]
 * @param  {string}              postPart - [description]
 * @param  {Array.<HTMLElement>} elements - [description]
 * @return {string}                       - [description]
 */
function optimizePart(prePart, current, postPart, elements) {
  if (prePart.length) prePart = "".concat(prePart, " ");
  if (postPart.length) postPart = " ".concat(postPart);

  // robustness: attribute without value (generalization)
  if (/\[*\]/.test(current)) {
    var key = current.replace(/=.*$/, ']');
    var pattern = "".concat(prePart).concat(key).concat(postPart);
    var matches = document.querySelectorAll(pattern);
    if (compareResults(matches, elements)) {
      current = key;
    } else {
      // robustness: replace specific key-value with base tag (heuristic)
      var references = document.querySelectorAll("".concat(prePart).concat(key));
      var _loop = function _loop() {
          var reference = references[i];
          if (elements.some(function (element) {
            return reference.contains(element);
          })) {
            var description = reference.tagName.toLowerCase();
            pattern = "".concat(prePart).concat(description).concat(postPart);
            matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = description;
            }
            return 1; // break
          }
        },
        pattern,
        matches;
      for (var i = 0, l = references.length; i < l; i++) {
        if (_loop()) break;
      }
    }
  }

  // robustness: descendant instead child (heuristic)
  if (/>/.test(current)) {
    var descendant = current.replace(/>/, '');
    var pattern = "".concat(prePart).concat(descendant).concat(postPart);
    var matches = document.querySelectorAll(pattern);
    if (compareResults(matches, elements)) {
      current = descendant;
    }
  }

  // robustness: 'nth-of-type' instead 'nth-child' (heuristic)
  if (/:nth-child/.test(current)) {
    // TODO: consider complete coverage of 'nth-of-type' replacement
    var type = current.replace(/nth-child/g, 'nth-of-type');
    var pattern = "".concat(prePart).concat(type).concat(postPart);
    var matches = document.querySelectorAll(pattern);
    if (compareResults(matches, elements)) {
      current = type;
    }
  }

  // efficiency: combinations of classname (partial permutations)
  if (/\.\S+\.\S+/.test(current)) {
    var names = current.trim().split('.').slice(1).map(function (name) {
      return ".".concat(name);
    }).sort(function (curr, next) {
      return curr.length - next.length;
    });
    while (names.length) {
      var partial = current.replace(names.shift(), '').trim();
      var pattern = "".concat(prePart).concat(partial).concat(postPart).trim();
      if (!pattern.length || pattern.charAt(0) === '>' || pattern.charAt(pattern.length - 1) === '>') {
        break;
      }
      var matches = document.querySelectorAll(pattern);
      if (compareResults(matches, elements)) {
        current = partial;
      }
    }

    // robustness: degrade complex classname (heuristic)
    names = current && current.match(/\./g);
    if (names && names.length > 2) {
      var _references = document.querySelectorAll("".concat(prePart).concat(current));
      var _loop2 = function _loop2() {
          var reference = _references[i];
          if (elements.some(function (element) {
            return reference.contains(element);
          })) {
            // TODO:
            // - check using attributes + regard excludes
            var description = reference.tagName.toLowerCase();
            pattern = "".concat(prePart).concat(description).concat(postPart);
            matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = description;
            }
            return 1; // break
          }
        },
        pattern,
        matches;
      for (var i = 0, l = _references.length; i < l; i++) {
        if (_loop2()) break;
      }
    }
  }
  return current;
}

/**
 * Evaluate matches with expected elements
 *
 * @param  {Array.<HTMLElement>} matches  - [description]
 * @param  {Array.<HTMLElement>} elements - [description]
 * @return {Boolean}                      - [description]
 */
function compareResults(matches, elements) {
  var length = matches.length;
  return length === elements.length && elements.every(function (element) {
    for (var i = 0; i < length; i++) {
      if (matches[i] === element) {
        return true;
      }
    }
    return false;
  });
}

/***/ },

/***/ "./src/select.js"
/*!***********************!*\
  !*** ./src/select.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getQuerySelector),
/* harmony export */   getMultiSelector: () => (/* binding */ getMultiSelector),
/* harmony export */   getSingleSelector: () => (/* binding */ getSingleSelector)
/* harmony export */ });
/* harmony import */ var _adapt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./adapt */ "./src/adapt.js");
/* harmony import */ var _match__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./match */ "./src/match.js");
/* harmony import */ var _optimize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./optimize */ "./src/optimize.js");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utilities */ "./src/utilities.js");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common */ "./src/common.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/**
 * # Select
 *
 * Construct a unique CSS query selector to access the selected DOM element(s).
 * For longevity it applies different matching and optimization strategies.
 */







/**
 * Get a selector for the provided element
 *
 * @param  {HTMLElement} element - [description]
 * @param  {Object}      options - [description]
 * @return {string}              - [description]
 */
function getSingleSelector(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (element.nodeType === 3) {
    element = element.parentNode;
  }
  if (element.nodeType !== 1) {
    throw new Error("Invalid input - only HTMLElements or representations of them are supported! (not \"".concat(_typeof(element), "\")"));
  }
  var globalModified = (0,_adapt__WEBPACK_IMPORTED_MODULE_0__["default"])(element, options);
  var selector = (0,_match__WEBPACK_IMPORTED_MODULE_1__["default"])(element, options);
  var optimized = (0,_optimize__WEBPACK_IMPORTED_MODULE_2__["default"])(selector, element, options);

  // debug
  // console.log(`
  //   selector:  ${selector}
  //   optimized: ${optimized}
  // `)

  if (globalModified) {
    delete __webpack_require__.g.document;
  }
  return optimized;
}

/**
 * Get a selector to match multiple descendants from an ancestor
 *
 * @param  {Array.<HTMLElement>|NodeList} elements - [description]
 * @param  {Object}                       options  - [description]
 * @param  {number}                       options.outlierTolerance - Tolerance for outliers (0-1).
 *                                        0 means all elements must match (default).
 *                                        0.2 means 20% outliers are tolerated (80% must match).
 * @return {string}                                - [description]
 */
function getMultiSelector(elements) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!Array.isArray(elements)) {
    elements = (0,_utilities__WEBPACK_IMPORTED_MODULE_3__.convertNodeList)(elements);
  }
  if (elements.some(function (element) {
    return element.nodeType !== 1;
  })) {
    throw new Error("Invalid input - only an Array of HTMLElements or representations of them is supported!");
  }
  var _options$outlierToler = options.outlierTolerance,
    outlierTolerance = _options$outlierToler === void 0 ? 0 : _options$outlierToler;
  var majorityThreshold = 1 - outlierTolerance;
  var globalModified = (0,_adapt__WEBPACK_IMPORTED_MODULE_0__["default"])(elements[0], options);
  var ancestor = (0,_common__WEBPACK_IMPORTED_MODULE_4__.getCommonAncestor)(elements, options);
  var ancestorSelector = getSingleSelector(ancestor, options);

  // TODO: consider usage of multiple selectors + parent-child relation + check for part redundancy
  var commonSelectors = getCommonSelectors(elements, options);
  var descendantSelector = commonSelectors[0];
  var selector = (0,_optimize__WEBPACK_IMPORTED_MODULE_2__["default"])("".concat(ancestorSelector, " ").concat(descendantSelector), elements, options);
  var selectorMatches = (0,_utilities__WEBPACK_IMPORTED_MODULE_3__.convertNodeList)(document.querySelectorAll(selector));

  // Calculate match ratio and validate against threshold
  var matchCount = elements.filter(function (element) {
    return selectorMatches.some(function (entry) {
      return entry === element;
    });
  }).length;
  var matchRatio = matchCount / elements.length;
  if (matchRatio < majorityThreshold) {
    if (globalModified) {
      delete __webpack_require__.g.document;
    }
    console.warn("\n      The selected elements can't be efficiently mapped.\n      Its probably best to use multiple single selectors instead!\n    ", elements);
    return undefined;
  }
  if (globalModified) {
    delete __webpack_require__.g.document;
  }
  return selector;
}

/**
 * Build a selector string from common properties
 *
 * @param  {Object} properties - { classes, attributes, tag }
 * @return {string}            - selector string
 */
function buildSelectorFromProperties(_ref) {
  var classes = _ref.classes,
    attributes = _ref.attributes,
    tag = _ref.tag;
  var selectorPath = [];
  if (tag) {
    selectorPath.push(tag);
  }
  if (classes && classes.length) {
    var classSelector = classes.map(function (name) {
      return ".".concat(name);
    }).join('');
    selectorPath.push(classSelector);
  }
  if (attributes && Object.keys(attributes).length) {
    var attributeSelector = Object.keys(attributes).reduce(function (parts, name) {
      parts.push("[".concat(name, "=\"").concat(attributes[name], "\"]"));
      return parts;
    }, []).join('');
    selectorPath.push(attributeSelector);
  }
  return selectorPath.join('');
}

/**
 * Get selectors to describe a set of elements
 *
 * @param  {Array.<HTMLElements>} elements - [description]
 * @param  {Object}               options  - [description]
 * @return {string}                        - [description]
 */
function getCommonSelectors(elements) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var properties = (0,_common__WEBPACK_IMPORTED_MODULE_4__.getCommonProperties)(elements, options);
  if (properties.classes || properties.attributes || properties.tag) {
    // TODO: check for parent-child relation
  }
  return [buildSelectorFromProperties(properties)];
}

/**
 * Choose action depending on the input (multiple/single)
 *
 * NOTE: extended detection is used for special cases like the <select> element with <options>
 *
 * @param  {HTMLElement|NodeList|Array.<HTMLElement>} input   - [description]
 * @param  {Object}                                   options - [description]
 * @return {string}                                           - [description]
 */
function getQuerySelector(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (input.length && !input.name) {
    return getMultiSelector(input, options);
  }
  return getSingleSelector(input, options);
}

/***/ },

/***/ "./src/utilities.js"
/*!**************************!*\
  !*** ./src/utilities.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertNodeList: () => (/* binding */ convertNodeList),
/* harmony export */   escapeValue: () => (/* binding */ escapeValue)
/* harmony export */ });
/**
 * # Utilities
 *
 * Convenience helpers.
 */

/**
 * Create an array with the DOM nodes of the list
 *
 * @param  {NodeList}             nodes - [description]
 * @return {Array.<HTMLElement>}        - [description]
 */
function convertNodeList(nodes) {
  var length = nodes.length;
  var arr = new Array(length);
  for (var i = 0; i < length; i++) {
    arr[i] = nodes[i];
  }
  return arr;
}

/**
 * Escape special characters and line breaks as a simplified version of 'CSS.escape()'
 *
 * Description of valid characters: https://mathiasbynens.be/notes/css-escapes
 *
 * @param  {String?} value - [description]
 * @return {String}        - [description]
 */
function escapeValue(value) {
  return value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, '\\$&').replace(/\n/g, '\A');
}

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/index.mjs ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   common: () => (/* reexport module object */ _common_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getMultiSelector: () => (/* reexport safe */ _select_js__WEBPACK_IMPORTED_MODULE_0__.getMultiSelector),
/* harmony export */   getSingleSelector: () => (/* reexport safe */ _select_js__WEBPACK_IMPORTED_MODULE_0__.getSingleSelector),
/* harmony export */   optimize: () => (/* reexport safe */ _optimize_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   select: () => (/* reexport safe */ _select_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _select_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./select.js */ "./src/select.js");
/* harmony import */ var _optimize_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./optimize.js */ "./src/optimize.js");
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common.js */ "./src/common.js");
/**
 * # optimal-select
 *
 * ESModule entry point for esbuild
 */





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_select_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});