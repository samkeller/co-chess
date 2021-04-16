import React from 'react';
import Settings from './lib/Settings';

class Square extends React.Component<any, any> {

    
    style = {
        width: Settings.grid_size,
        height: Settings.grid_size,
    }

    render() {
        return (
            <div className={this.props.color} style={{float: "left", ...this.style}}></div>
        )
    };
}

export default Square;
