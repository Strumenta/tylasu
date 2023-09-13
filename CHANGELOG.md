# Changelog
All notable changes to this project from version 1.2.0 upwards are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
