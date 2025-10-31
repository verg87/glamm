"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function PTSRegex(pattern) {
    const pythonSyntax = {
        "group name": [/\(\?P<[^>]+>/g, ""],
        "possessive quantifiers": [/.(\?|\*|\+)\+/g, ""],
        "possessive braces": [/\{\d+\s*,\s*\d+\}\+/g, ""],
        "non capturing group": [/\(\?\.\.\.\)/g, ""],
        "beginning of the string": [/\\A/g, "^"],
        "end of the string": [/\\(Z|z)/g, "$"],
    };
    const removals = [];
    for (const [type, info] of Object.entries(pythonSyntax)) {
        let [regex, replacement] = info;
        let match;
        while ((match = regex.exec(pattern))) {
            if (match.index === undefined)
                continue;
            const fullMatch = match[0];
            if (type === "group name")
                replacement = replaceGroupName(fullMatch);
            if (type === "possessive braces")
                replacement = replacePossessiveBraces(fullMatch);
            if (type === "possessive quantifiers")
                replacement = replacePossessiveQuantifiers(fullMatch);
            console.log(fullMatch);
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
const example = PTSRegex("b?+b");
console.log(example);
function replaceGroupName(pattern) {
    const pTag = pattern.indexOf("P");
    return pattern.slice(0, pTag) + pattern.slice(pTag + 1, pattern.length + 1);
}
function replacePossessiveBraces(pattern) {
    const plusSign = pattern.indexOf("+");
    pattern = pattern.slice(0, plusSign) + pattern.slice(plusSign + 1, pattern.length + 1);
    const minQuantifier = pattern.match(/(?<=\{)\d+\s*,\s*/);
    pattern = pattern.slice(0, minQuantifier.index) + pattern.slice(minQuantifier[0].length + 1, pattern.length + 1);
    return pattern;
}
function replacePossessiveQuantifiers(pattern) {
    const char = pattern[0];
    const quantifierType = pattern[1];
    console.log(pattern);
    if (quantifierType === "*")
        return `${char}*(${char}*)(?!\\1${char}+)\\1`;
    else if (quantifierType === "?")
        return `${char}`;
    // if quantifier type is +
    return `(?=(${char}+))(?!\\1${char}+)\\1`;
}
//# sourceMappingURL=compiler.js.map