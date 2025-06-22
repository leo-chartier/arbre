/** Amount of horizontal space between profiles proportionally to a profile. */
let PROFILE_HORIZONTAL_SPACING = 0.2;
/** Amount of vertical space between profiles proportionally to a profile. */
let PROFILE_VERTICAL_SPACING = 1.0;

/**
 * Find the different relations for each person.
 * @param {Union[]} unions - A list of the different couples and their children.
 * @returns {Object<string, Relatives>} - A mapping of the relatives.
 */
function getRelatives(unions) {
  let relatives = {};

  // Ensure a person exists in relations
  const ensureEntry = (id) => (relatives[id] ||= { parents: [], spouses: [], children: [] });

  for (const { parent1, parent2, children } of unions) {
    ensureEntry(parent1);
    if (parent2) ensureEntry(parent2);

    for (const child of children || []) {
      ensureEntry(child);
      relatives[parent1].children.push(child);
      relatives[child].parents.push(parent1);

      if (parent2) {
        relatives[parent2].children.push(child);
        relatives[child].parents.push(parent2);
      }
    }

    if (parent2) {
      relatives[parent1].spouses.push(parent2);
      relatives[parent2].spouses.push(parent1);
    }
  }

  return relatives;
}

function linkNodes(left, right) {
  if (left != null)
    left.right = right;
  if (right != null)
    right.left = left;
}

/**
 * 
 * @param {Node} node - The node to insert.
 * @param {Node} predecessorNode - The predecessor of the node to insert.
 * @param {Node} lastNode - Last node on the row of the predecessor.
 * @param {Object<string, Relatives>} relatives - A mapping of the relatives.
 * @param {number} offset - The degree offset (vertical).
 * @param {string} relation - What the node is to its predecessor.
 */
function insertNode(node, predecessorNode, lastNode, relatives, relation) {
  // There is already a row above, try to find an existing parent there
  let child = predecessorNode;
  let existingParent = null;
  while (child != null) {
    existingParent = lastNode;
    while (existingParent != null && !relatives[child.id][relation].includes(existingParent.id))
      existingParent = existingParent.left;
    if (existingParent != null)
      break;
    child = child.left;
  }

  if (existingParent != null) {
    // There are other nodes to the left
    linkNodes(node, existingParent.right);
    linkNodes(existingParent, node);
  } else {
    // Default to the start of the row
    while (lastNode.left != null)
      lastNode = lastNode.left;
    linkNodes(node, lastNode);
  }
}

/**
 * Create a node in the graph for a new person.
 * @param {string} id - The ID of the person for the new node.
 * @param {Node} predecessorNode - The node of the person's .
 * @param {Relation} relation - How is this person for their predecessor.
 * @param {Object<string, Relatives>} relatives - A mapping of the relatives.
 * @param {Node[]} lastNodes - An array containing the first node of each degree.
 * @returns {Node} The newly created node.
 */
function createNode(id, predecessorNode, relation, relatives, lastNodes) {
  /**
   * @type {Node}
   */
  const node = {
    id: id,
    predecessor: predecessorNode.id,
    relation: relation,
    left: null,
    right: null,
    depth: predecessorNode.depth + 1,
    position: null,
  };

  let lastNode = predecessorNode;
  while (lastNode.right != null)
    lastNode = lastNode.right;
  let degree = lastNodes.indexOf(lastNode);
  if (degree == -1)
    throw new Error(`Node with id ${lastNode.id} has no right element but is not in list of last nodes. (ID: ${id})`);

  switch (relation) {
    case Relation.ROOT:
      return predecessorNode; // Do not modify the root
    case Relation.PARENT:
      if (degree == 0) {
        // Create a new row
        lastNodes.unshift(null);
      } else {
        // There is already a row above, try to find an existing parent there
        lastNode = lastNodes[--degree];
        insertNode(node, predecessorNode, lastNode, relatives, "parents");
      }
      break;
    case Relation.SPOUSE:
      linkNodes(node, predecessorNode.right);
      linkNodes(predecessorNode, node);
      degree = lastNodes.indexOf(lastNode);
      break;
    case Relation.CHILD:
      degree++;
      if (degree == lastNodes.length) {
        // Create a new row
        lastNodes.push(null);
      } else {
        // There is already a row below, try to find an existing child there
        lastNode = lastNodes[degree];
        insertNode(node, predecessorNode, lastNode, relatives, "parents");
      }
      break;
  }

  if (node.left == lastNodes[degree]) {
    // The node is at the end of its row
    linkNodes(lastNodes[degree], node);
    lastNodes[degree] = node;
  }

  return node;
}

/**
 * Calculate the center of mass of multiple person.
 * @param {string[]} group - The ID of the people.
 * @param {Graph} graph - The graph and its data.
 * @returns {number} - The X value of their center.
 */
function getCenter(group, graph) {
  if (!group.length) return null;
  let xs = group.map((id) => graph[id].position.x);
  return (Math.min(...xs) + Math.max(...xs)) / 2;
}

/**
 * Check if two profiles overlap.
 * @param {Node} person1 - The first profile.
 * @param {Node} person2 - The second profile.
 * @returns {boolean} - Whether there is an overlap.
 */
function overlaps(person1, person2) {
  return Math.abs(person1.position.x - person2.position.x) < 1 + PROFILE_HORIZONTAL_SPACING && 
    Math.abs(person1.position.y - person2.position.y) < 1 + PROFILE_VERTICAL_SPACING;
}

/**
 * Mapping of relation attribute to its corresponding enum value.
 */
const relationMap = { parents: Relation.PARENT, spouses: Relation.SPOUSE, children: Relation.CHILD };

/**
 * Get the positions of everyone.
 * @param {string} root - The ID to place first.
 * @param {Union[]} unions - List of all couples and their children.
 * @returns {Graph} - Everyone's position and their predecessors.
 */
function generate(root, unions) {
  /**
   * @type {Node}
   */
  const rootNode = {
    id: root,
    relation: Relation.ROOT,
    depth: 0,
    left: null,
    right: null,
    position: { x: 0, y: 0 },
  };
  rootNode.predecessor = rootNode;
  let graph = {[root]: rootNode};

  let relatives = getRelatives(unions);
  let todo = [root];
  let lastNodes = [rootNode];

  while (todo.length) {
    const predecessorId = todo.shift();
    if (!predecessorId || !graph[predecessorId] || !relatives[predecessorId]) continue;
    const predecessorNode = graph[predecessorId];

    for (const type in relationMap) {
      for (const id of relatives[predecessorId][type]) {
        if (graph[id])
          continue;

        graph[id] = createNode(id, predecessorNode, relationMap[type], relatives, lastNodes);
        todo.push(id);
      }
    }
  }

  return graph;
}

/**
 * Get the places of each person into a jaggered array.
 * @param {Node[]} lastNodes - The last node of each row.
 * @returns {string[][]} A jaggered of ids.
 */
function debugPlaces(lastNodes) {
  let array = [];

  for (const lastNode of Object.values(lastNodes)) {
    let row = [];
    for (let node = lastNode; node != null; node = node.left) {
      row.unshift(node.id);
    }
    array.push(row);
  }

  return array;
}
