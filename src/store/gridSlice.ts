import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import StartBoard from '../game/lib/StartBoard'
import { Grid } from '../game/lib/types/Grid'

interface GridState {
    grid: Grid
    hints_grid: HintsGrid
}

const initialState: GridState = {
    grid: StartBoard,
    hints_grid: [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
    ]
}

const gridSlice = createSlice({
    name: 'grid',
    initialState,
    reducers: {
        changeGrid(state, action: PayloadAction<Grid>) {
            state.grid = action.payload
        },
        // Ajoute ici d'autres reducers si besoin (movePiece, fetchGrid, etc.)
    }
})

export const { changeGrid } = gridSlice.actions
export default gridSlice.reducer