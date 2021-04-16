import Piece from "../lib/pieces/Piece";
import StartBoard from "../lib/StartBoard"

export default class ChessBoard{

    constructor(public board: Array<Array<Piece | null>> = StartBoard){}
   
}