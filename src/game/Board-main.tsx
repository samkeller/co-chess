import React, { useState } from 'react';
import ChessBoard from "./logic/ChessBoard"
import Row from "./Row";
import Settings from './lib/Settings';
import "./Board.css"
function Main() {

  const style = {
    width: Settings.grid_size * 8 + "px",
    height: Settings.grid_size * 8 + "px",
}
  let [board] = useState(new ChessBoard())

  return (
    <div className="ChessBoard">
      <header className="ChessBoard-header">
        <div className="chess-board" style={style}>
          {
            board.board.map((line, index_line) => {
              return (
                  <Row key={index_line} data={{line, index_line}} />
              )
            })
          }
        </div>
      </header>
    </div>
  );
}

export default Main;
