import Piece from "./Piece";

export default class Pawn extends Piece {
    constructor(color: Pawn_Color, position: Position) {
        super("pawn", color, position)
    }
    get possibleMoves(): Position[] {
        let r: Position[] = []
        if (this.color === "l")
            if (this.position.y + 1 < 8)
                r.push({ x: this.position.x, y: this.position.y + 1 });
        if (this.position.y === 1)
            r.push({ x: this.position.x, y: this.position.y + 2 });

        console.log("pawn moves : ", r)
        return r
    }
}
