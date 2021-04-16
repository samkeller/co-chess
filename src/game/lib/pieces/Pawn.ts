import IPiece from "../types/Ipiece";
import Piece from "./Piece";

export default class Pawn extends Piece implements IPiece {
    constructor(color: Pawn_Color, position: Position){
        super("pawn", color, position)
    }
    getPossibleMoves(): Position[] {
        let r: Position[] = []

        r.push({x: this.position.x, y: this.position.y++});

        return r
    }

}
