import Pawn from "./pieces/Pawn";

const StartBoard = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Pawn("d", {x: 0, y: 1}), null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
]

export default StartBoard;