# Changelog
All notable changes to this project from version 1.2.0 upwards are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.2.3] – Not yet released

### Fixed
- Correctly import enums from Ecore

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
