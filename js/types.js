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
 * @typedef {object} Coordinates
 * @property {number} x - The X component
 * @property {number} y - The Y component
 */

/**
 * @typedef {object} Edge
 * @property {string} a - ID of the person on one end
 * @property {string} b - ID of the person on the other end
 */

/**
 * @typedef {object} Node
 * @property {Person} person - The person this node represents
 * @property {Coordinates} coords - The position of this node
 */

/**
 * @typedef {object} Graph
 * @property {Node[]} nodes - The people making up this graph
 * @property {Edge[]} edges - The different links between people
 */

export const isNonEmptyString = value => (typeof value === 'string' || value instanceof String) && value > "";
