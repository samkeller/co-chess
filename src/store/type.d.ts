import { Grid } from "../game/lib/types/Grid"

type State = {
    grid: Grid,
    hints_grid: HintGrid
}

type Action = {
    type: string,
    payload: null | {grid: Grid}
}

type DispatchType = (args: Action) => Action
