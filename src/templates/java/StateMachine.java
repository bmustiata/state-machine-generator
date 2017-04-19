
public class StateMachine {
    private int[][] transitionTable;

    private volatile State currentState;

    public void transition(State fromState, State endState) {
        if (fromState == null) {
            throw new NullPointerException("fromState is null. Can not transition.");
        }

        if (endState == null) {
            throw new NullPointerException("endState is null. Can not transition.");
        }

        if (transitionTable[fromState.index][endState.index] == 0) {
            throw new IllegalArgumentException(String.format(
                "No transition exists between %s -> %s.",
                fromState.name(),
                endState.name()
            ));
        }
    }
}