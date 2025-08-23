import { Person } from "./person.js";

/**
 * Generates a graph to be displayed
 * @param {Person} root The starting person
 * @returns {Graph} - The graph to display
 */
export function generate(root) {
  // TODO
  return {
    nodes: [
      { person: root, coords: { x: 0, y: 0 }},
    ],
    edges: [],
  };
}