import React from 'react';
import Piece from './lib/pieces/Piece';
import Settings from './lib/Settings';

class Square extends React.Component<any, any> {
    piece: Piece | null = this.props.data.piece;
    isHint: boolean = this.props.data.isHint;


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
        },
        hint: {
            width: "30px",
            height: "30px",
            backgroundColor: "grey",
            borderRadius: "50%"
        }
    }

    getPieceHTML(piece: Piece) {
        return (
            <div style={{ position: "absolute", ...this.style.piece }} >
                <span
                    draggable="true"
                    onDragStart={piece.onDragPieceEvent.bind(piece)}
                    onDragEnd={piece.move.bind(piece)}
                    style={this.style.pieceImg}
                    className={piece.imgClass}
                ></span>
            </div>
        )
    }

    getHintHTML() {
        return (
            <div style={{ position: "absolute", ...this.style.piece }} >
                <span style={this.style.hint}></span>
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
                {this.isHint === true && (
                    this.getHintHTML()
                )}
            </div>
        )
    };
}

export default Square;
