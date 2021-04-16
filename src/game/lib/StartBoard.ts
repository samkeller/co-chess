import Pawn from "./pieces/Pawn";

const StartBoard = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Pawn("d", {x: 6, y: 0}), null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
]

export default StartBoard;