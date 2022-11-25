import {Position} from "./model/position";

export enum IssueType { LEXICAL, SYNTACTIC, SEMANTIC}

export enum IssueSeverity { ERROR, WARNING, INFO}

export class Issue {
    type: IssueType;
    message: string;
    severity: IssueSeverity = IssueSeverity.ERROR;
    position?: Position;

    constructor(type: IssueType, message: string, severity: IssueSeverity, position?: Position) {
        this.type = type;
        this.message = message;
        this.severity = severity;
        this.position = position;
    }

    static lexical(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position: Position | undefined = undefined): Issue {
        return new Issue(IssueType.LEXICAL, message, severity, position);
    }

    static syntactic(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position: Position | undefined = undefined): Issue {
        return new Issue(IssueType.SYNTACTIC, message, severity, position);
    }

    static semantic(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position: Position | undefined = undefined): Issue {
        return new Issue(IssueType.SEMANTIC, message, severity, position);
    }
}