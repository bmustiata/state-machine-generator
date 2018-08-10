import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as fs from 'fs'
import * as handlebars from 'handlebars'

import { TemplateState, TemplateStateMachine } from './TemplateStateMachine'

import { StateModel } from './Model'

const TRANSITIONS_RE = /^\s*\/\/ BEGIN_TRANSITIONS:\s*(.*)\s*$/m
const TRANSITIONS_END_RE = /^\s*\/\/ END_TRANSITIONS\s*$/m

const TRANSITION_SET_RE = /^\s*\/\/ BEGIN_TRANSITION_SET:\s*(.*)\s*$/m
const TRANSITION_SET_END_RE = /^\s*\/\/ END_TRANSITION_SET\s*$/m

const STATES_RE = /^\s*\/\/ BEGIN_STATES:\s*(.*)\s*$/m
const STATES_END_RE = /^\s*\/\/ END_STATES\s*$/m

const HANDLEBARS_RE =  /^(\s*)\/\/(\s*)BEGIN_HANDLEBARS\s*$/m
const HANDLEBARS_CONTENT = /^\s*\/\/(.*)$/m
const HANDLEBARS_END_RE = /^\s*\/\/\s*END_HANDLEBARS\s*$/m

const HANDLEBARS_SHARP_RE =  /^(\s*)#(\s*)BEGIN_HANDLEBARS\s*$/m
const HANDLEBARS_SHARP_CONTENT = /^\s*#(.*)$/m
const HANDLEBARS_SHARP_END_RE = /^\s*#\s*END_HANDLEBARS\s*$/m

handlebars.registerHelper('capitalize', (s: string) => {
    if (!s) {
        return s
    }

    return s.substr(0, 1).toUpperCase() + s.substr(1)
})

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

const BUNDLED_TEMPLATES = {
    java: true,
    ts: true,
    dot: true,
    asciidoctor: true,
    python: true,
}

export function isSimpleTemplate(name: string): boolean {
    return name in BUNDLED_TEMPLATES
}

function replacePackageAndName(line: string, model: StateModel) : string {
    line = line.replace(/Xyz/g, model.name)
    line = line.replace(/com\.ciplogic\.statemachine/g, model.package)

    return line
}

function dedent(line: string, 
                indent: string,
                spacing: number) : string {
    if (!line) {
        return ""
    }

    return indent + line.substr(spacing)
}

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
    const readStateMachine = new TemplateStateMachine()
    let templateSpacing : number = 0
    let templateIndent : string

    readStateMachine.onData(TemplateState.NORMAL_TEXT, (line) => {
        const transitionMatch = TRANSITIONS_RE.exec(line)
        if (transitionMatch) {
            const pattern = transitionMatch[1]
            readStateMachine.changeState(TemplateState.TRANSITIONS, pattern)

            return
        }

        const transitionSetMatch = TRANSITION_SET_RE.exec(line)
        if (transitionSetMatch) {
            const pattern = transitionSetMatch[1]
            readStateMachine.changeState(TemplateState.TRANSITION_SET, pattern)

            return
        }

        const statesMatch = STATES_RE.exec(line)
        if (statesMatch) {
            const pattern = statesMatch[1]
            readStateMachine.changeState(TemplateState.STATES, pattern)

            return
        }

        let m = HANDLEBARS_RE.exec(line)

        if (m) {
            templateIndent = m[1] ? m[1] : ""
            templateSpacing = m[2] ? m[2].length : 0
            return TemplateState.HANDLEBARS
        }

        m = HANDLEBARS_SHARP_RE.exec(line)

        if (m) {
            templateIndent = m[1] ? m[1] : ""
            templateSpacing = m[2] ? m[2].length : 0
            return TemplateState.HANDLEBARS_SHARP
        }

        resultContent.push(replacePackageAndName(line, model))
    })

    readStateMachine.onData(TemplateState.HANDLEBARS, (line) => {
        if (HANDLEBARS_END_RE.test(line)) {
            return TemplateState.NORMAL_TEXT
        }

        const handlebarsContentMatcher = HANDLEBARS_CONTENT.exec(line)

        if (!handlebarsContentMatcher) {
            console.log('Ignored non commented HBS line: ', line)
            return
        }

        const parsedText = replacePackageAndName(handlebarsContentMatcher[1], model)
        resultContent.push(dedent(parsedText, templateIndent, templateSpacing))
    })

    readStateMachine.onData(TemplateState.HANDLEBARS_SHARP, (line) => {
        if (HANDLEBARS_SHARP_END_RE.test(line)) {
            return TemplateState.NORMAL_TEXT
        }

        const handlebarsContentMatcher = HANDLEBARS_SHARP_CONTENT.exec(line)

        if (!handlebarsContentMatcher) {
            console.log('Ignored non commented HBS line: ', line)
            return
        }

        const parsedText = replacePackageAndName(handlebarsContentMatcher[1], model)
        resultContent.push(dedent(parsedText, templateIndent, templateSpacing))
    })

    readStateMachine.onData(TemplateState.STATES, (line) => {
        if (STATES_END_RE.test(line)) {
            return TemplateState.NORMAL_TEXT
        }
    })

    readStateMachine.onData(TemplateState.TRANSITIONS, (line) => {
        if (TRANSITIONS_END_RE.test(line)) {
            return TemplateState.NORMAL_TEXT
        }
    })

    readStateMachine.onData(TemplateState.TRANSITION_SET, (line) => {
        if (TRANSITION_SET_END_RE.test(line)) {
            return TemplateState.NORMAL_TEXT
        }
    })

    readStateMachine.afterEnter(TemplateState.TRANSITIONS, (ev) => {
        model.transitions.forEach(transition => {
            const pattern : string = ev.data
            const transitionString = pattern
                .replace(/TRANSITION_NAME/g, transition.name)
                .replace(/FROM_STATE/g, transition.startState)
                .replace(/TO_STATE/g, transition.endState)
            
            resultContent.push(replacePackageAndName(transitionString, model))
        })
    })

    readStateMachine.afterEnter(TemplateState.TRANSITION_SET, (ev) => {
        const pattern: string = ev.data
        model.transitionSet.forEach(transitionName => {
            const transitionString = pattern
                .replace(/TRANSITION_NAME/g, transitionName)
            
            resultContent.push(replacePackageAndName(transitionString, model))
        })
    })

    readStateMachine.afterEnter(TemplateState.STATES, (ev) => {
        model.states.forEach(state => {
            const pattern: string = ev.data
            const stateString = pattern.replace('STATE_NAME', state)
            
            resultContent.push(replacePackageAndName(stateString, model))
        })
    })

    let resultContent = []
    const content = fs.readFileSync(templateFilePath, 'utf-8')
                      .split(/\r?\n/g)
    content.forEach(data => readStateMachine.sendData(data))

    const finalTemplate = resultContent.join('\n')
    const contentFn = handlebars.compile(finalTemplate, {
        preventIndent: true
    })

    const renderedContent = contentFn(model)
    fs.writeFileSync(targetFilePath, renderedContent, {encoding: 'utf-8'})
}
