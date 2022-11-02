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

function insertBefore(id, id2, tree) {
    let [depth, index, position] = locate(id, tree);
    if (depth == null) return tree;
    let newPos = position - NODE_WIDTH - NODE_HORIZONTAL_SPACING;
    let shiftTo = newPos - NODE_WIDTH - NODE_HORIZONTAL_SPACING;

    let closest = tree[depth].filter(tuple => {
        return tuple[1] < position;
    }).sort().reverse()[0];
    if (closest != undefined && closest[1] > shiftTo) {
        let distance = closest[1] - shiftTo;
        tree = shiftBefore(position, distance, depth, tree);
    }

    tree[depth].splice(index, 0, [id2, newPos]);
    return tree;
}

function shiftBefore(position, distance, depth, tree) {
    row = tree[depth];
    for (let index = 0; index < row.length; index++) {
        if (row[index][1] >= position) return tree;
        tree[depth][index][1] -= distance;
    }
    return tree;
}

function insertAfter(id, id2, tree) {
    let [depth, index, position] = locate(id, tree);
    if (depth == null) return tree;
    let newPos = position + NODE_WIDTH + NODE_HORIZONTAL_SPACING;
    let shiftTo = newPos + NODE_WIDTH + NODE_HORIZONTAL_SPACING;

    let closest = tree[depth].filter(tuple => {
        return tuple[1] > position;
    }).sort()[0];
    if (closest != undefined && closest[1] < shiftTo) {
        let distance = shiftTo - closest[1];
        tree = shiftAfter(position, distance, depth, tree);
    }

    tree[depth].splice(index+1, 0, [id2, newPos]);
    return tree;
}

function shiftAfter(position, distance, depth, tree) {
    row = tree[depth];
    for (let index = 0; index < row.length; index++) {
        if (row[index][1] > position) tree[depth][index][1] += distance;
    }
    return tree;
}

tree = [[[0, 0]]]; // [id, x][row][], TODO: Convert tree to full {id: [x, y]} mapping
// tree = insertAfter(0, 2, tree);
// tree = insertBefore(2, 1, tree);
tree = insertAfter(0, 2, tree);
tree = insertBefore(0, -2, tree);
tree = insertAfter(0, 1, tree);
tree = insertBefore(0, -1, tree);
// tree should now be [-2, -1, 0, 1, 2]