import { HORIZONTAL_SPACING, VERTICAL_SPACING } from "./constants.js";
import { Person } from "./person.js";

function extractNodes(root, findRelatives) {
  let node = {
    person: root,
    left: null,
    right: null,
    coords: undefined,
    relatives: findRelatives(root),
  };
  const nodes = [node];
  let previousLayerLeftmost;
  const edges = [];

  while (node != null) {
    while (node.left)
      node = node.left;
    previousLayerLeftmost = node;
    node = null;
    while (previousLayerLeftmost != null) {
      for (const relative of previousLayerLeftmost.relatives) {
        if (!relative)
          continue;
        node = {
          person: relative,
          left: node,
          right: null,
          coords: undefined,
          relatives: findRelatives(relative),
        };
        if (node.left)
          node.left.right = node;
        nodes.push(node);
        edges.push({ a: previousLayerLeftmost.person.identity.id, b: relative.identity.id });
      }
      previousLayerLeftmost = previousLayerLeftmost.right;
    }
  }

  return [nodes, edges];
}

function calculateCoords(nodes, horizontal_spacing, vertical_spacing, findRelatives) {
  const root = nodes[0];
  const findRelativesNodes = (node) => findRelatives(node.person).map((person) => nodes.find((node) => node.person == person));
  
  // Find the leftmost node of every generation
  let node;
  const layersLeftmost = [root];
  while (true) {
    let nextLayer;
    node = layersLeftmost[0];
    while (!nextLayer && node) {
      const firstRelative = findRelatives(node.person)[0];
      nextLayer = nodes.find((node) => node.person == firstRelative);
      node = node.right;
    }
    if (!nextLayer)
      break;
    layersLeftmost.unshift(nextLayer);
  }

  // Initialize a coord
  layersLeftmost[0].coords = { x: 0, y: 0 };
  if (layersLeftmost[0].right)
    layersLeftmost[0] = layersLeftmost[0].right;
  else
    layersLeftmost.shift();

  // Fill all the coordinates
  for (let node of layersLeftmost) {
    let left = null;
    while (node) {
      const relatives = findRelativesNodes(node);
      if (relatives.length) {
        const xs = relatives.map((relative) => relative.coords.x);
        node.coords = {
          x: (Math.min(...xs) + Math.max(...xs)) / 2,
          y: relatives[0].coords.y + vertical_spacing,
        };

        if (node.left?.coords && node.coords.x - node.left.coords.x < horizontal_spacing)
          offset(node, node.left.coords.x + horizontal_spacing - node.coords.x, 0, findRelativesNodes);
      } else if (node.left?.coords)
        node.coords = { x: node.left.coords.x + horizontal_spacing, y: node.left.coords.y };
      else
        left = node;
      node = node.right;
    }

    while (left) {
      left.coords = { x: left.right.coords.x - horizontal_spacing, y: left.right.coords.y };
      left = left.left;
    }
  }

  // Offset to have the root at 0,0
  offset(root, -root.coords.x, -root.coords.y, findRelativesNodes);
}

function offset(root, dx, dy, findRelativesNodes) {
  const todo = [root];
  const done = [];
  while (todo.length) {
    let node = todo.pop();
    if (!node?.coords || done.includes(node))
      continue;
    node.coords.x += dx;
    node.coords.y += dy;

    todo.push(...findRelativesNodes(node));
    if (node.right)
      todo.push(node.right);
    done.push(node);
  }
}

/**
 * Generates a graph to be displayed
 * @param {Person} root The starting person
 * @returns {Graph} - The graph to display
 */
export function generate(root) {
  const findParents = (person) => [person.parent1, person.parent2].filter((p) => p);
  const [ancestorNodes, ancestorEdges] = extractNodes(root, findParents);
  calculateCoords(ancestorNodes, HORIZONTAL_SPACING + 1, VERTICAL_SPACING + 1, findParents);

  const findChildren = (person) => person.children;
  const [decendantsNodes, decendantsEdges] = extractNodes(root, findChildren);
  calculateCoords(decendantsNodes, HORIZONTAL_SPACING + 1, -VERTICAL_SPACING - 1, findChildren);
  
  const nodes = ancestorNodes.concat(decendantsNodes.slice(1));
  const edges = ancestorEdges.concat(decendantsEdges);
  return { nodes: nodes, edges: edges };
}