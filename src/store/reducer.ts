import StartBoard from "../game/lib/StartBoard"
import * as actionTypes from "./actionTypes"

const initialState: State = {
  grid: StartBoard,
}

const reducer = (
  state = initialState,
  action: Action
): State => {
  console.log(`[STORE] : Firing event ${action.type}`);

  switch (action.type) {
    case actionTypes.CHANGE_GRID:
      if (action.payload && action.payload.grid)
        state.grid = [...action.payload.grid]
      return {
        ...state,
      }
  }
  return state
}

export default reducer