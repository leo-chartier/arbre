var canvas = document.getElementById("treeCanvas");
var ctx = canvas.getContext('2d');

var CANVAS_WIDTH = document.body.clientWidth;
var CANVAS_HEIGHT = document.body.clientHeight;
var MAX_ZOOM = 5;
var MIN_ZOOM = 0.2;
var SCROLL_SENSITIVITY = 0.0005;

var Shapes = {
    Unkown: 0,
    Rectangle: 1,
    Circle: 2,
    Diamond: 3,
}

var tree;
var NODE_WIDTH = 200;
var NODE_HEIGHT = 100;
var NODE_HORIZONTAL_SPACING = 100;
var NODE_VERTICAL_SPACING = 100;