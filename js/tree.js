let root = 3;

function generate(id, generations = {}, depth = 0, done = [], initiator = null) {
    let person = get(id);
    if (person == null || done.indexOf(id) != -1) return [generations, done];

    if (generations[depth] == undefined) generations[depth] = [];

    let parents = { 1: [], 2: [], 3: [] };
    if (person.parents) {
        for (let i = 0; i < person.parents.length; i++) {
            let parent = get(person.parents[i]);
            if (parent == null) continue;
            let sex = parent.sex;
            if (!(1 <= sex && sex <= 3)) sex = 3;
            parents[sex].push(parent.id);
        }
    }

    let spouses = { 1: [], 2: [], 3: [] };
    if (person.spouses) {
        for (let i = 0; i < person.spouses.length; i++) {
            let spouse = get(person.spouses[i]);
            if (spouse == null) continue;
            let sex = spouse.sex;
            if (!(1 <= sex && sex <= 3)) sex = 3;
            spouses[sex].push(spouse.id);
        }
    }

    let children = [];
    for (let i = 0; i < json.length; i++) {
        let child = json[i];
        if (child.parents && child.parents.indexOf(person.id) != -1) children.push(child.id);
    }

    order = [
        [parents[1], depth - 1], // Father
        [spouses[1], depth], // Husband
        [null, depth], // Self
        [children, depth + 1], // Children
        [spouses[2], depth], // Wifes
        [spouses[3], depth], // Other spouses
        [parents[2], depth - 1], // Mother
        [parents[3], depth - 1] // Other parents
    ];
    order.forEach(tuple => {
        let [ids, d] = tuple;
        if (ids && ids.length == 0) return;
        if (generations[d] == undefined) generations[d] = [];
        if (ids == null && done.indexOf(person.id) == -1) {
            // Self
            generations[d].push(person.id);
            done.push(person.id);
        }
        if (ids == null) return;
        ids.forEach(id => {
            [generations, done] = generate(id, generations, d, done, person.id);
        });
    });

    return [generations, done];
}

function place(generations) {
    // TODO: Full implementation with spacing

    let tree = [];
    Object.keys(generations).slice().sort().forEach(gen => {

        tree.push([]);
        for (let i = 0; i < generations[gen].length; i++) {
            let id = generations[gen][i];
            tree[tree.length - 1].push([id, i * (NODE_WIDTH + NODE_HORIZONTAL_SPACING)]);
        }

    });
    return tree
}

function connect(generations, tree) {
    let families = {};
    Object.keys(generations).forEach(gen => {
        generations[gen].forEach(id => {
            let person = get(id);

            if (person.parents == undefined || person.parents.length == 0) return;
            let parents = JSON.stringify(person.parents.slice().sort());

            if (families[parents] == undefined) families[parents] = [];
            families[parents].push(id);
        });
    });

    let connections = [];
    let parentOffset = NODE_HEIGHT / 2 + NODE_VERTICAL_SPACING / 3;
    let childrenOffset = NODE_HEIGHT / 2 + NODE_VERTICAL_SPACING * 2 / 3;
    Object.entries(families).forEach(([parentsStr, childrenIds]) => {
        let entry = {}

        entry["parents"] = JSON.parse(parentsStr);
        let parents = entry["parents"].map(id => {
            let depth, index, [id_, x] = locate(id, tree);
            return [depth * (NODE_HEIGHT + NODE_VERTICAL_SPACING) + parentOffset, x];
        });
        parents.sort((a, b) => a[0] - b[0]);
        entry["from"] = parents;

        childrenIds.sort();
        entry["children"] = childrenIds;
        let children = childrenIds.map(id => {
            let depth, index, [id_, x] = locate(id, tree);
            return [depth * (NODE_HEIGHT + NODE_VERTICAL_SPACING) + childrenOffset, x];
        });
        children.sort((a, b) => a[0] - b[0]);
        entry["to"] = children;

        let fromX = parents.reduce((acc, coord) => acc + coord[0], 0) / parents.length;
        let toX = children.reduce((acc, coord) => acc + coord[0], 0) / children.length;
        let fromIndex = 1;
        let toIndex = 1;
        for (; fromIndex < parents.length; fromIndex++) {
            if (parents[fromIndex][0] < fromX) break;
        }
        for (; toIndex < children.length; toIndex++) {
            if (children[toIndex][0] < toX) break;
        }
        function LERP(x, p0, p1) {
            // y0 + (x - x0)(y1 - y0) / (x1 - x0)
            console.log(x, p0, p1);
            return p0[1] + (x - p0[0])*(p1[1]-p0[1])/(p1[0]-p0[0]);
        }
        let fromY = LERP(fromX, parents[fromIndex-1], parents[fromIndex]);
        let toY = LERP(toX, children[fromIndex-1], children[fromIndex]);
        entry["connection"] = [fromX, fromY, toX, toY];

        connections.push(entry);
    });

    return connections;
}

function get(id) {
    for (let i = 0; i < json.length; i++) {
        if (json[i].id == id) return json[i];
    }
    return null;
}

function locate(id, tree) {
    for (let depth = 0; depth < tree.length; depth++) {
        row = tree[depth];
        for (let index = 0; index < row.length; index++) {
            tuple = row[index];
            if (tuple[0] == id) return [depth, index, tuple[1]];
        }
    }
    return [null, null, null];
}

let generations = generate(root)[0];
tree = place(generations);
console.log(tree);
connections = connect(generations, tree);
console.log(connections);