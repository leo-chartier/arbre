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

/**
 * Calculate the placement of a profile. Move the others if necessary.
 * @param {string} id - The ID of the person to add.
 * @param {Graph} graph - The graph and its data.
 * @param {Object<string, Relatives>} relatives - The person's relatives.
 */
function place(id, graph, relatives) {
  if (!graph[id]) {
    throw Error(`Trying to place ID ${id} but its data isn't initialized.`);
  }
  let person = graph[id];
  let { x, y } = graph[person.predecessor].place;

  function nextPlace(relation) {
    let predY = graph[person.predecessor].place.y;
    let predX = x;

    while (predX >= 0) {
      let predecessor = Object.values(graph).find(entry => entry.place?.x == predX && entry.place?.y == predY)?.id;
      if (!predecessor) continue;
      
      let group = [...relatives[predecessor][relation], ...relatives[predecessor][relation].flatMap(id => relatives[id].spouses)];
      let xs = group.map(id => graph[id]?.place?.x).filter(x => x !== undefined);
      
      if (xs.length) return Math.max(...xs) + 1;
      predX--;
    }
    return 0;
  }

  // Determine correct place
  switch (person.relation) {
    case Relation.ROOT:
      return; // Do not modify the root
    case Relation.PARENT:
      y--;
      x = nextPlace("parents");
      break;
    case Relation.SPOUSE:
      x++;
      break;
    case Relation.CHILD:
      y++;
      x = nextPlace("children");
      break;
  }

  // Shift other profiles
  Object.values(graph)
    .filter(p => p.place && p.place.y === y && p.place.x >= x)
    .forEach(p => p.place.x++);

  // Assign placement
  person.place = { x, y };
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
      place: { x: 0, y: 0 },
      position: { x: 0, y: 0 },
    },
  };

  let relatives = getRelatives(unions);
  let todo = [root];

  const relationMap = { parents: Relation.PARENT, spouses: Relation.SPOUSE, children: Relation.CHILD };

  while (todo.length) {
    let id = todo.shift();
    if (!relatives[id]) continue;

    for (const type in relationMap) {
      for (const person of relatives[id][type]) {
        if (!graph[person]) {
          graph[person] = {
            id: person,
            predecessor: id,
            relation: relationMap[type],
            depth: graph[id].depth + 1,
          };
          todo.push(person);
        }
      }
    }

    if (!graph[id].place) {
      place(id, graph, relatives);
    }
  }

  // TODO: Correct positions
  // TEMP
  for (let person of Object.values(graph)) {
    person.position = person.place;
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
