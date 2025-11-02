interface PythonSyntaxMap {
    [type: string]: RegExp;
}

interface Removals {
    position: number,
    removed: string,
    replaceWith: string
}

interface GlammOutput {
    regex: RegExp;
    removals: Removals[]
}

function glamm(pattern: string): GlammOutput {
    const pythonSyntax: PythonSyntaxMap = {
        "group name": /\?P<[^>]+>/g, // maybe need to change the [^>] part
        "group reference": /\?P=[^\?\+\*\s<>\!\)\()]+/g,
        "possessive quantifiers": /.(\?|\*|\+)\+/g,
        "possessive braces": /\{\d+\s*,\s*\d+\}\+/g,
        "beginning of the string": /\\A/g, 
        "end of the string": /\\(Z|z)/g, 
        "inline flags": /\?[auismLx]+/g, 
        "inline comments": /\?#[^\)]*/g,
    };

    const removals: Removals[] = [];
    const flags: string[] = [];

    for (const [type, regex] of Object.entries(pythonSyntax)) {
        let replacement;
        let match;

        while ((match = regex.exec(pattern))) {
            if (match.index === undefined) continue;
            const fullMatch = match[0];
            replacement = "";

            if (type === "group name")
                replacement = replaceGroupName(fullMatch);
            else if (type === "group reference")
                replacement = replaceGroupReference(fullMatch);
            else if (type === "possessive braces")
                replacement = replacePossessiveBraces(fullMatch);
            else if (type === "possessive quantifiers")
                replacement = replacePossessiveQuantifiers(fullMatch);
            else if (type.includes("beginning"))
                replacement = "^";
            else if (type.includes("end"))
                replacement = "$";

            if (type === "inline flags") 
                flags.push(...getFlags(fullMatch))

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

    const regex = new RegExp(cleanPattern(pattern), [...new Set(flags)].join(""))
    
    return { regex, removals };
}

const example = glamm("(?ism)");
console.log(example);

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
    const flags = pattern.match(/[auismLx]/g)
        ?.filter((flag) => !["a", "L", "x"].includes(flag));

    // This way we get rid of same flags
    return [...new Set(flags)];
}

function cleanPattern(pattern: string) {
    const regex = /\(([^()]*)\)/g;
    let match;

    while ((match = regex.exec(pattern)) !== null) {
        const insideParentheses = match[1]!;

        if (/^\\k<[^>]+>$/.test(insideParentheses)) {
            pattern = pattern.replace(match[0], insideParentheses);
            regex.lastIndex = 0;
        } else if (/^$/.test(insideParentheses)) {
            // remove parenthesis if they are empty
            pattern = pattern.replace(match[0], insideParentheses);
            regex.lastIndex = 0;
        }
    }

    return pattern;
}