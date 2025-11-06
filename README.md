# Glamm: Python to JavaScript Regex Converter

Glamm is a lightweight utility that converts Python-flavored regular expressions into JavaScript-compatible ones. It helps bridge the gap between the regex syntax of the two languages, allowing you to use familiar Python patterns in a JavaScript environment.

## Features

Glamm currently supports the following conversions:

-   **Named Capture Groups:** `(?P<name>...)` is converted to `(?<name>...)`
-   **Named Group References:** `(?P=name)` is converted to `\k<name>`
-   **Possessive Quantifiers:** `*+`, `++`, `?+` are converted to their JavaScript equivalents.
-   **Start of String Anchor:** `\A` is converted to `^`.
-   **End of String Anchors:** `\Z` and `\z` are converted to `$`.
-   **Inline Flags:** Extracts flags like `i`, `s`, `m`, `u` from `(?is...)`.
-   **Inline Comments:** `(?#...)` are removed.

## Code Example

Here's an example of how to use Glamm to convert a Python regex pattern:

```javascript
import { glamm } from "glamm";

const pythonPattern = "(?i)(?P<username>\w+), (?P=username)@gmail.com";

const { regex } = glamm(pythonPattern);

console.log(regex);
// Output: /(?<username>\w+), \k<username>@gmail.com/i
```

## How to Run Locally

1.  **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
2.  **Clone the repository:**
    ```bash
    npm install glamm
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the compiler:**
    ```bash
    npm start
    ```
    This command will compile the TypeScript code and run the `compiler.js`.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. To run the tests, use the following command:

```bash
npm test
```

### Coverage

To generate a test coverage report, run:

```bash
npm run coverage
```

This will create a `coverage` directory with a detailed report.
