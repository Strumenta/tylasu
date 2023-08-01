import {CharStream} from "antlr4ts/CharStream";
import {ParsingResult} from "./parsing";
import {Node} from "../model/model";
import {Source} from "../model/position";

export interface ASTParser<R extends Node> {
    /**
     * Parses source code, returning a result that includes an AST and a collection of parse issues (errors, warnings).
     * The parsing is done in accordance to the StarLasu methodology i.e. a first-stage parser builds a parse tree which
     * is then mapped onto a higher-level tree called the AST.
     * @param inputStream the source code.
     * @param considerPosition if true (the default), parsed AST nodes record their position in the input text.
     * @param measureLexingTime if true, the result will include a measurement of the time spent in lexing i.e. breaking
     * @param source the optional Source to associate to node positions.
     * the input stream into tokens.
     */
    parse(
        inputStream: string | CharStream, considerPosition?: boolean,
        measureLexingTime?: boolean, source?: Source
    ): ParsingResult<R>;
}
