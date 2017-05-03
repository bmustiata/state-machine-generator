# state-machine-generator

Code generator for state machines.

Supports `java` only, or user defined templates (just point to the folder).

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

Xyz will be replaced to the state machine name from the yml file.
com.ciplogic.statemachine will be replaced to the package name from the yml
file.

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
