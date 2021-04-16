
type State = {
    grid: Array<Array<Piece | null>>
}

type Action = {
    type: string,
    payload: null | {grid: Grid}
}

type DispatchType = (args: Action) => Action
