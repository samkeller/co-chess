import React from 'react';
import Piece from './lib/pieces/Piece';
import Settings from './lib/Settings';

interface SquareProps {
    data: {
        piece: Piece | null;
        isHint: boolean;
        index_column_X: number;
        index_line_Y: number;
    };
    color: string;
}


function Square({ data, color }: SquareProps) {
    const { piece, isHint, index_column_X, index_line_Y } = data;

    const getPieceHTML = (piece: Piece) => (
        <div style={{ position: "absolute", ...style.piece }} >
            <span
                draggable="true"
                onDragStart={piece.onDragPieceEvent.bind(piece)}
                onDragEnd={piece.move.bind(piece)}
                style={style.pieceImg}
                className={piece.imgClass}
            ></span>
        </div>
    );

    const getHintHTML = () => (
        <div style={{ position: "absolute", ...style.piece }} >
            <span style={style.hint}></span>
        </div>
    );

    return (
        <div
            id={`x${index_column_X}-y${index_line_Y}`}
            className={color}
            style={{ float: "left", ...style.square }}>
            {piece !== null && getPieceHTML(piece)}
            {isHint && getHintHTML()}
        </div>
    );
};


const style: Record<string, React.CSSProperties> = {
    square: {
        width: Settings.grid_size,
        height: Settings.grid_size,
    },
    piece: {
        width: Settings.grid_size,
        height: Settings.grid_size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    pieceImg: {
        width: "60px",
        height: "60px",
    },
    hint: {
        width: "30px",
        height: "30px",
        backgroundColor: "grey",
        borderRadius: "50%"
    }
};

export default Square;
