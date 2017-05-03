import { red } from 'colors'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import klawSync = require('klaw-sync')

import { StateModel, readStateModel } from './model/State'

const fileName = process.argv[2]

if (!fileName) {
    console.error(red('You need to pass in a model to process. (yml file)'))
    process.exit(1)
}

/**
 * 
 * @param packageName The folder sub structure to create.
 */
function createPackageFolder(packageName: string) : string {
    console.log(`package: ${packageName}`)
    const folder = packageName.replace(/\./g, '/')
    mkdirp.sync(folder)

    return folder
}

const model = readStateModel(fileName)

console.log(`Dirname is ${__dirname}`)

const targetFolder = path.join('.', createPackageFolder(model.package))
const templateFolder = path.resolve(path.join('.', __dirname, 'templates/java/'))

const TRANSITIONS_RE = /^\s*\/\/ BEGIN_TRANSITIONS:\s*(.*)\s*$/m
const TRANSITIONS_END_RE = /^\s*\/\/ END_TRANSITIONS\s*$/m

const STATES_RE = /^\s*\/\/ BEGIN_STATES:\s*(.*)\s*$/m
const STATES_END_RE = /^\s*\/\/ END_STATES\s*$/m

function replacePackageAndName(line: string) : string {
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
 */
function applyTemplate(templateFilePath, targetFolder, filePath) {
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
                        
                        resultContent.push(replacePackageAndName(transitionString))
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
                        
                        resultContent.push(replacePackageAndName(stateString))
                    })

                    stateReading = true

                    return
                }


                resultContent.push(replacePackageAndName(line))
            })

    let fileContent = resultContent.join('\n')

    fs.writeFileSync(targetFilePath, fileContent, {encoding: 'utf-8'})
}

klawSync(templateFolder, { nofile: true })
    .map(file => file.path.substring(templateFolder.length + 1))
    .forEach(folderPath => {
        folderPath = folderPath.replace(/Xyz/g, model.name)
        mkdirp.sync(path.join(targetFolder, folderPath))
    })


klawSync(templateFolder, { nodir: true })
    .map(file => file.path.substring(templateFolder.length + 1))
    .forEach(filePath => {
        applyTemplate(
            path.join(templateFolder, filePath),
            targetFolder,
            filePath
        );
    })

