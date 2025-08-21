/**
 * Enum for genders
 * @readonly
 * @enum {number}
 */
export const Gender = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2,
  OTHER: 3,
};

/**
 * Enum for relation between two people
 * @readonly
 * @enum {number}
 */
export const Relation = {
  ROOT: 0,
  PARENT: 1,
  CHILD: 2,
  SPOUSE: 3,
};

/**
 * A coordinate on the canvas.
 * @typedef {Object} Coordinates
 * @property {number} x - The X component
 * @property {number} y - The Y component
 */

export const isNonEmptyString = value => (typeof value === 'string' || value instanceof String) && value > "";
