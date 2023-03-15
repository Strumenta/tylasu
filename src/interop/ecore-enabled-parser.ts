import {ASTNode} from "..";
import {Parser as ANTLRParser, ParserRuleContext} from "antlr4ts";
import {Parser} from "../parsing";
import {Resource} from "ecore";
import {THE_AST_EPACKAGE} from "./starlasu-v2-metamodel";
import {EcoreMetamodelSupport} from "./ecore";

/**
 * A parser that supports exporting AST's to EMF/Ecore.
 * In particular, this parser can generate the metamodel. We can then use toEObject(node) to translate a tree
 * into its EMF representation.
 */
export abstract class EcoreEnabledParser<R extends ASTNode, P extends ANTLRParser, C extends ParserRuleContext>
    extends Parser<R, P, C> implements EcoreMetamodelSupport {

    /**
     * Generates the metamodel. The standard Kolasu metamodel [EPackage][org.eclipse.emf.ecore.EPackage] is included.
     */
    generateMetamodel(resource: Resource, includingKolasuMetamodel = true): void {
        if (includingKolasuMetamodel) {
            resource.get("contents").add(THE_AST_EPACKAGE);
        }
        this.doGenerateMetamodel(resource);
    }

    /**
     * Implement this method to tell the parser how to generate the metamodel. See [MetamodelBuilder].
     */
    protected abstract doGenerateMetamodel(resource: Resource): void;
}
