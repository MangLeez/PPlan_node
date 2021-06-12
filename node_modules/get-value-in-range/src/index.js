/**
 * Create a function with specified range for finding values within.
 *
 * @param {Number} values
 * All of the values necessary to calculate the range
 *
 * @example
 * const getValueInRange = require('get-value-in-range')([10, 5]);
 * // → instantiatedGetValueInRange
 *
 * @return {instantiatedGetValueInRange}
 * Instatiated function with range set.
 */
function getValueInRange(values) {
  const range = Math.max(...values) - Math.min(...values);
  return value => (value / range) - 1;
}

/**
 * @callback instantiatedGetValueInRange
 * Find the position of the value within a range where 0 is the minimum value
 * and 1 is the maximum value.
 *
 * @param {Number} value
 * The value to place within the range.
 *
 * @example
 * getValueInRange(7.5);
 * // → 0.5
 *
 * @return {Number}
 * The position of the value within the range.
 */

module.exports = getValueInRange;
