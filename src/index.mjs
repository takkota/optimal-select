/**
 * # optimal-select
 *
 * ESModule entry point for esbuild
 */

import select, { getSingleSelector, getMultiSelector } from './select.js'
import optimize from './optimize.js'
import * as common from './common.js'

export { select, getSingleSelector, getMultiSelector, optimize, common }
export default select
