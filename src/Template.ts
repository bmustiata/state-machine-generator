import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'


import { StateModel } from './Model'

const TRANSITIONS_RE = /^\s*\/\/ BEGIN_TRANSITIONS:\s*(.*)\s*$/m
const TRANSITIONS_END_RE = /^\s*\/\/ END_TRANSITIONS\s*$/m

const STATES_RE = /^\s*\/\/ BEGIN_STATES:\s*(.*)\s*$/m
const STATES_END_RE = /^\s*\/\/ END_STATES\s*$/m

/**
 * 
 * @param packageName The folder sub structure to create.
 */
export function createPackageFolder(packageName: string) : string {
    console.log(`package: ${packageName}`)
    const folder = packageName.replace(/\./g, '/')
    mkdirp.sync(folder)

    return folder
}

export function isSimpleTemplate(name: string) {
    return 'java' == name;
}

function replacePackageAndName(line: string, model: StateModel) : string {
    line = line.replace(/Xyz/g, model.name)
    line = line.replace(/com\.ciplogic\.statemachine/g, model.package)

    return line
}

let transitionsReading = false
let stateReading = false

/**
 * Write the template file.
 * @param templateFilePath The source template.
 * @param targetFilePath The target file to write.
 * @param filePath Internal path inside the template folder.
 * @param model
 */
export function applyTemplate(templateFilePath: string, 
                              targetFolder: string,
                              filePath: string, 
                              model: StateModel) {
    filePath = filePath.replace(/Xyz/g, model.name)
    
    const targetFilePath = path.join(targetFolder, filePath);

    let resultContent = []

    console.log(`Reading ${templateFilePath}`)

    fs.readFileSync(templateFilePath, 'utf-8')
            .split(/\r?\n/g)
            .forEach(line => {
                if (transitionsReading) {
                    if (TRANSITIONS_END_RE.test(line)) {
                        transitionsReading = false;
                    }

                    return; // ignore line
                }

                if (stateReading) {
                    if (STATES_END_RE.test(line)) {
                        stateReading = false
                    }

                    return; // also ingore line
                }

                const transitionMatch = TRANSITIONS_RE.exec(line)
                if (transitionMatch) {
                    const pattern = transitionMatch[1]
                    model.transitions.forEach(transition => {
                        const transitionString = pattern
                            .replace(/TRANSITION_NAME/g, transition.name)
                            .replace(/FROM_STATE/g, transition.startState)
                            .replace(/TO_STATE/g, transition.endState)
                        
                        resultContent.push(replacePackageAndName(transitionString, model))
                    })

                    transitionsReading = true

                    return
                }

                const stateMatch = STATES_RE.exec(line)
                if (stateMatch) {
                    const pattern = stateMatch[1]
                    model.states.forEach(state => {
                        const stateString = pattern
                            .replace('STATE_NAME', state)
                        
                        resultContent.push(replacePackageAndName(stateString, model))
                    })

                    stateReading = true

                    return
                }


                resultContent.push(replacePackageAndName(line, model))
            })

    let fileContent = resultContent.join('\n')

    fs.writeFileSync(targetFilePath, fileContent, {encoding: 'utf-8'})
}
