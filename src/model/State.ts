export class State {
  name: string
  description: string
}

export class Transition {
    startState: State
    endState: State
}
