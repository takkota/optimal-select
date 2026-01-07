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
 * @return {string}                                - [description]
 */
export function getMultiSelector (elements, options = {}) {

  if (!Array.isArray(elements)) {
    elements = convertNodeList(elements)
  }

  if (elements.some((element) => element.nodeType !== 1)) {
    throw new Error(`Invalid input - only an Array of HTMLElements or representations of them is supported!`)
  }

  const globalModified = adapt(elements[0], options)

  const ancestor = getCommonAncestor(elements, options)
  const ancestorSelector = getSingleSelector(ancestor, options)

  // TODO: consider usage of multiple selectors + parent-child relation + check for part redundancy
  const commonSelectors = getCommonSelectors(elements, options)
  const descendantSelector = commonSelectors[0]

  const selector = optimize(`${ancestorSelector} ${descendantSelector}`, elements, options)
  const selectorMatches = convertNodeList(document.querySelectorAll(selector))

  if (!elements.every((element) => selectorMatches.some((entry) => entry === element) )) {
    // Cluster elements by selector pattern and try to generate combined selector
    const clusters = clusterElementsBySelector(elements, options)

    // If only one cluster, cannot improve - fall back to warning
    if (clusters.size <= 1) {
      if (globalModified) {
        delete global.document
      }
      console.warn(`
        The selected elements can\'t be efficiently mapped.
        Its probably best to use multiple single selectors instead!
      `, elements)
      return undefined
    }

    // Generate selector for each cluster
    const clusterSelectors = []
    for (const [pattern, clusterElements] of clusters) {
      const clusterSelector = `${ancestorSelector} ${pattern}`
      const optimizedSelector = optimize(clusterSelector, clusterElements, options)

      // Validate the selector matches all elements in the cluster
      const matches = convertNodeList(document.querySelectorAll(optimizedSelector))
      const allMatch = clusterElements.every((el) => matches.some((m) => m === el))

      if (allMatch) {
        clusterSelectors.push(optimizedSelector)
      } else {
        // Validation failed - fall back to warning
        if (globalModified) {
          delete global.document
        }
        console.warn(`
          The selected elements can\'t be efficiently mapped.
          Its probably best to use multiple single selectors instead!
        `, elements)
        return undefined
      }
    }

    if (globalModified) {
      delete global.document
    }

    // Return comma-separated selectors
    return clusterSelectors.join(', ')
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
 * Get selector pattern for a single element
 *
 * @param  {HTMLElement} element - [description]
 * @param  {Object}      options - [description]
 * @return {string}              - selector pattern
 */
function getElementSelectorPattern (element, options = {}) {
  const properties = getCommonProperties([element], options)
  return buildSelectorFromProperties(properties)
}

/**
 * Cluster elements by their selector pattern
 *
 * @param  {Array.<HTMLElement>} elements - [description]
 * @param  {Object}              options  - [description]
 * @return {Map}                          - Map of pattern -> elements
 */
function clusterElementsBySelector (elements, options = {}) {
  const clusters = new Map()

  elements.forEach((element) => {
    const pattern = getElementSelectorPattern(element, options)

    if (!clusters.has(pattern)) {
      clusters.set(pattern, [])
    }
    clusters.get(pattern).push(element)
  })

  return clusters
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
