# state-machine-generator

Code generator for state machines.

Supports `java` and `ts` only, or user defined templates (just point to the folder).

## Sample Test Machine Definition

Save it as `awesome.yml`.

```yaml
name: Test
package: com.ciplogic.awesome
states:
  - DEFAULT
  - RUNNING
  - STOPPED
transitions:
  DEFAULT:
    run: RUNNING
    stop: STOPPED
  RUNNING:
    pause: DEFAULT
    stop: STOPPED
```

## Generating the State Machine Code

```sh
state-machine-generator java awesome.yml
```

This will generate a `TestStateMachine` that can transition across states from
`TestState`.

## Notes

The state machine generated is thread safe.

## User Templates

### name

Xyz will be replaced to the state machine name from the yml file.

### package

com.ciplogic.statemachine will be replaced to the package name from the yml
file.

### states

States will be replaced using the template after the `BEGIN_STATES:`, with one
entry per line, with `STATE_NAME` replaced as the actual value. What's between
`BEGIN` and `END` will be replaced.

For example this:

```java
public enum XyzState {
    // BEGIN_STATES: STATE_NAME,
    EXISTING,
    NOT_EXISTING,
    // END_STATES
}
```

will be replaced in the case of `awesome.yml` to:

```java
public enum XyzState {
DEFAULT,
RUNNING,
STOPPED,
}
```

### transitions

The same way as the _states_, transitions will be replaced using this template:

```java
// BEGIN_TRANSITIONS: this.registerTransition("TRANSITION_NAME", XyzState.FROM_STATE, XyzState.TO_STATE);
...
// END_TRANSITIONS
```

Of course, in here the `TRANSITION_NAME`, `FROM_STATE` and `TO_STATE` will be replaced using the values from the `transitions` sections from the yaml.

Transitions can also be accessed as only the set of names, for example to
generate methods that will do said transitions:

```java
// BEGIN_TRANSITION_SET: public XyzState TRANSITION_NAME() { return this.transition("TRANSITION_NAME"); }
...
// END_TRANSITION_SET
// BEGIN_TRANSITION_SET: public XyzState TRANSITION_NAME(Object data) { return this.transition("TRANSITION_NAME", data); }
...
// END_TRANSITION_SET
```

## Handlebars Support

From version `2.0.0`, it is also possible to have a handlebars template in.

```java
// BEGIN_HANDLEBARS
// {{#each transitions}}
// // {{name}}
// {{/each}}
// END_HANDLEBARS
```

Each line from the handlebars template must be prefixed by a comment.

### Model

The model data that is going to be sent to the template implements the `StateModel` 
interface shown below. All the properties in the `yml` file are copied in the
model that will be passed to the template.

```typescript
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
```

### capitalize Helper

This helper is passed into the handlebars engine, and capitalizes the string.