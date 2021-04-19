import Pawn from "./pieces/Pawn";
import { Grid } from "./types/Grid";

const StartBoard: Grid = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Pawn("l", { x: 0, y: 1 }), null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
]

export default StartBoard;