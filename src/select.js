/**
 * # Select
 *
 * Construct a unique CSS query selector to access the selected DOM element(s).
 * For longevity it applies different matching and optimization strategies.
 */

import adapt from './adapt'
import match from './match'
import optimize from './optimize'
import { convertNodeList } from './utilities'
import { getCommonAncestor, getCommonProperties } from './common'

/**
 * Get a selector for the provided element
 *
 * @param  {HTMLElement} element - [description]
 * @param  {Object}      options - [description]
 * @return {string}              - [description]
 */
export function getSingleSelector (element, options = {}) {

  if (element.nodeType === 3) {
    element = element.parentNode
  }

  if (element.nodeType !== 1) {
    throw new Error(`Invalid input - only HTMLElements or representations of them are supported! (not "${typeof element}")`)
  }

  const globalModified = adapt(element, options)

  const selector = match(element, options)
  const optimized = optimize(selector, element, options)

  // debug
  // console.log(`
  //   selector:  ${selector}
  //   optimized: ${optimized}
  // `)

  if (globalModified) {
    delete global.document
  }

  return optimized
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
export function getMultiSelector (elements, options = {}) {

  if (!Array.isArray(elements)) {
    elements = convertNodeList(elements)
  }

  if (elements.some((element) => element.nodeType !== 1)) {
    throw new Error(`Invalid input - only an Array of HTMLElements or representations of them is supported!`)
  }

  const { outlierTolerance = 0 } = options
  const majorityThreshold = 1 - outlierTolerance

  const globalModified = adapt(elements[0], options)

  const ancestor = getCommonAncestor(elements, options)
  const ancestorSelector = getSingleSelector(ancestor, options)

  // TODO: consider usage of multiple selectors + parent-child relation + check for part redundancy
  const commonSelectors = getCommonSelectors(elements, options)
  const descendantSelector = commonSelectors[0]

  const selector = optimize(`${ancestorSelector} ${descendantSelector}`, elements, options)
  const selectorMatches = convertNodeList(document.querySelectorAll(selector))

  // Calculate match ratio and validate against threshold
  const matchCount = elements.filter((element) =>
    selectorMatches.some((entry) => entry === element)
  ).length
  const matchRatio = matchCount / elements.length

  if (matchRatio < majorityThreshold) {
    if (globalModified) {
      delete global.document
    }
    console.warn(`
      The selected elements can\'t be efficiently mapped.
      Its probably best to use multiple single selectors instead!
    `, elements)
    return undefined
  }

  if (globalModified) {
    delete global.document
  }

  return selector
}

/**
 * Build a selector string from common properties
 *
 * @param  {Object} properties - { classes, attributes, tag }
 * @return {string}            - selector string
 */
function buildSelectorFromProperties ({ classes, attributes, tag }) {
  const selectorPath = []

  if (tag) {
    selectorPath.push(tag)
  }

  if (classes && classes.length) {
    const classSelector = classes.map((name) => `.${name}`).join('')
    selectorPath.push(classSelector)
  }

  if (attributes && Object.keys(attributes).length) {
    const attributeSelector = Object.keys(attributes).reduce((parts, name) => {
      parts.push(`[${name}="${attributes[name]}"]`)
      return parts
    }, []).join('')
    selectorPath.push(attributeSelector)
  }

  return selectorPath.join('')
}

/**
 * Get selectors to describe a set of elements
 *
 * @param  {Array.<HTMLElements>} elements - [description]
 * @param  {Object}               options  - [description]
 * @return {string}                        - [description]
 */
function getCommonSelectors (elements, options = {}) {

  const properties = getCommonProperties(elements, options)

  if (properties.classes || properties.attributes || properties.tag) {
    // TODO: check for parent-child relation
  }

  return [
    buildSelectorFromProperties(properties)
  ]
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
export default function getQuerySelector (input, options = {}) {
  if (input.length && !input.name) {
    return getMultiSelector(input, options)
  }
  return getSingleSelector(input, options)
}
