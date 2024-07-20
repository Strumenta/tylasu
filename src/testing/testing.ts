import {Node} from "../model/model";
import {strictEqual,deepStrictEqual,fail} from "node:assert";

export function assertASTsAreEqual(
    expected: Node,
    actual: Node,
    context = "<root>",
    considerPosition = false
): void {
    if (areSameType(expected, actual)) {
        if (considerPosition) {
            deepStrictEqual(actual.position, expected.position, `${context}.position`);
        }
        expected.features.forEach(expectedProperty => {
            const actualPropValue = actual.features.find(p => p.name == expectedProperty.name)!.value;
            const expectedPropValue = expectedProperty.value;

            if (actualPropValue instanceof Node && expectedPropValue instanceof Node) {
                assertASTsAreEqual(
                    expectedPropValue as Node,
                    actualPropValue as Node,
                    `${context}.${expectedProperty.name}`,
                    considerPosition
                );
            }
            else if (Array.isArray(actualPropValue) && Array.isArray(expectedPropValue)) {
                strictEqual(
                    actualPropValue.length,
                    expectedPropValue.length,
                    `${context}, property ${expectedProperty.name} has length ${expectedPropValue.length}, but found ${actualPropValue.length}`
                );
                for (let i = 0; i < expectedPropValue.length; i++) {
                    const expectedElement = expectedPropValue[i];
                    const actualElement = actualPropValue[i];

                    if (expectedElement instanceof Node && actualElement instanceof Node) {
                        assertASTsAreEqual(
                            expectedElement as Node,
                            actualElement as Node,
                            `${context}.${expectedProperty.name}[${i}]`,
                            considerPosition
                        );
                    }
                    else if (typeof expectedElement != "object" && typeof actualElement != "object") {
                        strictEqual(
                            actualElement,
                            expectedElement,
                            `${context}, property ${expectedProperty.name}[${i}] is ${expectedPropValue[i]}, but found ${actualPropValue[i]}`,
                        );
                    }
                }
            }
            else {
                strictEqual(
                    actualPropValue,
                    expectedPropValue,
                    `${context}, property ${expectedProperty.name} is '${expectedPropValue}', but found '${actualPropValue}'`
                );
            }
        });
    }
    else {
        fail(`${context}: nodes are not of the same type`);
    }
}

function areSameType(a, b) : boolean {
    return typeof a == 'object' &&
        typeof a == typeof b &&
        Object.getPrototypeOf(a) === Object.getPrototypeOf(b);
}
