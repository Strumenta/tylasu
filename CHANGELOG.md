# Changelog
All notable changes to this project from version 1.2.0 upwards are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.6.0] – 2024-02-28

## Added
- Lionweb deserialization into Tylasu nodes

## Changed
- `addChild` and `setChild` now correctly check for the feature's multiplicity.

## [1.5.8] – 2024-02-27

Included all the changes in the 1.4.x branch (versions 1.4.7 and 1.4.8).

## [1.5.7] – 2024-01-15

### Added
- Traversal functions `walkAncestors` and `findAncestorOfType` from Kolasu

### Changed
- Aligned AST Transformers with Kolasu, and solved several issues in the previous implementation

### Fixed
- `assignParents` didn't assign the right parent

## [1.5.6] – 2023-12-12

### Changed
- `FirstStageParsingResult` now includes the ANTLR `Parser` instance used to obtain the parse tree

## [1.5.5] – 2023-12-12

### Changed
- Updated antlr4ng
- Stopped using deprecated transformation functions in the test suite

## [1.5.4] – 2023-12-07

### Fixed
- Module format for browsers

## [1.5.3] – 2023-12-07

### Fixed
- Don't use antlr4ng's `CharStreams` class because it depends on Node classes and doesn't work in the browser.

## [1.5.2] – 2023-12-07

### Fixed
- `tsconfig.base.json` referring to a local directory that doesn't exist in the released package

## [1.5.1] – 2023-12-07

### Changed
- Moved from antlr4ts to antlr4ng
- Aligned AST Transformers with Kolasu as much as possible
- Moved to Jest for testing

### Fixed
- Several issues with AST Transformers that made them awkward to use

## [1.5.0] – Not released

## [1.4.8] – 2024-01-29

### Fixed
- When importing from Ecore, don't treat origins and destinations as children, as well as everything that's not a Node. 

## [1.4.7] – 2024-01-18

### Added
- Traversal functions `walkAncestors` and `findAncestorOfType` from Kolasu
- Support for Ecore models with Kolasu's `SimpleOrigin` instances

### Changed
- Aligned AST Transformers with Kolasu, and solved several issues in the previous implementation

### Fixed
- `assignParents` didn't assign the right parent

## [1.4.6] – 2023-12-04

### Changed
- Updated several dependencies for security reasons

### Fixed
- Workspace transpilation traces with `ReferenceByName` instances 

## [1.4.5] – 2023-10-10

### Fixed
- In workspace transpilation traces, `SourceNode`s do not always refer to the file they're contained in.

## [1.4.4] – 2023-10-04

### Fixed
- A `TargetNode`'s `parent` is always `undefined`.

## [1.4.3] – 2023-09-13

### Added
- Base tsconfig.json for dependent projects

### Fixed
- Properly track target node files (available as `TargetNode.file`)

## [1.4.2] – 2023-09-05

### Added
- Parser and transpilation trace loaders register the needed Ecore packages and data types automatically 

## [1.4.1] – 2023-09-04

### Added
- More convenient plain JS API for defining nodes

### Changed
- Removed ErrorNode class that differed from Kolasu (StarLasu reference implementation)
- Updated TypeScript to 4.0.x line because 3.x doesn't support newer Lodash versions

## [1.4.0] – 2023-08-22

### Added
- Support for node marker interfaces in EMF models

### Changed
- Updated TypeScript to 4.0.x and updated related dev dependencies

## [1.3.1] – 2023-08-02

### Added
- Missing parser symbols exports

## [1.3.0] – 2023-08-02

### Added
- Support for WorkspaceTranspilationTrace

### Changed
- Partially separated parsing APIs that don't depend on ANTLR. This is a work in progress.
- Support multiple destinations
- Aligned TylasuParser with Kolasu 1.5.24

### Fixed
- Importing enums from Ecore
- `assertASTsAreEqual` recursive call

## [1.2.2] – 2023-02-02

### Added
- Exported EcoreEnabledParser.
- Exported Kolasu and StarLasu metamodels.

## [1.2.1] – 2023-02-01

### Added
- Ported ParseTreeToASTTransformer from Kolasu, for easier mapping of ANTLR4 parse trees into Tylasu ASTs.
- `parseTree` as a convenience property on Node.
- A few more bits of documentation, including this changelog.

## [1.2.0] – 2023-01-25

### Added
- Ported `assertASTsAreEqual` from Kolasu.
- Ported AST Transformers from Kolasu.
- More tests for Ecore and parse/transpilation traces.
- More documentation.
- Published API documentation to [GitHub Pages](https://strumenta.github.io/tylasu/).

### Changed
- Aligned Ecore metamodels with Kolasu (StarLasu reference implementation).
