import Pawn from "./pieces/Pawn";
import { Grid } from "./types/Grid";

const StartBoard: Grid = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [{ piece: new Pawn("l", { x: 0, y: 1 }), hint: false }, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
].map(line => {
    return line.map(cell => {
        if (cell === null) {
            return {
                piece: null,
                hint: false
            };
        }
        return cell;
    });
})



export default StartBoard;