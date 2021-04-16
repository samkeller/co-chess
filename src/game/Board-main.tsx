import React, { useState } from 'react';
import Row from "./Row";
import Settings from './lib/Settings';
import "./Board.css"
import store from "../store/store";

function Main() {

  const style = {
    width: Settings.grid_size * 8 + "px",
    height: Settings.grid_size * 8 + "px",
  }

  const [board, setBoard] = useState(store.getState().grid)
  // Trick for re-render
  const [renderKey, setrenderKey] = useState(0)

  store.subscribe(() => {
    setBoard(store.getState().grid)
    setrenderKey(renderKey + 1)
  })

  return (
    <div className="ChessBoard" key={renderKey}>
      <header className="ChessBoard-header">
        <div className="chess-board" style={style}>
          {
            board.map((line, index_line_Y) => {
              return (
                <Row key={7 - index_line_Y} data={{ line, index_line_Y: 7 - index_line_Y }} />
              )
            })
          }
        </div>
      </header>
    </div>
  );
}

export default Main;
