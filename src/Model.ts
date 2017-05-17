import * as fs from 'fs'
import * as jsYaml from 'js-yaml'

type State = string;

export interface Transition {
    name: string
    startState: State
    endState: State
}

export interface StateModel {
  name: string
  package: string
  states: Array<State>
  transitions: Array<Transition>
  transitionSet: Array<string>
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
    transitions: [],
    transitionSet: []
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

  console.log(`file transitions ${JSON.stringify(fileItems.transitions)}`);

  function addTransition(startStateName, transitionName) {
    const startState = result.states[ result.states.indexOf(startStateName) ]
    const endStateName = fileItems.transitions[startStateName][transitionName];
    const endState = result.states[ result.states.indexOf(endStateName) ];

    console.log(`${startStateName} -> ${endStateName} (${transitionName})`);

    const transition : Transition = {
      name: transitionName,      
      startState,
      endState,
    }

    result.transitions.push(transition)
  }

  if (!fileItems.transitions) {
    throw new Error('`transitions` property was not specified in the yml file.');
  }

  Object.keys(fileItems.transitions).forEach((startStateName) => {
    Object.keys(fileItems.transitions[startStateName]).forEach((transitionName) => {
      if (result.transitionSet.indexOf(transitionName) < 0) {
        result.transitionSet.push(transitionName)
      }
      addTransition(startStateName, transitionName);
    })
  })

  const finalResult : StateModel = {
    ...fileItems,
    ...result
  }

  console.log(`Item: ${JSON.stringify(finalResult)}`)

  return finalResult
}
