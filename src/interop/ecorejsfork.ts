import * as Ecore from "ecore/dist/ecore";
import {Resource, ResourceSet} from "ecore";
import {expect} from "chai";

function isString(element) : boolean {
    return typeof element === "string";
}

// export function tester(resource: Resource) {
//     const javaast = resource.eContents().find((r)=>r.get("name") === "com.strumenta.javaast");
//     if (javaast == null) {
//         console.log("javaast not found");
//         return;
//     }
//     expect(javaast.eClass.get("name")).to.eql("EPackage");
//     expect(javaast.eContents().length).to.eql(31);
//     const jCompilationUnit = javaast.eContents()[30];
//     expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
//     expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
//     expect(jCompilationUnit.eContents().length).to.eql(1);
//     const declarations = jCompilationUnit.eContents()[0];
//     expect(declarations.eClass.get("name")).to.eql("EReference");
//     expect(declarations.get("name")).to.eql("declarations");
//     expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
//     console.log("tested ok")
// }

export function resourceParse(model, data) {
    if (isString(data)) {
        data = JSON.parse(data);
    }
    //tester(model);

    const toResolve : any[] = [];
    const resourceSet = model.get('resourceSet') || Ecore.ResourceSet.create();

    function processFeature(object, eObject) {
        if (!object || !eObject)
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return function() : void {};

        return function( feature ) {
            if (!feature || feature.get('derived')) return;

            const featureName = feature.get('name'),
                value = object[featureName];

            if (typeof value !== 'undefined') {
                if ( feature.isTypeOf('EAttribute') ) {
                    eObject.set( featureName, value );
                } else if (feature.get('containment')) {
                    const eType = feature.get('eType');
                    if (feature.get('upperBound') === 1) {
                        eObject.set( featureName, parseObject(value, eType) );
                    } else {
                        (value || []).forEach( function(val) {
                            eObject.get( featureName ).add( parseObject(val, eType) );
                        });
                    }
                } else {
                    toResolve.push({ parent: eObject, feature: feature, value: value });
                }
            }
        };
    }

    function processAnnotation(node, eObject) {
        if (node.source) {
            eObject.set('source', node.source);
        }

        if (node.details) {
            if (!Array.isArray(node.details)) {
                const details = eObject.get('details');
                node.details.forEach(function(v, k) {
                    details.add(Ecore.EStringToStringMapEntry.create({ 'key': k, 'value': v }));
                });
            }
        }
    }

    function resolveReferences() {
        const index = buildIndex(model);
// model.eContainer.get("resources").indexOf(model)
        function setReference(parent, feature, value, isMany) {
            const ref = value.$ref;
            let resolved = index[ref];

            if (!resolved) {
                resolved = resourceSetGetEObject(ref, parent.eResource()?.eContainer);
                if (!resolved) {
                    throw new Error(`UNRESOLVED ${parent.get("name") || parent} feature ${feature.get("name")} value ${JSON.stringify(value)}`);
                }
            }

            if (resolved) {
                if (isMany) {
                    parent.get(feature.get('name')).add(resolved);
                } else {
                    parent.set(feature.get('name'), resolved);
                }
            }
        }

        toResolve.forEach(function(resolving) {
            const parent = resolving.parent,
                feature = resolving.feature,
                value = resolving.value;

            if (feature.get('upperBound') === 1) {
                setReference(parent, feature, value, false);
            } else {
                const toIterate = Array.isArray(value) ? value : [value];
                toIterate.forEach(function(val) {
                    setReference(parent, feature, val, true);
                });
            }
        });
    }

    function parseObject(object, eClass?) {
        let child;

        if (object && (eClass || object.eClass)) {
            if (object.eClass) {
                eClass = resourceSet.getEObject(object.eClass);
            }

            try {
                child = Ecore.create(eClass);
            } catch (e) {
                throw new Error('Cannot parse or cannot find EClass for object' + JSON.stringify(object));
            }

            if (child) {
                if (object._id) {
                    child._id = object._id;
                }

                if (eClass === Ecore.EAnnotation) {
                    processAnnotation(object, child);
                } else {
                    eClass.get('eAllStructuralFeatures').forEach(processFeature(object, child));
                }
            }
        }

        return child;
    }

    if (Array.isArray(data)) {
        data.forEach(function (object) {
            model.add(parseObject(object));
        });
    } else {
        model.add(parseObject(data));
    }

    resolveReferences();
}

// Build index of EObjects contained in a Resource.
//
// The index keys are the EObject's fragment identifier, the
// values are the EObjects.
//

function buildIndex(model) {
    const index = {},
        contents = model.get('contents').array();

    if (contents.length) {
        const build = function(object, idx) {
            const eContents = object.eContents();
            index[idx] = object;

            eContents.forEach(function(e) { build(e, e.fragment()); });
        };

        let root, iD;
        if (contents.length === 1) {
            root = contents[0];
            if (root._id) {
                build(root, root._id);
            } else {
                iD = root.eClass.get('eIDAttribute') || null;
                if (iD) {
                    build(root, root.get(iD.get('name')));
                } else {
                    build(root, '/');
                }
            }
        } else {
            for (let i = 0; i < contents.length; i++) {
                root = contents[i];
                if (root._id) {
                    build(root, root._id);
                } else {
                    iD = root.eClass.get('eIDAttribute') || null;
                    if (iD) {
                        build(root, root.get(iD.get('name')));
                    } else {
                        build(root, '/' + i);
                    }
                }
            }
        }
    }

    return index;
}

function resourceSetGetEObject(uri: string, resourceSet: ResourceSet) : any {
    const split = uri.split('#'),
        base = split[0],
        fragment = split[1];
    let resource;

    if (!fragment) {
        return null;
    }

    const ePackage = Ecore.EPackage.Registry.getEPackage(base);

    if (ePackage) {

        resource = ePackage.eResource();

        if (!resource) {
            resource = this.create({ uri: base });
            resource.add(ePackage);
            this.get('resources').add(resource);
            resource.set('resourceSet', this);
        }
    } else {
        throw new Error(`EPackage not found: ${base}`)
    }

    if (resource) {
        const result2 = resourceGetEObject(fragment, resource);
        return result2;
    }

    // resource = this.get('resources').find(function(e) {
    //     return e.get('uri') === base;
    // });

    const result = resource ? resource.getEObject(fragment) : null;
    return result;
}
export function resourceGetEObject(fragment: string, resource: Resource) : any {
    if (!fragment) return null;

    const result = resourceIndex(resource)[fragment];
    return result;
    // if(resourceIndex(resource)[fragment]) {
    //     return resourceIndex(resource)[fragment];
    // }
}
function resourceIndex(resource: Resource) {
    // if (_.isUndefined(this.__updateIndex)) {
    //     var res = this;
    //     res.__updateIndex = true;
    //     res.on('add remove', function() {
    //         res.__updateIndex = true;
    //     })
    // }
    //
    // if (this.__updateIndex) {
    //     this.__index = buildIndex(this);
    //     this.__updateIndex = false;
    // }

    return buildIndex(resource);
}