import Piece from "../pieces/Piece";

interface SquareData {
    piece: Piece | null,
    hint: boolean
}

type Grid = Array<Array<SquareData>>;
