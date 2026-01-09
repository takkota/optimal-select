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
 * @param  {number}              options.outlierTolerance - Tolerance for outliers (0-1).
 *                               0 means all elements must have the property (default).
 *                               0.2 means 20% outliers are ignored (80% threshold).
 * @return {Object}                       - [description]
 */
export function getCommonProperties (elements, options = {}) {

  const {
    ignore = {},
    outlierTolerance = 0
  } = options

  // Calculate majority threshold from outlier tolerance
  const majorityThreshold = 1 - outlierTolerance
  const totalElements = elements.length

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

  // Frequency counters
  const classCounter = {}      // className -> count
  const attributeCounter = {}  // "name=value" -> { name, value, count }
  const tagCounter = {}        // tagName -> count

  // Count frequencies for all elements
  elements.forEach((element) => {
    // ~ classes
    const classAttr = element.getAttribute('class')
    if (classAttr) {
      const classes = classAttr.trim().split(' ').filter((className) => {
        return className && !checkIgnore('class', className, className)
      })
      classes.forEach((className) => {
        classCounter[className] = (classCounter[className] || 0) + 1
      })
    }

    // ~ attributes
    const elementAttributes = element.attributes
    Object.keys(elementAttributes).forEach((key) => {
      const attribute = elementAttributes[key]
      const attributeName = attribute.name
      const attributeValue = attribute.value
      // NOTE: workaround detection for non-standard phantomjs NamedNodeMap behaviour
      // (issue: https://github.com/ariya/phantomjs/issues/14634)
      if (attribute && attributeName !== 'class') {
        // Filter out ignored attributes
        if (!checkIgnore(attributeName, attributeName, attributeValue) &&
            !checkIgnore('attribute', attributeName, attributeValue)) {
          const key = `${attributeName}=${attributeValue}`
          if (!attributeCounter[key]) {
            attributeCounter[key] = { name: attributeName, value: attributeValue, count: 0 }
          }
          attributeCounter[key].count++
        }
      }
    })

    // ~ tag
    const tag = element.tagName.toLowerCase()
    if (!checkIgnore('tag', null, tag)) {
      tagCounter[tag] = (tagCounter[tag] || 0) + 1
    }
  })

  // Build common properties based on majority threshold
  const commonProperties = {
    classes: [],
    attributes: {},
    tag: null
  }

  // Filter classes by threshold
  const majorityClasses = Object.keys(classCounter).filter((className) => {
    return classCounter[className] / totalElements >= majorityThreshold
  })
  if (majorityClasses.length) {
    commonProperties.classes = majorityClasses
  } else {
    delete commonProperties.classes
  }

  // Filter attributes by threshold
  const majorityAttributes = {}
  Object.keys(attributeCounter).forEach((key) => {
    const { name, value, count } = attributeCounter[key]
    if (count / totalElements >= majorityThreshold) {
      majorityAttributes[name] = value
    }
  })
  if (Object.keys(majorityAttributes).length) {
    commonProperties.attributes = majorityAttributes
  } else {
    delete commonProperties.attributes
  }

  // Find majority tag (most frequent tag that meets threshold)
  let majorityTag = null
  let maxTagCount = 0
  Object.keys(tagCounter).forEach((tag) => {
    const count = tagCounter[tag]
    if (count / totalElements >= majorityThreshold && count > maxTagCount) {
      majorityTag = tag
      maxTagCount = count
    }
  })
  if (majorityTag) {
    commonProperties.tag = majorityTag
  } else {
    delete commonProperties.tag
  }

  return commonProperties
}
