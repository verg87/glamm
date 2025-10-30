

interface PythonSyntaxMap {
    [type: string]: [RegExp, string];
}

interface Removals {
    position: number,
    removed: string,
    replaceWith: string
}

function PTSRegex(pattern: string) {
    const pythonSyntax: PythonSyntaxMap = {
        "group name": [/\(\?P<[^>]+>/g, ""],
        "possessive quantifiers": [/(\?\+|\*\+|\+)\+/g, ""],
        "possessive braces": [/\{\d+\s*,\s*\d+\}\+/g, ""],
        "non capturing group": [/\(\?\.\.\.\)/g, ""],
        "beginning of the string": [/\\A/g, "^"], 
        "end of the string": [/\\(Z|z)/g, "$"], 
    };

    const removals: Removals[] = [];

    for (const [type, info] of Object.entries(pythonSyntax)) {
        let [regex, replacement] = info;

        let match;

        while ((match = regex.exec(pattern))) {
            if (match.index === undefined) continue;
            const fullMatch = match[0];

            if (type === "group name")
                replacement = replaceGroupName(fullMatch);
            if (type === "possessive braces")
                replacement = replacePossessiveBraces(fullMatch);
            // if (type === "possessive quantifiers")
            //     replacement = replacePossessiveQuantifiers(fullMatch);

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

const example = PTSRegex("a{3,  5}+aa");
console.log(example);

function replaceGroupName(pattern: string) {
    const pTag = pattern.indexOf("P");

    return pattern.slice(0, pTag) + pattern.slice(pTag + 1, pattern.length + 1);
}

function replacePossessiveBraces(pattern: string) {
    const plusSign = pattern.indexOf("+");
    pattern = pattern.slice(0, plusSign) + pattern.slice(plusSign + 1, pattern.length + 1);

    const minQuantifier = pattern.match(/(?<=\{)\d+\s*,\s*/)!;
    pattern = pattern.slice(0, minQuantifier.index) + pattern.slice(minQuantifier[0].length + 1, pattern.length + 1);

    return pattern;
}

function replacePossessiveQuantifiers(pattern: string) {
    // For now assume pattern is always *+
    // a*+ should grab all the a's avaliable, in the example: "bla bla aaaa xx", it should match all a's
    // const lowestAmount = 
}

// const example = replacePossessiveBraces("a{3, 5}+aa");
// console.log(example);