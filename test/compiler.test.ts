import { glamm } from "../src/compiler.ts";
import { describe, test, expect } from "vitest";

describe("glamm tests", () => { 
    test("should convert group name", () => {
        const pythonGroupName = "(?P<username>\\w+)";
        const { regex } = glamm(pythonGroupName);

        expect(String(regex).indexOf("P")).toBe(-1);
    });

    test("")
});