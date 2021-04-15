import React from 'react';
import Settings from './logic/lib/Settings';

class Square extends React.Component<any, any> {

    
    style = {
        width: Settings.grid_size,
        height: Settings.grid_size,
        backgroundColor: this.props.color,
        left: this.props.data.index_line * Settings.grid_size,
        top: this.props.data.index_column * Settings.grid_size
    }

    render() {
        console.log(Settings.grid_size);

        return (
            <div style={{position: "absolute" ,...this.style}}></div>
        )
    };
}

export default Square;
