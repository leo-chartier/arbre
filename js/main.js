import { Person } from "./person.js";

// Fetch informations
console.debug("Fetching identities")
const identities = await (await fetch('./public/identities.json')).json();
console.debug("Fetching unions")
const unions = await (await fetch('./public/unions.json')).json();

// Get all people from the root
const rootId = Object.keys(identities)[0];
console.debug("Building relations")
const root = Person.extractPeople(identities, unions, rootId);

console.log(root);