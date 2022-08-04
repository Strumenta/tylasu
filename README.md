[![npm version](https://badge.fury.io/js/%40strumenta%2Ftylasu.svg)](https://badge.fury.io/js/%40strumenta%2Ftylasu)

# Tylasu – AST Library for TypeScript

Tylasu supplies the infrastructure to build a custom, possibly mutable, Abstract Syntax Tree (AST) using TypeScript.

Tylasu is part of the [StarLasu](https://github.com/Strumenta/StarLasu) family of libraries. The other libraries provide
similar support in other languages.

Tylasu is integrated with ANTLR, specifically [antlr4ts](https://github.com/tunnelvisionlabs/antlr4ts).

## Building and Releasing

`yarn build` compiles the sources.

`yarn dist` compiles, tests and builds the npm package.

`yarn publish-lib` creates the dist and uploads it to the NPM registry and GitHub packages.