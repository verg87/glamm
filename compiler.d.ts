interface Removals {
    position: number;
    removed: string;
    replaceWith: string;
}
interface GlammOutput {
    regex: RegExp;
    removals: Removals[];
}
export declare function glamm(pattern: string): GlammOutput;
export {};
//# sourceMappingURL=compiler.d.ts.map