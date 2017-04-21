import * as fs from 'fs'
import * as jsYaml from 'js-yaml'

export interface State {
  name: string
}

export interface Transition {
    startState: State
    endState: State
}

export interface StateModel {
  name: string
  package: string
  states: Array<State>
  transitions: Array<Transition>
}

/**
 * Read the state model from the yml file.
 * @param fileName the file to read
 */
export function readStateModel(fileName: string) : StateModel {
  const result = {
    name: 'Test',
    package: 'com.ciplogic.test',
    states: [],
    transitions: []
  }

  const content = fs.readFileSync(fileName, 'utf-8')
  const fileItems = jsYaml.load(content)

  if (!fileItems.name) {
    throw new Error('`name` property was not specified in the yml file.');
  }
  result.name = fileItems.name;

  if (!fileItems.package) {
    throw new Error('`package` property was not specified in the yml file.');
  }
  result.package = fileItems.package;

  if (!fileItems.states) {
    throw new Error('`states` property was not specified in the yml file.');
  }
  result.states = fileItems.states;

  function addTransition(startStateName, endStateName) {
    const startState = result.states[ result.states.indexOf(startStateName) ]
    const endState = result.states[result.states.indexOf(endStateName)];

    const transition : Transition = {
      startState,
      endState,
    }

    result.transitions.push(transition)
  }

  if (!fileItems.transitions) {
    throw new Error('`transitions` property was not specified in the yml file.');
  }
  Object.keys(fileItems.transitions).forEach((startStateName) => {
    if (typeof fileItems.transitions[startStateName] === 'string') {

      addTransition(startStateName, fileItems.transitions[startStateName])
      return
    }

    fileItems.transitions[startStateName].forEach((endStateName) => addTransition(startStateName, endStateName))
  })

  return result;
}