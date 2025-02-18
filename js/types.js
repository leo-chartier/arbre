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
 * A person's data.
 * @typedef {Object} Person
 * @property {number} id - Their unique identifier.
 * @property {string?} first - Their first names.
 * @property {string?} last - Their last name.
 * @property {Gender} sex - Their gender.
 * @property {Date?} dob - Their date of birth.
 * @property {string?} pob - Their place of birth.
 * @property {Date?} dod - Their date of death.
 * @property {string?} pod - Their place of death.
 * @property {Array<number>} parents - The IDs of their parents.
 */
