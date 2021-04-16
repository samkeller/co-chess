import Piece from "./Piece";

export default class Pawn extends Piece {
    constructor(color: Pawn_Color){
        super("pawn", color)
    }

}
