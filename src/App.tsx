import React, { useState } from 'react';
import ChessBoard from "./logic/ChessBoard"
import Square from "./Square";
import './App.css';

function App() {
  let [board] = useState(new ChessBoard())


  function getCustomSquare(index_line: number, index_column: number){
    const key = index_line + "-" + index_column
    const color = (index_column + index_line) % 2 ? "white" : "green"

        return <Square key={key} color={color} data={{index_line, index_column}}  />

  }
  return (
    <div className="App">
      <header className="App-header">
        <div className="chess-board">
          {
            board.board.map((line, index_line) => {
              return line.map((column, index_column) => (
                getCustomSquare(index_line, index_column)
              ))
            })
          }
        </div>
      </header>
    </div>
  );
}

export default App;
