/**
 * Enum for genders
 * @readonly
 * @enum {number}
 */
const Gender = {
  UNKOWN: 0,
  MALE: 1,
  FEMALE: 2,
  OTHER: 3,
};

/**
 * A person's identification data.
 * @typedef {Object} Identity
 * @property {string} id - Their unique identifier.
 * @property {?string} firstnames - Their first names.
 * @property {?string} lastname - Their last name.
 * @property {?Gender} gender - Their gender.
 * @property {?Date} dob - Their date of birth.
 * @property {?string} pob - Their place of birth.
 * @property {?Date} dod - Their date of death.
 * @property {?string} pod - Their place of death.
 */

/**
 * A couple's union data.
 * @typedef {Object} Union
 * @property {string} parent1 - The first person.
 * @property {?string} parent2 - The second person.
 * @property {?string} dom - Their date of marriage.
 * @property {?string} pom - Their place of marriage.
 * @property {?string} dod - Their date of divorce.
 * @property {?string[]} children - The IDs of their children.
 */

/**
 * Enum for relation between two people
 * @readonly
 * @enum {number}
 */
const Relation = {
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

/**
 * A relationship model with coordinates.
 * @typedef {Object} Node
 * @property {string} id - Their unique identifier.
 * @property {Node} predecessor - The node of the person one step closer to the root.
 * @property {Relation} relation - Who this person is to their predecessor.
 * @property {number} depth - The minimal number of steps to reach the root.
 * @property {Node[]} parents - The nodes of the person's parents.
 * @property {Node[]} spouses - The nodes of the person's spouses.
 * @property {Node[]} children - The nodes of the person's children.
 * @property {?Node} left - The next profile to the left on the graph.
 * @property {?Node} right - The next profile to the right on the graph.
 * @property {?Coordinates} position - The position of their profile, in relative units (not pixels).
 */

/**
 * @typedef {Object<string, Node>} Graph
 */
