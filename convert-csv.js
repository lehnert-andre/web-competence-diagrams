// Mapping of step names to colors.
var colors = {
    "palette": ["#845EC2", "#D65DB1", "#FF6F91", "#FF9671", "#FFC75F", "#2C73D2", "#0089BA", "#008E9B", "#008F7A", "#00C9A7", "#B39CD0", "#C34A36", "#FF8066", "#D5CABD"],
    "default": "#bbbbbb"
};


const buildHierarchy = function (csv) {

    // append columns to one line
    const rows = [];
    for (var row = 0; row < csv.length; row++) {
        const rowCols = csv[row];
        let line = '';
        for (var col = 0; col < rowCols.length; col++) {
            const colValue = rowCols[col];

            if (colValue && colValue !== '') {
                line += colValue.replace('-', '~');
                 line += '-'; //separator
            }
        }

        if (line.endsWith('-') || line.endsWith(',')) {
            line = line.substr(0, line.length - 1);
        }

        rows.push(line);
    }

    var root = {"name": "root", "children": []};
    for (var i = 0; i < rows.length; i++) {
        try {
            var sequence = rows[i];

            var parts = sequence.split("-");
            var currentNode = root;
            for (var j = 0; j < parts.length - 1; j++) {
                var children = currentNode["children"];
                var nodeName = parts[j].replace('~', '-');
                var childNode;
                if (j + 1 < parts.length - 1) {
                    // Not yet at the end of the sequence; move down the tree.
                    var foundChild = false;
                    for (var k = 0; k < children.length; k++) {
                        if (children[k]["name"] == nodeName) {
                            childNode = children[k];
                            foundChild = true;
                            break;
                        }
                    }
                    // If we don't already have a child node for this branch, create it.
                    if (!foundChild) {
                        childNode = {"name": nodeName, "children": []};
                        childNode.color = colors.palette[root.children.length % colors.palette.length];
                        children.push(childNode);
                    }
                    currentNode = childNode;
                } else {
                    // Reached the end of the sequence; create a leaf node.
                    childNode = {"name": nodeName, "size": parts[parts.length - 1]};

                    console.log('Other children: ' + JSON.stringify(children));
                    console.log('Last child: ' + JSON.stringify(childNode));

                    children.push(childNode);
                }
            }
        } catch (e) {
            console.error(e);

        }
    }

    return root;
};
