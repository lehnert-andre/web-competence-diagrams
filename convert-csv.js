// Mapping of step names to colors.
var colors = {
    "palette": ["#845EC2", "#D65DB1", "#FF6F91", "#FF9671", "#FFC75F", "#2C73D2", "#0089BA", "#008E9B", "#008F7A", "#00C9A7", "#B39CD0", "#C34A36", "#FF8066", "#D5CABD"],
    "default": "#bbbbbb"
};

const buildHierarchy = function (rows) {
    var root = {"name": "root", "children": []};

    rows.sort(function (columns1, columns2) {
        if (columns1[0] < columns2[0]) {
            return -1;
        }
        if (columns1[0] > columns2[0]) {
            return 1;
        }
        return 0;

    });

    for (var row = 0; row < rows.length; row++) {
        var currentRow = rows[row];

        var category = getNode(currentRow[0], root);
        let currentNode = category;

        for (var col = 1; col < currentRow.length - 1; col++) {
            const currentCol = currentRow[col];
            const node = getNode(currentCol, currentNode);

            if (col + 1 === currentRow.length - 1) {
                node.size = currentRow[col + 1];
            }
            if (isNewNode(currentCol, currentNode)) {
                currentNode.children.push(node);
            } else {
                currentNode = node;
            }
        }

        if (currentRow.length === 2) {
            currentNode.size = currentRow[1];
        }

        if (isNewNode(currentRow[0], root)) {
            category.color = colors.palette[root.children.length % colors.palette.length];
            root.children.push(category);
        }
    }

    console.log(JSON.stringify(root));

    return root;
};


function getNode(data, parentNode) {
    var category = {"name": data, "children": []};

    for (var i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].name === data) {
            category = parentNode.children[i];
            break;
        }
    }

    return category;
}


function isNewNode(data, parentNode) {
    var newCategory = true;

    for (var i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].name === data) {
            newCategory = false;
            break;
        }
    }

    return newCategory;
}