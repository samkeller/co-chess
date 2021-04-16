import React from 'react';
import Settings from './lib/Settings';
import Square from './Square';

class Row extends React.Component<any, any> {
    line = this.props.data.line;
    index_line = this.props.data.index_line;

    getCustomSquare(index_line: number, index_column: number) {
        const key = index_line + "-" + index_column
        const color = (index_column + index_line) % 2 ? "white" : "green"

        return <Square key={key} color={color} data={{ index_line, index_column }} />

    }

    render() {
        return (
            this.line.map((column: any, index_column: number) => (
                this.getCustomSquare(this.index_line, index_column)
            ))
        )
    };
}

export default Row;
