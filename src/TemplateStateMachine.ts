export enum TemplateState {
NORMAL_TEXT,
TRANSITIONS,
TRANSITION_SET,
STATES,
HANDLEBARS,
}

export class TemplateStateChangeEvent {
    _cancelled: boolean

    constructor(private _previousState: TemplateState,
                private _targetState: TemplateState,
                public data: any) {
    }

    get previousState() : TemplateState {
        return this._previousState
    }

    get targetState() : TemplateState {
        return this._targetState
    }

    cancel() {
        this._cancelled = true
    }
}

export type TransitionCallback = (event: TemplateStateChangeEvent) => any;
export type DataCallback = ((data: any) => TemplateState) | ((data: any) => void)

export interface CallbackRegistration {
    detach() : void
}

export class TemplateStateError extends Error {
}

const transitionSet : { [transitionId: number]: boolean } = {}
const linkMap : { 
    [fromStateId: number] : { 
        [transitionName: string] : number 
    } 
} = {}

registerTransition("startTransitions", TemplateState.NORMAL_TEXT, TemplateState.TRANSITIONS);
registerTransition("startTransitionSet", TemplateState.NORMAL_TEXT, TemplateState.TRANSITION_SET);
registerTransition("startStates", TemplateState.NORMAL_TEXT, TemplateState.STATES);
registerTransition("startHandlebars", TemplateState.NORMAL_TEXT, TemplateState.HANDLEBARS);
registerTransition("normalText", TemplateState.TRANSITIONS, TemplateState.NORMAL_TEXT);
registerTransition("normalText", TemplateState.TRANSITION_SET, TemplateState.NORMAL_TEXT);
registerTransition("normalText", TemplateState.STATES, TemplateState.NORMAL_TEXT);
registerTransition("normalText", TemplateState.HANDLEBARS, TemplateState.NORMAL_TEXT);

export class TemplateStateMachine {
    private currentState: TemplateState = null
    private initialState: TemplateState

    private currentChangeStateEvent: TemplateStateChangeEvent

    private transitionListeners: { [stateId: number] : EventListener<TransitionCallback> }  = {}
    private dataListeners: { [stateId: number] : EventListener<DataCallback> } = {}

    constructor(initialState? : TemplateState) {
        this.initialState = initialState || 0

this.transitionListeners[TemplateState.NORMAL_TEXT] = new EventListener<TransitionCallback>()
this.transitionListeners[TemplateState.TRANSITIONS] = new EventListener<TransitionCallback>()
this.transitionListeners[TemplateState.TRANSITION_SET] = new EventListener<TransitionCallback>()
this.transitionListeners[TemplateState.STATES] = new EventListener<TransitionCallback>()
this.transitionListeners[TemplateState.HANDLEBARS] = new EventListener<TransitionCallback>()
this.dataListeners[TemplateState.NORMAL_TEXT] = new EventListener<DataCallback>()
this.dataListeners[TemplateState.TRANSITIONS] = new EventListener<DataCallback>()
this.dataListeners[TemplateState.TRANSITION_SET] = new EventListener<DataCallback>()
this.dataListeners[TemplateState.STATES] = new EventListener<DataCallback>()
this.dataListeners[TemplateState.HANDLEBARS] = new EventListener<DataCallback>()
    }

    get state() { 
        this.ensureStateMachineInitialized()
        return this.currentState
    }

startTransitions(data?: any) : TemplateState { return this.transition("startTransitions", data); }
startTransitionSet(data?: any) : TemplateState { return this.transition("startTransitionSet", data); }
startStates(data?: any) : TemplateState { return this.transition("startStates", data); }
startHandlebars(data?: any) : TemplateState { return this.transition("startHandlebars", data); }
normalText(data?: any) : TemplateState { return this.transition("normalText", data); }

    private ensureStateMachineInitialized() {
        if (this.currentState == null) {
            this.changeStateImpl(this.initialState, null);
        }
    }

    changeState(targetState: TemplateState, data?: any) : TemplateState {
        this.ensureStateMachineInitialized()
        return this.changeStateImpl(targetState, data)
    }

    changeStateImpl(targetState: TemplateState, data?: any) : TemplateState {
        if (typeof targetState == 'undefined') {
            throw new Error('No target state specified. Can not change the state.')
        }

        const stateChangeEvent = new TemplateStateChangeEvent(this.currentState, targetState, data)

        if (this.currentChangeStateEvent) {
            throw new TemplateStateError(
                        `The TemplateStateMachine is already in a changeState (${this.currentChangeStateEvent.previousState} -> ${this.currentChangeStateEvent.targetState}). ` +
                        `Transitioning the state machine (${this.currentState} -> ${targetState}) in \`before\` events is not supported.`);
        }

        if (this.currentState != null && !transitionSet[this.currentState << 16 | targetState]) {
            console.error(`No transition exists between ${this.currentState} -> ${targetState}.`);
            console.error(new Error().stack)
            return this.currentState;
        }

        this.currentChangeStateEvent = stateChangeEvent

        if (stateChangeEvent.previousState != null) {
            this.transitionListeners[stateChangeEvent.previousState].fire(EventType.BEFORE_LEAVE, stateChangeEvent)
        }
        this.transitionListeners[stateChangeEvent.targetState].fire(EventType.BEFORE_ENTER, stateChangeEvent)

        if (stateChangeEvent._cancelled) {
            return this.currentState
        }

        this.currentState = targetState
        this.currentChangeStateEvent = null

        if (stateChangeEvent.previousState != null) {
            this.transitionListeners[stateChangeEvent.previousState].fire(EventType.AFTER_LEAVE, stateChangeEvent)
        }
        this.transitionListeners[stateChangeEvent.targetState].fire(EventType.AFTER_ENTER, stateChangeEvent)

        return this.currentState
    }

    transition(linkName: string, data? : any) : TemplateState {
        this.ensureStateMachineInitialized()

        const sourceState = linkMap[this.currentState]

        if (!sourceState) {
            return null
        }

        const targetState = sourceState[linkName]

        if (typeof targetState == 'undefined') {
            return null
        }

        return this.changeState(targetState, data)
    }

    beforeEnter(state: TemplateState, callback: TransitionCallback) {
        return this.transitionListeners[state].addListener(EventType.BEFORE_ENTER, callback)
    }

    afterEnter(state: TemplateState, callback: TransitionCallback) {
        return this.transitionListeners[state].addListener(EventType.AFTER_ENTER, callback)
    }

    beforeLeave(state: TemplateState, callback: TransitionCallback) {
        return this.transitionListeners[state].addListener(EventType.BEFORE_LEAVE, callback)
    }

    afterLeave(state: TemplateState, callback: TransitionCallback) {
        return this.transitionListeners[state].addListener(EventType.AFTER_LEAVE, callback)
    }

    onData(state: TemplateState, callback: DataCallback) {
        return this.dataListeners[state].addListener('data', callback)
    }

    sendData(data: any) : TemplateState {
        this.ensureStateMachineInitialized()
        const targetState = this.dataListeners[this.currentState].fire('data', data)

        if (targetState != null) {
            return this.changeState(targetState, data)
        }

        return this.currentState
    }
}

function registerTransition(name: string, fromState: TemplateState, toState: TemplateState) : void {
    transitionSet[fromState << 16 | toState] = true
    
    if (!name) {
        return
    }

    let fromMap = linkMap[fromState]
    if (!fromMap) {
        fromMap = linkMap[fromState] = {}
    }

    fromMap[name] = toState
}

const EventType = {
    BEFORE_ENTER : 'before-enter',
    BEFORE_LEAVE : 'before-leave',
    AFTER_LEAVE : 'after-leave',
    AFTER_ENTER : 'after-enter',
}

class EventListener<T extends Function> {
    registered : { [eventName: string] : Set<T> } = {}

    addListener(eventName: string, callback: T) : CallbackRegistration {
        let eventListeners = this.registered[eventName]
        
        if (!eventListeners) {
            eventListeners = this.registered[eventName] = new Set();
        }

        eventListeners.add(callback)

        return {
            detach() {
                eventListeners.delete(callback)
            }
        }
    }

    fire(eventName: string, ev: any) : any {
        if (!this.registered[eventName]) {
            return
        }

        let result

        this.registered[eventName].forEach(it => {
            try {
                const potentialResult = it.call(null, ev)
                if (typeof potentialResult !== 'undefined' && typeof result != 'undefined') {
                    throw new TemplateStateError(`Data is already returned.`)
                }

                result = potentialResult
            } catch (e) {
                if (e instanceof TemplateStateError) {
                    throw e
                }
            }
        })

        return result
    }
}
