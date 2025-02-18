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
 * @property {number} id - Their unique identifier.
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
 * @property {number} parent1 - The first person.
 * @property {?number} parent2 - The second person.
 * @property {?string} dom - Their date of marriage.
 * @property {?string} pom - Their place of marriage.
 * @property {?string} dod - Their date of divorce.
 * @property {?number[]} children - The IDs of their children.
 */
