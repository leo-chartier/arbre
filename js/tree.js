/** Amount of horizontal space between profiles proportionally to a profile. */
let PROFILE_HORIZONTAL_SPACING = 0.2;
/** Amount of vertical space between profiles proportionally to a profile. */
let PROFILE_VERTICAL_SPACING = 1.0;

/**
 * Find the different relations for each person.
 * @param {Union[]} unions - A list of the different couples and their children.
 * @returns {Object<string, Object<string, string[]>>} - A mapping of the relations.
 */
function getRelations(unions) {
  let relations = {};

  // Ensure a person exists in relations
  const ensureEntry = (id) => (relations[id] ||= { parents: [], spouses: [], children: [] });

  for (const { parent1, parent2, children } of unions) {
    ensureEntry(parent1);
    if (parent2) ensureEntry(parent2);

    for (const child of children || []) {
      ensureEntry(child);
      relations[parent1].children.push(child);
      relations[child].parents.push(parent1);

      if (parent2) {
        relations[parent2].children.push(child);
        relations[child].parents.push(parent2);
      }
    }

    if (parent2) {
      relations[parent1].spouses.push(parent2);
      relations[parent2].spouses.push(parent1);
    }
  }

  return relations;
}

/**
 * Calculate the position of a profile and add it to the list. Move the others if necessary.
 * @param {string} id - The ID of the person to add.
 * @param {Graph} graph - The graph and its data.
 */
function place(id, graph) {
  if (graph[id] == undefined) {
    throw Error(`Trying to place ID ${id} but its data isn't initialized.`);
  }
  let person = graph[id];

  // TODO: Move others

  person["position"] = { x: 1, y: 1 };
}

/**
 * Get the positions of everyone.
 * @param {string} root - The ID to place first.
 * @param {Union[]} unions - List of all couples and their children.
 * @returns {Graph} - Everyone's position and their predecessors.
 */
function generate(root, unions) {
  let graph = {
    [root]: {
      id: root,
      predecessor: root,
      relation: Relation.ROOT,
      depth: 0,
      position: { x: 0, y: 0 },
    },
  };

  let relations = getRelations(unions);
  let todo = [root];

  while (todo.length) {
    let id = todo.shift();

    ["parents", "spouses", "children"].forEach((type) => {
      for (const person of relations[id][type]) {
        if (!graph[person]) {
          graph[person] = {
            id: person,
            predecessor: id,
            relation: Relation[type.toUpperCase()],
            depth: graph[id].depth + 1,
          };
          todo.push(person);
        }
      }
    });

    if (!graph[id].position) {
      place(id, graph);
    }
  }

  return graph;
}

console.log(generate("0", UNIONS)); // TEMP
