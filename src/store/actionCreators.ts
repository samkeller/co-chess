import * as actionTypes from "./actionTypes"

export function changeGrid(grid: Grid) {
    const action = {
        type: actionTypes.CHANGE_GRID,
        payload: {grid}
    }
    return dispatch(action)
}

export function dispatch(action: Action) {
    return (dispatch: DispatchType) => {
        dispatch(action)
    }
}