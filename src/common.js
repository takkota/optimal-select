/**
 * # Common
 *
 * Process collections for similarities.
 */

import { escapeValue } from './utilities'

/**
 * Find the last common ancestor of elements
 *
 * @param  {Array.<HTMLElements>} elements - [description]
 * @return {HTMLElement}                   - [description]
 */
export function getCommonAncestor (elements, options = {}) {

  const {
    root = document
  } = options

  const ancestors = []

  elements.forEach((element, index) => {
    const parents = []
    while (element !== root) {
      element = element.parentNode
      parents.unshift(element)
    }
    ancestors[index] = parents
  })

  ancestors.sort((curr, next) => curr.length - next.length)

  const shallowAncestor = ancestors.shift()

  var ancestor = null

  for (var i = 0, l = shallowAncestor.length; i < l; i++) {
    const parent = shallowAncestor[i]
    const missing = ancestors.some((otherParents) => {
      return !otherParents.some((otherParent) => otherParent === parent)
    })

    if (missing) {
      // TODO: find similar sub-parents, not the top root, e.g. sharing a class selector
      break
    }

    ancestor = parent
  }

  return ancestor
}

/**
 * Get a set of common properties of elements
 *
 * @param  {Array.<HTMLElement>} elements - [description]
 * @param  {Object}              options  - [description]
 * @return {Object}                       - [description]
 */
export function getCommonProperties (elements, options = {}) {

  const {
    ignore = {}
  } = options

  // Normalize ignore predicates (same logic as match.js)
  const normalizedIgnore = {}
  Object.keys(ignore).forEach((type) => {
    var predicate = ignore[type]
    if (typeof predicate === 'function') {
      normalizedIgnore[type] = predicate
      return
    }
    if (typeof predicate === 'number') {
      predicate = predicate.toString()
    }
    if (typeof predicate === 'string') {
      predicate = new RegExp(escapeValue(predicate).replace(/\\/g, '\\\\'))
    }
    if (typeof predicate === 'boolean') {
      predicate = predicate ? /(?:)/ : /.^/
    }
    // check class-/attributename for regex
    normalizedIgnore[type] = (name, value) => predicate.test(value)
  })

  const checkIgnore = (type, name, value) => {
    const predicate = normalizedIgnore[type]
    if (!predicate) return false
    return predicate(name, value)
  }

  const commonProperties = {
    classes: [],
    attributes: {},
    tag: null
  }

  elements.forEach((element) => {

    var {
      classes: commonClasses,
      attributes: commonAttributes,
      tag: commonTag
    } = commonProperties

    // ~ classes
    if (commonClasses !== undefined) {
      var classes = element.getAttribute('class')
      if (classes) {
        classes = classes.trim().split(' ').filter((className) => {
          // Filter out ignored classes
          return !checkIgnore('class', className, className)
        })
        if (!classes.length) {
          delete commonProperties.classes
        } else if (!commonClasses.length) {
          commonProperties.classes = classes
        } else {
          commonClasses = commonClasses.filter((entry) => classes.some((name) => name === entry))
          if (commonClasses.length) {
            commonProperties.classes = commonClasses
          } else {
            delete commonProperties.classes
          }
        }
      } else {
        // TODO: restructure removal as 2x set / 2x delete, instead of modify always replacing with new collection
        delete commonProperties.classes
      }
    }

    // ~ attributes
    if (commonAttributes !== undefined) {
      const elementAttributes = element.attributes
      const attributes = Object.keys(elementAttributes).reduce((attributes, key) => {
        const attribute = elementAttributes[key]
        const attributeName = attribute.name
        const attributeValue = attribute.value
        // NOTE: workaround detection for non-standard phantomjs NamedNodeMap behaviour
        // (issue: https://github.com/ariya/phantomjs/issues/14634)
        if (attribute && attributeName !== 'class') {
          // Filter out ignored attributes
          if (!checkIgnore(attributeName, attributeName, attributeValue) &&
              !checkIgnore('attribute', attributeName, attributeValue)) {
            attributes[attributeName] = attributeValue
          }
        }
        return attributes
      }, {})

      const attributesNames = Object.keys(attributes)
      const commonAttributesNames = Object.keys(commonAttributes)

      if (attributesNames.length) {
        if (!commonAttributesNames.length) {
          commonProperties.attributes = attributes
        } else {
          commonAttributes = commonAttributesNames.reduce((nextCommonAttributes, name) => {
            const value = commonAttributes[name]
            if (value === attributes[name]) {
              nextCommonAttributes[name] = value
            }
            return nextCommonAttributes
          }, {})
          if (Object.keys(commonAttributes).length) {
            commonProperties.attributes = commonAttributes
          } else {
            delete commonProperties.attributes
          }
        }
      } else {
        delete commonProperties.attributes
      }
    }

    // ~ tag
    if (commonTag !== undefined) {
      const tag = element.tagName.toLowerCase()
      // Filter out ignored tags
      if (checkIgnore('tag', null, tag)) {
        delete commonProperties.tag
      } else if (!commonTag) {
        commonProperties.tag = tag
      } else if (tag !== commonTag) {
        delete commonProperties.tag
      }
    }
  })

  return commonProperties
}
