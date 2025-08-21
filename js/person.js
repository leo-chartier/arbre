import { Identity } from "./identity.js";
import { Union } from "./union.js";

export class Person {
  /**
   * A person in the tree
   * @constructor
   * @param {Identity} identity The identity of this person
   */
  constructor(identity) {
    /** @type {Identity} */
    this.identity = identity;
    /** @type {Person | null} */
    this.parent1 = null;
    /** @type {Person | null} */
    this.parent2 = null;
    /** @type {Person[]} */
    this.siblings = [];
    /** @type {Person[]} */
    this.children = [];
    /** @type {Person[]} */
    this.spouses = [];
  }

  /**
   * Registers a new parent for this person
   * @param {Person} parent The parent to register
   */
  addParent(parent) {
    if (this.parent1 == parent || this.parent2 == parent)
      return;

    if (this.parent1 == null)
      this.parent1 = parent;
    else if (this.parent2 == null)
      this.parent2 = parent;
    else
      throw new Error(`All parents assigned for ${this.identity.id}`);

    parent.addChild(this);
  }

  /**
   * Registers a new child for this person
   * @param {Person} child The child to register
   */
  addChild(child) {
    if (this.children.includes(child))
      return;

    this.children.push(child);
    child.addParent(this);
  }

  /**
   * Extract the different people from JSON formats
   * @param {Object[]} identities A list of JSON identities
   * @param {Object[]} unions A list of JSON relations
   * @param {string | null} rootId The ID of the root person
   */
  static extractPeople(identities, unions, rootId) {
    if (!rootId)
      rootId = identities[0].id;

    const people = Object.fromEntries(identities.map(
      data => [data.id, new Person(Identity.fromJSON(data))],
    ));

    for (const data of unions)
      Union.fromJSON(data).link(people);

    return people[rootId];
  }
}
