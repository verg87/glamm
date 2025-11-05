import { glamm } from "../src/compiler.ts";
import { describe, test, expect } from "vitest";

describe("glamm tests", () => { 
    test("should convert group name", () => {
        const pythonGroupName = "(?P<username>\\w+)";
        const { regex, removals } = glamm(pythonGroupName);

        expect(String(regex).indexOf("P")).toBe(-1);
        expect(removals.length).toBe(1);
    });

    test("should convert group reference", () => {
        const pythonGroupReference = "(?P<username>\\w+), (?P=username)@gmail.com";
        const { regex, removals } = glamm(pythonGroupReference);

        expect(String(regex).includes("\\k<username>")).toBeTruthy();
        expect(removals.length).toBe(2);
    });

    describe("possessive quantifiers tests", () => {
        test("should convert ++ to it's JavaScript equivalent", () => {
            const pythonPossessiveQuantifier = "a++bc";
            const { regex, removals } = glamm(pythonPossessiveQuantifier);

            expect(/=\(a\+\).+\\1a\+/.test(String(regex))).toBeTruthy();
            expect(removals.length).toBe(1);
        });

        test("should convert *+ to it's JavaScript equivalent", () => {
            const pythonPossessiveQuantifier = "a*+bc";
            const { regex, removals } = glamm(pythonPossessiveQuantifier);

            expect(/a\*\(a\*\).+\\1a\+/.test(String(regex))).toBeTruthy();
            expect(removals.length).toBe(1);
        });

        test("should convert ?+ to it's JavaScript equivalent", () => {
            const pythonPossessiveQuantifier = "a?+bc";
            const { regex, removals } = glamm(pythonPossessiveQuantifier);

            expect(String(regex)).toBe("/abc/");
            expect(removals.length).toBe(1);
        });
    });

    test("should convert possessive braces", () => {
        const pythonPossessiveBraces = "a{3, 5}+aa";
        const { regex, removals } = glamm(pythonPossessiveBraces);
        const testString = "bla bla aaaaa";

        expect(String(regex)).toBe("/a{5}aa/");
        expect(regex.test(testString)).toBeFalsy();

        expect(removals.length).toBe(1);
        expect(removals[0]?.removed).toBe("{3, 5}+");
        expect(removals[0]?.replaceWith).toBe("{5}");
    });

    test("should convert \\A to ^", () => {
        const pythonBeginningOfTheString = "\\AThe day";
        const { regex, removals } = glamm(pythonBeginningOfTheString);

        expect(String(regex)).toBe("/^The day/");
        expect(removals.length).toBe(1);
    });

    test("should convert \\Z or \\z to $", () => {
        const pythonEndOfTheString = "The day\\Z";
        const { regex, removals } = glamm(pythonEndOfTheString);

        expect(String(regex)).toBe("/The day$/");
        expect(removals.length).toBe(1);
    });

    test("should convert inline flags", () => {
        const pythonInlineFlags = "(?ism)The DAY";
        const { regex, removals } = glamm(pythonInlineFlags);

        expect(String(regex)).toBe("/The DAY/ims");
        expect(regex.test("the day")).toBeTruthy();

        expect(removals.length).toBe(1);
    });

    test("should remove inlilne comments", () => {
        const pythonInlineComments = "(bla bla ?# --this is a comment)";
        const { regex, removals } = glamm(pythonInlineComments);

        expect(String(regex)).toBe("/(bla bla )/");
        expect(removals.length).toBe(1);
    });

    test("should return the regex if it's already working in JavaScript", () => {
        const pythonPattern = "a?, b+";
        const { regex, removals } = glamm(pythonPattern);

        expect(String(regex)).toBe("/a?, b+/");
        expect(removals.length).toBe(0);
    });
});