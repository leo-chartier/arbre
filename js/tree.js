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

function linkNodes(left, middle, right) {
  if (left != null)
    left.right = middle;
  if (middle != null) {
    middle.left = left;
    middle.right = right;
  }
  if (right != null)
    right.left = middle;
}

/**
 * Create a node in the graph for a new person.
 * @param {string} id - The ID of the person for the new node.
 * @param {Node} predecessorNode - The node of the person's .
 * @param {Relation} relation - How is this person for their predecessor.
 * @param {Relatives} predecessorRelatives - The relatives of the predecessor.
 * @param {Node[]} lastNodes - An array containing the first node of each degree.
 * @returns 
 */
function createNode(id, predecessorNode, relation, predecessorRelatives, lastNodes) {
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
        lastNodes.unshift(node);
      } else {
        // There is already a row above, try to find an existing parent there
        lastNode = lastNodes[--degree];
        let existingParent = lastNode;
        while (existingParent != null && !predecessorRelatives.parents.includes(existingParent.id))
          existingParent = existingParent.left;
        if (existingParent != null) {
          linkNodes(existingParent, node, existingParent.right);
        } else {
          // There is no existing parent
          // TODO
        }
      }
      break;
    case Relation.SPOUSE:
      linkNodes(predecessorNode, node, predecessorNode.right);
      break;
    case Relation.CHILD:
      // TODO: Copy & adapt from parents
      break;
  }

  if (node.right == null) {
    // The node is at the end of its row
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
          if (graph[id]) continue;

        graph[id] = createNode(id, predecessorNode, relationMap[type], relatives[predecessorId], lastNodes);
        todo.push(id);
      }
    }
  }

  return graph;
}

/**
 * Get the places of each person into a jaggered array.
 * @param {Graph} graph
 * @returns {string[][]}
 */
function debugPlaces(graph) {
  let minY = Math.min(...Object.values(graph).map((entry) => entry.place?.y));

  let array = [];
  for (let person of Object.values(graph)) {
    if (!person.place) continue;
    array[person.place.y - minY] ||= [];
    array[person.place.y - minY][person.place.x] = person.id;
  }

  return array;
}
