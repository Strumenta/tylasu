import {Node} from "./ast";

interface TranspilationTrace {
    originalCode: string,
    sourceAST: Node,
    targetAST: Node,
    generatedCode: string
}
