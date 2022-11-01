var canvas = document.getElementById("treeCanvas");
var ctx = canvas.getContext('2d');

var CANVAS_WIDTH = document.body.clientWidth;
var CANVAS_HEIGHT = document.body.clientHeight;
var MAX_ZOOM = 5;
var MIN_ZOOM = 0.2;
var SCROLL_SENSITIVITY = 0.0005;