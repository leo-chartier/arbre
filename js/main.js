import { CanvasManager } from "./canvasmanager.js";
import { draw } from "./draw.js";
import { Person } from "./person.js";
import { generate } from "./graph.js";

// Fetch informations
console.debug("Fetching identities")
const identities = await (await fetch('./public/identities.json')).json();
console.debug("Fetching unions")
const unions = await (await fetch('./public/unions.json')).json();

// Get all people from the root
const rootId = Object.keys(identities)[0];
console.debug("Building relations")
let root = Person.extractPeople(identities, unions, rootId);

// Draw the tree
const canvas = document.getElementById("treeCanvas");
const manager = new CanvasManager(canvas, (ctx) => draw(ctx, generate(root)));

// Link the elements
document.getElementById("reset").onclick = manager.reset.bind(manager);