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
        "group name": [/\?P<[^>]+>/g, ""], // maybe need to change the [^>] part
        "group reference": [/\?P=[^\?\+\*\s<>\!]+/g, ""],
        "possessive quantifiers": [/.(\?|\*|\+)\+/g, ""],
        "possessive braces": [/\{\d+\s*,\s*\d+\}\+/g, ""],
        "inline flags": [/\?[auismLx]+/g, ""],
        "beginning of the string": [/\\A/g, "^"], 
        "end of the string": [/\\(Z|z)/g, "$"], 
    };

    const removals: Removals[] = [];
    const flags: string[] = [];

    for (const [type, info] of Object.entries(pythonSyntax)) {
        let [regex, replacement] = info;

        let match;

        while ((match = regex.exec(pattern))) {
            if (match.index === undefined) continue;
            const fullMatch = match[0];

            if (type === "group name")
                replacement = replaceGroupName(fullMatch);
            if (type === "group reference")
                replacement = replaceGroupReference(fullMatch);
            if (type === "possessive braces")
                replacement = replacePossessiveBraces(fullMatch);
            if (type === "possessive quantifiers")
                replacement = replacePossessiveQuantifiers(fullMatch);
            if (type === "inline flags") {
                flags.push(...getFlags(fullMatch))
                replacement = "";
            }

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

    const regex = new RegExp(pattern, [...new Set(flags)].join())
    
    return { regex, removals };
}

// const example = PTSRegex("(?P=username)");
// console.log(example);

function replaceGroupName(pattern: string) {
    const pTag = pattern.indexOf("P");

    return pattern.slice(0, pTag) + pattern.slice(pTag + 1, pattern.length + 1);
}

function replaceGroupReference(pattern: string) {
    const questionSign = pattern.indexOf("?");

    pattern = pattern.slice(0, questionSign) + pattern.slice(questionSign + 3, pattern.length + 1);

    return `\\k<${pattern}>`;
}

function replacePossessiveBraces(pattern: string) {
    const plusSign = pattern.indexOf("+");
    pattern = pattern.slice(0, plusSign) + pattern.slice(plusSign + 1, pattern.length + 1);

    const minQuantifier = pattern.match(/(?<=\{)\d+\s*,\s*/)!;
    pattern = pattern.slice(0, minQuantifier.index) + pattern.slice(minQuantifier[0].length + 1, pattern.length + 1);

    return pattern;
}

function replacePossessiveQuantifiers(pattern: string) {
    const char = pattern[0];
    const quantifierType = pattern[1];

    if (quantifierType === "*")
        return `${char}*(${char}*)(?!\\1${char}+)\\1`;
    else if (quantifierType === "?")
        return `${char}`
    // if quantifier type is +
    return `(?=(${char}+))(?!\\1${char}+)\\1`;
}

function getFlags(pattern: string) {
    // Need to somehow differentiate the flag signs and simple characters
    const flags = pattern.match(/[auismLx]/g)
        ?.filter((flag) => !["a", "L", "x"].includes(flag));

    // This way we get rid of same flags
    return [...new Set(flags)];
}
