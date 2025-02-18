var canvas = document.getElementById("treeCanvas");
var ctx = canvas.getContext("2d");

var CANVAS_WIDTH = document.body.clientWidth;
var CANVAS_HEIGHT = document.body.clientHeight;
var MAX_ZOOM = 5;
var MIN_ZOOM = 0.2;
var SCROLL_SENSITIVITY = 0.0005;

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
const GENDER_COLORS = {
  [Gender.OTHER]: "gray",
  [Gender.MALE]: "blue",
  [Gender.FEMALE]: "hotpink",
  [Gender.OTHER]: "tan",
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

/** @type {Array<Person>} */
var json = [
  {
    id: 0,
    first: "Léo",
    last: "Chartier",
    sex: Gender.MALE,
    dob: "2001/10/27",
    pob: "Dijon",
    parents: [],
    spouses: [1],
  },
  {
    id: 1,
    first: "Prénom",
    last: "Nom",
    sex: Gender.FEMALE,
    spouses: [0],
  },
  { id: 2, first: "Alice", sex: Gender.FEMALE, parents: [0, 1] },
  { id: 3, first: "Bob", sex: Gender.MALE, parents: [0, 1] },
  { id: 4, first: "Charlie", sex: Gender.OTHER, parents: [0, 1] },
];
var tree;
var connections;
var NODE_WIDTH = 200;
var NODE_HEIGHT = 100;
var NODE_HORIZONTAL_SPACING = 100;
var NODE_VERTICAL_SPACING = 100;
