import React from 'react';
import Square from './Square';

class Row extends React.Component<any, any> {
    line = this.props.data.line;
    index_line_Y = this.props.data.index_line_Y;

    getCustomSquare(data: any, index_line_Y: number, index_column_X: number) {
        const key =  index_column_X + "-" + index_line_Y
        const color = (index_column_X + index_line_Y) % 2 ? "white" : "green"

        return <Square key={key} color={color} data={{piece: data, index_line_Y, index_column_X }} />

    }

    render() {
        return (
            this.line.map((data: any, index_column_X: number) => (
                this.getCustomSquare(data, this.index_line_Y, index_column_X)
            ))
        )
    };
}

export default Row;
