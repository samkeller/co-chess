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
            <div style={{ position: "absolute", ...this.style.piece }} onDragEnd={e => piece.move(e)}>
                <span style={this.style.pieceImg} className={piece.imgClass}></span>
            </div>
        )
    }

    render() {
        return (
            <div className={this.props.color} style={{ float: "left", ...this.style.square }}>
                {this.piece !== null && (
                    this.getPieceHTML(this.piece)
                )}
            </div>
        )
    };
}

export default Square;
