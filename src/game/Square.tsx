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

    render() {
        console.log(this.piece);

        return (
            <div className={this.props.color} style={{ float: "left", ...this.style.square }}>
                {this.piece !== null && (
                    <div style={{ position: "absolute", ...this.style.piece }} >
                        <span style={this.style.pieceImg} className={this.piece.imgClass}></span>
                    </div>
                )}
            </div>
        )
    };
}

export default Square;
