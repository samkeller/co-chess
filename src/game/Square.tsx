import React from 'react';
import Piece from './lib/pieces/Piece';
import Settings from './lib/Settings';

class Square extends React.Component<any, any> {
    piece: Piece | null = this.props.data.piece;

    style = {
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
        }
    }

    getPieceHTML(piece: Piece) {
        return (
            <div style={{ position: "absolute", ...this.style.piece }} >
                <span draggable="true" onDragStart={piece.registerCoords.bind(piece)} onDragEnd={piece.move.bind(piece)} style={this.style.pieceImg} className={piece.imgClass}></span>
            </div>
        )
    }

    render() {

        return (
            <div
                id={"x" + this.props.data.index_column_X + '-y' + this.props.data.index_line_Y}
                className={this.props.color}
                style={{ float: "left", ...this.style.square }}>
                {this.piece !== null && (
                    this.getPieceHTML(this.piece)
                )}
            </div>
        )
    };
}

export default Square;
