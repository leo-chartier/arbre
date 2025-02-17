var canvas = document.getElementById("treeCanvas");
var ctx = canvas.getContext("2d");

var CANVAS_WIDTH = document.body.clientWidth;
var CANVAS_HEIGHT = document.body.clientHeight;
var MAX_ZOOM = 5;
var MIN_ZOOM = 0.2;
var SCROLL_SENSITIVITY = 0.0005;

const Sex = {
  MALE: 1,
  FEMALE: 2,
  OTHER: 3,
};
const SEX_COLORS = {
  [Sex.MALE]: "blue",
  [Sex.FEMALE]: "hotpink",
  [Sex.OTHER]: "gray",
};

var json = [
  {
    id: 0,
    first: "Léo",
    last: "Chartier",
    sex: Sex.Male,
    dob: "2001/10/27",
    pob: "Dijon",
    parents: [],
    spouses: [1],
  },
  {
    id: 1,
    first: "Prénom",
    last: "Nom",
    sex: Sex.Female,
    spouses: [0],
  },
  { id: 2, first: "Alice", sex: Sex.Female, parents: [0, 1] },
  { id: 3, first: "Bob", sex: Sex.Male, parents: [0, 1] },
  { id: 4, first: "Charlie", sex: Sex.Female, parents: [0, 1] },
];
var tree;
var connections;
var NODE_WIDTH = 200;
var NODE_HEIGHT = 100;
var NODE_HORIZONTAL_SPACING = 100;
var NODE_VERTICAL_SPACING = 100;
