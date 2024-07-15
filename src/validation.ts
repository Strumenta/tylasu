import {Node} from "./model/model";
import {Position} from "./model/position";
import { capitalize } from "./utils/capitalize";

export enum IssueType { LEXICAL, SYNTACTIC, SEMANTIC}

export enum IssueSeverity { ERROR, WARNING, INFO}

export interface IssueArg {
    name: string;
    value: string;
}

export class Issue {

    constructor(
        public readonly type: IssueType,
        public readonly message: string,
        public readonly severity: IssueSeverity,
        public readonly position?: Position,
        public readonly node?: Node,
        public readonly code?: string,
        public readonly args: IssueArg[] = []
        ) {
        this.message = capitalize(message);

        if (!position) {
            this.position = node?.position;
        }
    }

    static lexical(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position?: Position,
                   node?: Node, code?: string, args: IssueArg[] = []): Issue {
        return new Issue(IssueType.LEXICAL, message, severity, position, node, code, args);
    }

    static syntactic(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position?: Position,
                     node?: Node, code?: string, args: IssueArg[] = []): Issue {
        return new Issue(IssueType.SYNTACTIC, message, severity, position, node, code, args);
    }

    static semantic(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position?: Position,
                    node?: Node, code?: string, args: IssueArg[] = []): Issue {
        return new Issue(IssueType.SEMANTIC, message, severity, position, node, code, args);
    }
}
