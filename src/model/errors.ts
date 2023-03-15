import {Position} from "./position";
import {NodeName, ASTNode} from "./model";

/**
 * An AST node that marks the presence of an error, for example a syntactic or semantic error in the original tree.
 */
export interface ErrorNode {
    message: string;
    position?: Position;
}

/**
 * Generic implementation of ErrorNode.
 */
@NodeName("", "GenericErrorNode")
export class GenericErrorNode extends ASTNode implements ErrorNode {
    message: string;

    constructor(error?: Error, message?: string) {
        super();
        if (message) {
            this.message = message;
        }
        else if (error) {
            const msg = error.message ? `: ${error.message}` : "";
            this.message = `Exception ${error.name}${msg}`;
        }
        else {
            this.message = "Unspecified error node";
        }
    }
}
