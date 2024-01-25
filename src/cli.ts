#!/usr/bin/env node

import {command, run, restPositionals} from 'cmd-ts';
import { File } from 'cmd-ts/dist/cjs/batteries/fs';
import * as Ecore from "ecore/dist/ecore";
import * as fs from "fs";
import {generateASTClasses, SYMBOL_CLASS_DEFINITION} from "./interop/ecore";

const cmd = command({
    name: 'generate-classes',
    description: 'Generates TypeScript AST classes from an Ecore metamodel',
    version: '0.2.0',
    args: {
        metamodel: restPositionals({
            type: File,
            displayName: 'metamodel',
            description: "the path to the metamodel file in emfjson format" }),
    },
    handler: args => {
        const resourceSet = Ecore.ResourceSet.create();
        let output = "import {ASTNode, Child, Children, Node, Property} from '@strumenta/tylasu';\n";
        let error = undefined;
        args.metamodel.forEach(mm => {
            const resource = resourceSet.create({ uri: 'file:' + mm });
            const buffer = fs.readFileSync(mm);
            resource.load(buffer.toString(), (r, e) => {
                if(e) {
                    error = e;
                    console.error(e);
                } else {
                    //TODO multiple ePackages in multiple files?
                    //TODO multiple strategies (one-class-per-file, one-package-per-file)?
                    const ePackage = r.get("contents").at(0);
                    if(!ePackage.get("nsURI")) {
                        ePackage.set("nsURI", "");
                    }
                    Ecore.EPackage.Registry.register(ePackage);
                    const pkg = generateASTClasses(ePackage);
                    for (const k in pkg.nodes) {
                        output += "\n" + pkg.nodes[k][SYMBOL_CLASS_DEFINITION] + "\n";
                    }
                }
            });
        });
        if(!error) {
            console.log(output);
        }
    },
});

run(cmd, process.argv.slice(2));
