[![npm version](https://badge.fury.io/js/%40strumenta%2Ftylasu.svg)](https://badge.fury.io/js/%40strumenta%2Ftylasu)

# Tylasu – AST Library for TypeScript

[Tylasu](https://github.com/Strumenta/tylasu) supplies the infrastructure to build a custom, possibly mutable, Abstract Syntax Tree (AST) using TypeScript.

Tylasu is part of the [StarLasu](https://github.com/Strumenta/StarLasu) family of libraries. The other libraries provide
similar support in other languages.

Tylasu come with optional facilities for integration with ANTLR, specifically the 
[antlr4ts](https://github.com/tunnelvisionlabs/antlr4ts) implementation.

## Documentation

The high-level documentation of the concepts that make up StarLasu is available on [the StarLasu repository](https://github.com/Strumenta/StarLasu) on GitHub.

The documentation of Tylasu's APIs, that implement those concepts, is available at https://strumenta.github.io/tylasu/.

## Building and Releasing

`yarn build` compiles the sources.

`yarn dist` compiles, tests and builds the npm package.

`yarn publish-lib` creates the dist and uploads it to the NPM registry and GitHub packages.
