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
      let predecessor = Object.values(graph).find((entry) => entry.place?.x == predX && entry.place?.y == predY)?.id;
      if (!predecessor) continue;

      let group = [
        ...relatives[predecessor][relation],
        ...relatives[predecessor][relation].flatMap((id) => relatives[id].spouses),
      ];
      let xs = group.map((id) => graph[id]?.place?.x).filter((x) => x !== undefined);

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
    .filter((p) => p.place && p.place.y === y && p.place.x >= x)
    .forEach((p) => p.place.x++);

  // Assign placement
  person.place = { x, y };
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
 * @param {GraphEntry} person1 - The first profile.
 * @param {GraphEntry} person2 - The second profile.
 * @returns {boolean} - Whether there is an overlap.
 */
function overlaps(person1, person2) {
  return Math.abs(person1.position.x - person2.position.x) < 1 + PROFILE_HORIZONTAL_SPACING && 
    Math.abs(person1.position.y - person2.position.y) < 1 + PROFILE_VERTICAL_SPACING;
}

/**
 * Calculate the position of each parent.
 * @param {string} id - The ID of the person that triggered the positioning.
 * @param {Graph} graph - The graph and its data.
 * @param {Union[]} unions - List of all couples and their children.
 * @param {string[]} modified - List of people that have been repositioned.
 */
function positionsParents(id, graph, unions, modified) {
  let union = unions.find((union) => (union.children ?? []).includes(id));
  if (!union) return;
  let parents = [union.parent1, union.parent2].filter((id) => id != null);
  if (parents.length == 0 || union.children.length == 0) return;
  let parentsCenter = getCenter(parents, graph);
  let childrenCenter = getCenter(union.children, graph);
  let offset = parentsCenter - childrenCenter;
  if (offset == 0) return;

  // Apply the offset
  let row = Object.values(graph).filter((person) => person.place.y == graph[parents[0]].place.y);
  let affected = parents;
  while (affected.length) {
    let id = affected.shift();
    graph[id].position.x -= offset;
    modified.push(id);

    // Propagate the push if overlaps
    for (let person of row) {
      if (person.id != id && overlaps(person, graph[id]) && !affected.includes(person.id)) {
        affected.push(person.id);
      }
    }
  }
}

/**
 * Calculate the position of each profile.
 * @param {string} root - The ID of the person at the root.
 * @param {Graph} graph - The graph and its data.
 * @param {Union[]} unions - List of all couples and their children.
 * @param {Object<string, Relatives>} relatives - The person's relatives.
 */
function positions(root, graph, unions, relatives) {
  // Default positions
  Object.values(graph).forEach(
    (person) =>
      (person.position = {
        x: person.place.x * (1 + PROFILE_HORIZONTAL_SPACING),
        y: person.place.y * (1 + PROFILE_VERTICAL_SPACING),
      })
  );

  // Ensure alignment
  let modified = [root];
  while (modified.length) {
    let id = modified.shift();

    positionsParents(id, graph, unions, modified);
    // TODO: Position children & spouses
  }

  // Shift the origin
  let { x, y } = graph[root].position;
  for (let person of Object.values(graph)) {
    person.position.x -= x;
    person.position.y -= y;
  }
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

  positions(root, graph, unions, relatives);

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
