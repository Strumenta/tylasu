import {Issue, IssueSeverity, SOURCE_NODE_NOT_MAPPED} from "../src";
import i18next from 'i18next';
import {SYNTAX_ERROR} from "../src/parsing";
import {expect} from "chai";

describe('Issues', function() {
    it("can be translated",
        function () {
            i18next.init({
                lng: 'en', // if you're using a language detector, do not define the lng option
                debug: true,
                resources: {
                    en: {
                        translation: {
                            ast: {
                                transform: {
                                    sourceNotMapped: "Source node not mapped: {{type}}"
                                }
                            },
                            parser: {
                                syntaxError: "A syntax error occurred!"
                            }
                        }
                    }
                }
            });
            let issue = Issue.syntactic("Unexpected token: foo", IssueSeverity.ERROR, undefined, undefined, SYNTAX_ERROR);
            expect(i18next.t(issue.code!)).to.equal("A syntax error occurred!");
            issue = Issue.semantic("Node not mapped: SomeNode", IssueSeverity.ERROR, undefined, undefined,
                SOURCE_NODE_NOT_MAPPED,  [{ name: "nodeType", value: "SomeNode" }]);
            expect(i18next.t(issue.code!, { type: issue.args[0].value })).to.equal("Source node not mapped: SomeNode");
        });
});
