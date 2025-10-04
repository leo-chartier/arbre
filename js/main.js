import { CanvasManager } from "./canvasmanager.js";
import { preloadPictures } from "./draw.js";
import { Person } from "./person.js";

// Fetch informations
console.debug("Fetching identities")
const identities = await (await fetch('./public/identities.json')).json();
console.debug("Fetching unions")
const unions = await (await fetch('./public/unions.json')).json();

await preloadPictures(identities.map(data => data.picture).filter(url => url));

// Get all people from the root
const rootId = Object.keys(identities)[0];
console.debug("Building relations")
let root = await Person.extractPeople(identities, unions, rootId);
console.log(root);

// Draw the tree
const canvas = document.getElementById("treeCanvas");
const manager = new CanvasManager(canvas, root);

// Link the elements
document.getElementById("reset").onclick = manager.resetRoot.bind(manager);
document.getElementById("download").onclick = () => manager.downloadImage(`arbre de ${root.identity.firstnames} ${root.identity.lastname}.png`);