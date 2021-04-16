import React from 'react';
import Row from "./Row";
import Settings from './lib/Settings';
import "./Board.css"
import { useSelector } from 'react-redux';
function Main() {

  const style = {
    width: Settings.grid_size * 8 + "px",
    height: Settings.grid_size * 8 + "px",
}
  const board = useSelector((state: State) => state.grid)

  return (
    <div className="ChessBoard">
      <header className="ChessBoard-header">
        <div className="chess-board" style={style}>
          {
            board.map((line, index_line) => {
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
