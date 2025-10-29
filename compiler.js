"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function PTSRegex(pattern) {
    const pythonSyntax = {
        "named group": [/\(\?P<[^>]+>/g, ""],
        "quantifiers w/o backtracking": [/(\?|\*|\+)\+/g, ""],
        "non capturing group": [/\(\?\.\.\.\)/g, ""],
        "beginning of the string": [/\\A/g, "^"],
        "end of the string": [/\\(Z|z)/g, "$"],
    };
    const removals = [];
    for (const [_, info] of Object.entries(pythonSyntax)) {
        const [regex, replacement] = info;
        let match;
        while ((match = regex.exec(pattern))) {
            if (match.index === undefined)
                continue;
            const fullMatch = match[0];
            removals.push({
                position: match.index,
                removed: fullMatch,
                replaceWith: replacement
            });
            pattern = pattern.slice(0, match.index) + replacement + pattern.slice(match.index + fullMatch.length);
            regex.lastIndex = match.index + replacement.length;
        }
    }
    return { pattern, removals };
}
const example = PTSRegex("\\AThe \\w+");
console.log(example);
//# sourceMappingURL=compiler.js.map