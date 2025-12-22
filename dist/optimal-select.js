var OptimalSelect = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // build-wrapper.mjs
  var build_wrapper_exports = {};
  __export(build_wrapper_exports, {
    common: () => common_exports,
    default: () => build_wrapper_default,
    getMultiSelector: () => getMultiSelector,
    getSingleSelector: () => getSingleSelector,
    optimize: () => optimize,
    select: () => getQuerySelector
  });

  // src/adapt.js
  function adapt(element, options) {
    if (global.document) {
      return false;
    } else {
      global.document = options.context || (() => {
        var root = element;
        while (root.parent) {
          root = root.parent;
        }
        return root;
      })();
    }
    const ElementPrototype = Object.getPrototypeOf(global.document);
    if (!Object.getOwnPropertyDescriptor(ElementPrototype, "childTags")) {
      Object.defineProperty(ElementPrototype, "childTags", {
        enumerable: true,
        get() {
          return this.children.filter((node) => {
            return node.type === "tag" || node.type === "script" || node.type === "style";
          });
        }
      });
    }
    if (!Object.getOwnPropertyDescriptor(ElementPrototype, "attributes")) {
      Object.defineProperty(ElementPrototype, "attributes", {
        enumerable: true,
        get() {
          const { attribs } = this;
          const attributesNames = Object.keys(attribs);
          const NamedNodeMap = attributesNames.reduce((attributes, attributeName, index) => {
            attributes[index] = {
              name: attributeName,
              value: attribs[attributeName]
            };
            return attributes;
          }, {});
          Object.defineProperty(NamedNodeMap, "length", {
            enumerable: false,
            configurable: false,
            value: attributesNames.length
          });
          return NamedNodeMap;
        }
      });
    }
    if (!ElementPrototype.getAttribute) {
      ElementPrototype.getAttribute = function(name) {
        return this.attribs[name] || null;
      };
    }
    if (!ElementPrototype.getElementsByTagName) {
      ElementPrototype.getElementsByTagName = function(tagName) {
        const HTMLCollection = [];
        traverseDescendants(this.childTags, (descendant) => {
          if (descendant.name === tagName || tagName === "*") {
            HTMLCollection.push(descendant);
          }
        });
        return HTMLCollection;
      };
    }
    if (!ElementPrototype.getElementsByClassName) {
      ElementPrototype.getElementsByClassName = function(className) {
        const names = className.trim().replace(/\s+/g, " ").split(" ");
        const HTMLCollection = [];
        traverseDescendants([this], (descendant) => {
          const descendantClassName = descendant.attribs.class;
          if (descendantClassName && names.every((name) => descendantClassName.indexOf(name) > -1)) {
            HTMLCollection.push(descendant);
          }
        });
        return HTMLCollection;
      };
    }
    if (!ElementPrototype.querySelectorAll) {
      ElementPrototype.querySelectorAll = function(selectors) {
        selectors = selectors.replace(/(>)(\S)/g, "$1 $2").trim();
        const instructions = getInstructions(selectors);
        const discover = instructions.shift();
        const total = instructions.length;
        return discover(this).filter((node) => {
          var step = 0;
          while (step < total) {
            node = instructions[step](node, this);
            if (!node) {
              return false;
            }
            step += 1;
          }
          return true;
        });
      };
    }
    if (!ElementPrototype.contains) {
      ElementPrototype.contains = function(element2) {
        var inclusive = false;
        traverseDescendants([this], (descendant, done) => {
          if (descendant === element2) {
            inclusive = true;
            done();
          }
        });
        return inclusive;
      };
    }
    return true;
  }
  function getInstructions(selectors) {
    return selectors.split(" ").reverse().map((selector, step) => {
      const discover = step === 0;
      const [type, pseudo] = selector.split(":");
      var validate = null;
      var instruction = null;
      switch (true) {
        // child: '>'
        case />/.test(type):
          instruction = function checkParent(node) {
            return (validate2) => validate2(node.parent) && node.parent;
          };
          break;
        // class: '.'
        case /^\./.test(type):
          const names = type.substr(1).split(".");
          validate = (node) => {
            const nodeClassName = node.attribs.class;
            return nodeClassName && names.every((name) => nodeClassName.indexOf(name) > -1);
          };
          instruction = function checkClass(node, root) {
            if (discover) {
              return node.getElementsByClassName(names.join(" "));
            }
            return typeof node === "function" ? node(validate) : getAncestor(node, root, validate);
          };
          break;
        // attribute: '[key="value"]'
        case /^\[/.test(type):
          const [attributeKey, attributeValue] = type.replace(/\[|\]|"/g, "").split("=");
          validate = (node) => {
            const hasAttribute = Object.keys(node.attribs).indexOf(attributeKey) > -1;
            if (hasAttribute) {
              if (!attributeValue || node.attribs[attributeKey] === attributeValue) {
                return true;
              }
            }
            return false;
          };
          instruction = function checkAttribute(node, root) {
            if (discover) {
              const NodeList = [];
              traverseDescendants([node], (descendant) => {
                if (validate(descendant)) {
                  NodeList.push(descendant);
                }
              });
              return NodeList;
            }
            return typeof node === "function" ? node(validate) : getAncestor(node, root, validate);
          };
          break;
        // id: '#'
        case /^#/.test(type):
          const id = type.substr(1);
          validate = (node) => {
            return node.attribs.id === id;
          };
          instruction = function checkId(node, root) {
            if (discover) {
              const NodeList = [];
              traverseDescendants([node], (descendant, done) => {
                if (validate(descendant)) {
                  NodeList.push(descendant);
                  done();
                }
              });
              return NodeList;
            }
            return typeof node === "function" ? node(validate) : getAncestor(node, root, validate);
          };
          break;
        // universal: '*'
        case /\*/.test(type):
          validate = (node) => true;
          instruction = function checkUniversal(node, root) {
            if (discover) {
              const NodeList = [];
              traverseDescendants([node], (descendant) => NodeList.push(descendant));
              return NodeList;
            }
            return typeof node === "function" ? node(validate) : getAncestor(node, root, validate);
          };
          break;
        // tag: '...'
        default:
          validate = (node) => {
            return node.name === type;
          };
          instruction = function checkTag2(node, root) {
            if (discover) {
              const NodeList = [];
              traverseDescendants([node], (descendant) => {
                if (validate(descendant)) {
                  NodeList.push(descendant);
                }
              });
              return NodeList;
            }
            return typeof node === "function" ? node(validate) : getAncestor(node, root, validate);
          };
      }
      if (!pseudo) {
        return instruction;
      }
      const rule = pseudo.match(/-(child|type)\((\d+)\)$/);
      const kind = rule[1];
      const index = parseInt(rule[2], 10) - 1;
      const validatePseudo = (node) => {
        if (node) {
          var compareSet = node.parent.childTags;
          if (kind === "type") {
            compareSet = compareSet.filter(validate);
          }
          const nodeIndex = compareSet.findIndex((child) => child === node);
          if (nodeIndex === index) {
            return true;
          }
        }
        return false;
      };
      return function enhanceInstruction(node) {
        const match2 = instruction(node);
        if (discover) {
          return match2.reduce((NodeList, matchedNode) => {
            if (validatePseudo(matchedNode)) {
              NodeList.push(matchedNode);
            }
            return NodeList;
          }, []);
        }
        return validatePseudo(match2) && match2;
      };
    });
  }
  function traverseDescendants(nodes, handler) {
    nodes.forEach((node) => {
      var progress = true;
      handler(node, () => progress = false);
      if (node.childTags && progress) {
        traverseDescendants(node.childTags, handler);
      }
    });
  }
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

  // src/utilities.js
  function convertNodeList(nodes) {
    const { length } = nodes;
    const arr = new Array(length);
    for (var i = 0; i < length; i++) {
      arr[i] = nodes[i];
    }
    return arr;
  }
  function escapeValue(value) {
    return value && value.replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, "\\$&").replace(/\n/g, "A");
  }

  // src/match.js
  var defaultIgnore = {
    attribute(attributeName) {
      return [
        "style",
        "data-reactid",
        "data-react-checksum"
      ].indexOf(attributeName) > -1;
    }
  };
  function match(node, options) {
    const {
      root = document,
      skip = null,
      priority = ["id", "class", "href", "src"],
      ignore = {}
    } = options;
    const path = [];
    var element = node;
    var length = path.length;
    var ignoreClass = false;
    const skipCompare = skip && (Array.isArray(skip) ? skip : [skip]).map((entry) => {
      if (typeof entry !== "function") {
        return (element2) => element2 === entry;
      }
      return entry;
    });
    const skipChecks = (element2) => {
      return skip && skipCompare.some((compare) => compare(element2));
    };
    Object.keys(ignore).forEach((type) => {
      if (type === "class") {
        ignoreClass = true;
      }
      var predicate = ignore[type];
      if (typeof predicate === "function") return;
      if (typeof predicate === "number") {
        predicate = predicate.toString();
      }
      if (typeof predicate === "string") {
        predicate = new RegExp(escapeValue(predicate).replace(/\\/g, "\\\\"));
      }
      if (typeof predicate === "boolean") {
        predicate = predicate ? /(?:)/ : /.^/;
      }
      ignore[type] = (name, value) => predicate.test(value);
    });
    if (ignoreClass) {
      const ignoreAttribute = ignore.attribute;
      ignore.attribute = (name, value, defaultPredicate) => {
        return ignore.class(value) || ignoreAttribute && ignoreAttribute(name, value, defaultPredicate);
      };
    }
    while (element !== root) {
      if (skipChecks(element) !== true) {
        if (checkAttributes(priority, element, ignore, path, root)) break;
        if (checkTag(element, ignore, path, root)) break;
        checkAttributes(priority, element, ignore, path);
        if (path.length === length) {
          checkTag(element, ignore, path);
        }
        if (path.length === length) {
          checkChilds(priority, element, ignore, path);
        }
      }
      element = element.parentNode;
      length = path.length;
    }
    if (element === root) {
      const pattern = findPattern(priority, element, ignore);
      path.unshift(pattern);
    }
    return path.join(" ");
  }
  function checkAttributes(priority, element, ignore, path, parent = element.parentNode) {
    const pattern = findAttributesPattern(priority, element, ignore);
    if (pattern) {
      const matches = parent.querySelectorAll(pattern);
      if (matches.length === 1) {
        path.unshift(pattern);
        return true;
      }
    }
    return false;
  }
  function findAttributesPattern(priority, element, ignore) {
    const attributes = element.attributes;
    const sortedKeys = Object.keys(attributes).sort((curr, next) => {
      const currPos = priority.indexOf(attributes[curr].name);
      const nextPos = priority.indexOf(attributes[next].name);
      if (nextPos === -1) {
        if (currPos === -1) {
          return 0;
        }
        return -1;
      }
      return currPos - nextPos;
    });
    for (var i = 0, l = sortedKeys.length; i < l; i++) {
      const key = sortedKeys[i];
      const attribute = attributes[key];
      const attributeName = attribute.name;
      const attributeValue = escapeValue(attribute.value);
      const currentIgnore = ignore[attributeName] || ignore.attribute;
      const currentDefaultIgnore = defaultIgnore[attributeName] || defaultIgnore.attribute;
      if (checkIgnore(currentIgnore, attributeName, attributeValue, currentDefaultIgnore)) {
        continue;
      }
      var pattern = `[${attributeName}="${attributeValue}"]`;
      if (/\b\d/.test(attributeValue) === false) {
        if (attributeName === "id") {
          pattern = `#${attributeValue}`;
        }
        if (attributeName === "class") {
          const className = attributeValue.trim().replace(/\s+/g, ".");
          pattern = `.${className}`;
        }
      }
      return pattern;
    }
    return null;
  }
  function checkTag(element, ignore, path, parent = element.parentNode) {
    const pattern = findTagPattern(element, ignore);
    if (pattern) {
      const matches = parent.getElementsByTagName(pattern);
      if (matches.length === 1) {
        path.unshift(pattern);
        return true;
      }
    }
    return false;
  }
  function findTagPattern(element, ignore) {
    const tagName = element.tagName.toLowerCase();
    if (checkIgnore(ignore.tag, null, tagName)) {
      return null;
    }
    return tagName;
  }
  function checkChilds(priority, element, ignore, path) {
    const parent = element.parentNode;
    const children = parent.childTags || parent.children;
    for (var i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      if (child === element) {
        const childPattern = findPattern(priority, child, ignore);
        if (!childPattern) {
          return console.warn(`
          Element couldn't be matched through strict ignore pattern!
        `, child, ignore, childPattern);
        }
        const pattern = `> ${childPattern}:nth-child(${i + 1})`;
        path.unshift(pattern);
        return true;
      }
    }
    return false;
  }
  function findPattern(priority, element, ignore) {
    var pattern = findAttributesPattern(priority, element, ignore);
    if (!pattern) {
      pattern = findTagPattern(element, ignore);
    }
    return pattern;
  }
  function checkIgnore(predicate, name, value, defaultPredicate) {
    if (!value) {
      return true;
    }
    const check = predicate || defaultPredicate;
    if (!check) {
      return false;
    }
    return check(name, value, defaultPredicate);
  }

  // src/optimize.js
  function optimize(selector, elements, options = {}) {
    if (!Array.isArray(elements)) {
      elements = !elements.length ? [elements] : convertNodeList(elements);
    }
    if (!elements.length || elements.some((element) => element.nodeType !== 1)) {
      throw new Error(`Invalid input - to compare HTMLElements its necessary to provide a reference of the selected node(s)! (missing "elements")`);
    }
    const globalModified = adapt(elements[0], options);
    var path = selector.replace(/> /g, ">").split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (path.length < 2) {
      return optimizePart("", selector, "", elements);
    }
    const shortened = [path.pop()];
    while (path.length > 1) {
      const current = path.pop();
      const prePart = path.join(" ");
      const postPart = shortened.join(" ");
      const pattern = `${prePart} ${postPart}`;
      const matches = document.querySelectorAll(pattern);
      if (matches.length !== elements.length) {
        shortened.unshift(optimizePart(prePart, current, postPart, elements));
      }
    }
    shortened.unshift(path[0]);
    path = shortened;
    path[0] = optimizePart("", path[0], path.slice(1).join(" "), elements);
    path[path.length - 1] = optimizePart(path.slice(0, -1).join(" "), path[path.length - 1], "", elements);
    if (globalModified) {
      delete global.document;
    }
    return path.join(" ").replace(/>/g, "> ").trim();
  }
  function optimizePart(prePart, current, postPart, elements) {
    if (prePart.length) prePart = `${prePart} `;
    if (postPart.length) postPart = ` ${postPart}`;
    if (/\[*\]/.test(current)) {
      const key = current.replace(/=.*$/, "]");
      var pattern = `${prePart}${key}${postPart}`;
      var matches = document.querySelectorAll(pattern);
      if (compareResults(matches, elements)) {
        current = key;
      } else {
        const references = document.querySelectorAll(`${prePart}${key}`);
        for (var i = 0, l = references.length; i < l; i++) {
          const reference = references[i];
          if (elements.some((element) => reference.contains(element))) {
            const description = reference.tagName.toLowerCase();
            var pattern = `${prePart}${description}${postPart}`;
            var matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = description;
            }
            break;
          }
        }
      }
    }
    if (/>/.test(current)) {
      const descendant = current.replace(/>/, "");
      var pattern = `${prePart}${descendant}${postPart}`;
      var matches = document.querySelectorAll(pattern);
      if (compareResults(matches, elements)) {
        current = descendant;
      }
    }
    if (/:nth-child/.test(current)) {
      const type = current.replace(/nth-child/g, "nth-of-type");
      var pattern = `${prePart}${type}${postPart}`;
      var matches = document.querySelectorAll(pattern);
      if (compareResults(matches, elements)) {
        current = type;
      }
    }
    if (/\.\S+\.\S+/.test(current)) {
      var names = current.trim().split(".").slice(1).map((name) => `.${name}`).sort((curr, next) => curr.length - next.length);
      while (names.length) {
        const partial = current.replace(names.shift(), "").trim();
        var pattern = `${prePart}${partial}${postPart}`.trim();
        if (!pattern.length || pattern.charAt(0) === ">" || pattern.charAt(pattern.length - 1) === ">") {
          break;
        }
        var matches = document.querySelectorAll(pattern);
        if (compareResults(matches, elements)) {
          current = partial;
        }
      }
      names = current && current.match(/\./g);
      if (names && names.length > 2) {
        const references = document.querySelectorAll(`${prePart}${current}`);
        for (var i = 0, l = references.length; i < l; i++) {
          const reference = references[i];
          if (elements.some((element) => reference.contains(element))) {
            const description = reference.tagName.toLowerCase();
            var pattern = `${prePart}${description}${postPart}`;
            var matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = description;
            }
            break;
          }
        }
      }
    }
    return current;
  }
  function compareResults(matches, elements) {
    const { length } = matches;
    return length === elements.length && elements.every((element) => {
      for (var i = 0; i < length; i++) {
        if (matches[i] === element) {
          return true;
        }
      }
      return false;
    });
  }

  // src/common.js
  var common_exports = {};
  __export(common_exports, {
    getCommonAncestor: () => getCommonAncestor,
    getCommonProperties: () => getCommonProperties
  });
  function getCommonAncestor(elements, options = {}) {
    const {
      root = document
    } = options;
    const ancestors = [];
    elements.forEach((element, index) => {
      const parents = [];
      while (element !== root) {
        element = element.parentNode;
        parents.unshift(element);
      }
      ancestors[index] = parents;
    });
    ancestors.sort((curr, next) => curr.length - next.length);
    const shallowAncestor = ancestors.shift();
    var ancestor = null;
    for (var i = 0, l = shallowAncestor.length; i < l; i++) {
      const parent = shallowAncestor[i];
      const missing = ancestors.some((otherParents) => {
        return !otherParents.some((otherParent) => otherParent === parent);
      });
      if (missing) {
        break;
      }
      ancestor = parent;
    }
    return ancestor;
  }
  function getCommonProperties(elements, options = {}) {
    const {
      ignore = {}
    } = options;
    const normalizedIgnore = {};
    Object.keys(ignore).forEach((type) => {
      var predicate = ignore[type];
      if (typeof predicate === "function") {
        normalizedIgnore[type] = predicate;
        return;
      }
      if (typeof predicate === "number") {
        predicate = predicate.toString();
      }
      if (typeof predicate === "string") {
        predicate = new RegExp(escapeValue(predicate).replace(/\\/g, "\\\\"));
      }
      if (typeof predicate === "boolean") {
        predicate = predicate ? /(?:)/ : /.^/;
      }
      normalizedIgnore[type] = (name, value) => predicate.test(value);
    });
    const checkIgnore2 = (type, name, value) => {
      const predicate = normalizedIgnore[type];
      if (!predicate) return false;
      return predicate(name, value);
    };
    const commonProperties = {
      classes: [],
      attributes: {},
      tag: null
    };
    elements.forEach((element) => {
      var {
        classes: commonClasses,
        attributes: commonAttributes,
        tag: commonTag
      } = commonProperties;
      if (commonClasses !== void 0) {
        var classes = element.getAttribute("class");
        if (classes) {
          classes = classes.trim().split(" ").filter((className) => {
            return !checkIgnore2("class", className, className);
          });
          if (!classes.length) {
            delete commonProperties.classes;
          } else if (!commonClasses.length) {
            commonProperties.classes = classes;
          } else {
            commonClasses = commonClasses.filter((entry) => classes.some((name) => name === entry));
            if (commonClasses.length) {
              commonProperties.classes = commonClasses;
            } else {
              delete commonProperties.classes;
            }
          }
        } else {
          delete commonProperties.classes;
        }
      }
      if (commonAttributes !== void 0) {
        const elementAttributes = element.attributes;
        const attributes = Object.keys(elementAttributes).reduce((attributes2, key) => {
          const attribute = elementAttributes[key];
          const attributeName = attribute.name;
          const attributeValue = attribute.value;
          if (attribute && attributeName !== "class") {
            if (!checkIgnore2(attributeName, attributeName, attributeValue) && !checkIgnore2("attribute", attributeName, attributeValue)) {
              attributes2[attributeName] = attributeValue;
            }
          }
          return attributes2;
        }, {});
        const attributesNames = Object.keys(attributes);
        const commonAttributesNames = Object.keys(commonAttributes);
        if (attributesNames.length) {
          if (!commonAttributesNames.length) {
            commonProperties.attributes = attributes;
          } else {
            commonAttributes = commonAttributesNames.reduce((nextCommonAttributes, name) => {
              const value = commonAttributes[name];
              if (value === attributes[name]) {
                nextCommonAttributes[name] = value;
              }
              return nextCommonAttributes;
            }, {});
            if (Object.keys(commonAttributes).length) {
              commonProperties.attributes = commonAttributes;
            } else {
              delete commonProperties.attributes;
            }
          }
        } else {
          delete commonProperties.attributes;
        }
      }
      if (commonTag !== void 0) {
        const tag = element.tagName.toLowerCase();
        if (checkIgnore2("tag", null, tag)) {
          delete commonProperties.tag;
        } else if (!commonTag) {
          commonProperties.tag = tag;
        } else if (tag !== commonTag) {
          delete commonProperties.tag;
        }
      }
    });
    return commonProperties;
  }

  // src/select.js
  function getSingleSelector(element, options = {}) {
    if (element.nodeType === 3) {
      element = element.parentNode;
    }
    if (element.nodeType !== 1) {
      throw new Error(`Invalid input - only HTMLElements or representations of them are supported! (not "${typeof element}")`);
    }
    const globalModified = adapt(element, options);
    const selector = match(element, options);
    const optimized = optimize(selector, element, options);
    if (globalModified) {
      delete global.document;
    }
    return optimized;
  }
  function getMultiSelector(elements, options = {}) {
    if (!Array.isArray(elements)) {
      elements = convertNodeList(elements);
    }
    if (elements.some((element) => element.nodeType !== 1)) {
      throw new Error(`Invalid input - only an Array of HTMLElements or representations of them is supported!`);
    }
    const globalModified = adapt(elements[0], options);
    const ancestor = getCommonAncestor(elements, options);
    const ancestorSelector = getSingleSelector(ancestor, options);
    const commonSelectors = getCommonSelectors(elements, options);
    const descendantSelector = commonSelectors[0];
    const selector = optimize(`${ancestorSelector} ${descendantSelector}`, elements, options);
    const selectorMatches = convertNodeList(document.querySelectorAll(selector));
    if (!elements.every((element) => selectorMatches.some((entry) => entry === element))) {
      return console.warn(`
      The selected elements can't be efficiently mapped.
      Its probably best to use multiple single selectors instead!
    `, elements);
    }
    if (globalModified) {
      delete global.document;
    }
    return selector;
  }
  function getCommonSelectors(elements, options = {}) {
    const { classes, attributes, tag } = getCommonProperties(elements, options);
    const selectorPath = [];
    if (tag) {
      selectorPath.push(tag);
    }
    if (classes) {
      const classSelector = classes.map((name) => `.${name}`).join("");
      selectorPath.push(classSelector);
    }
    if (attributes) {
      const attributeSelector = Object.keys(attributes).reduce((parts, name) => {
        parts.push(`[${name}="${attributes[name]}"]`);
        return parts;
      }, []).join("");
      selectorPath.push(attributeSelector);
    }
    if (selectorPath.length) {
    }
    return [
      selectorPath.join("")
    ];
  }
  function getQuerySelector(input, options = {}) {
    if (input.length && !input.name) {
      return getMultiSelector(input, options);
    }
    return getSingleSelector(input, options);
  }

  // build-wrapper.mjs
  var build_wrapper_default = getQuerySelector;
  return __toCommonJS(build_wrapper_exports);
})();
