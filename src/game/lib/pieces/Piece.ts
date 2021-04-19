import store from "../../../store/store"
import * as actionTypes from "../../../store/actionTypes"
import Settings from "../Settings";


export default abstract class Piece {

    protected htmlPositions: Position = { x: 0, y: 0 };

    constructor(public name: string, public color: Pawn_Color, public position: Position) { }

    get possibleMoves(): Position[] {
        return [];
    }

    get imgClass() {
        return this.color + this.name;
    }

    onDragPieceEvent(e: React.DragEvent<HTMLDivElement>) {
        if (e === undefined)
            return;

        this.htmlPositions = { x: e.clientX, y: e.clientY }
        // this.showHints();
    }

    

    move(e: React.DragEvent<HTMLDivElement>) {
        console.log("trying to move");
        
        const nextCoords: Position = this.getNextPosition(this.htmlPositions, { x: e.clientX, y: e.clientY });

        // TODO: Success/fail
        let board = store.getState().grid;

        const actualCoords = this.toArrayCoords(this.position);
        board[actualCoords.x][actualCoords.y] = null;
        // Resetting hints BEFORE moving.
        // this.hideHints();

        this.position = nextCoords;
        const nextArrayCoords = this.toArrayCoords(nextCoords);
        board[nextArrayCoords.x][nextArrayCoords.y] = this;


        store.dispatch({ type: actionTypes.CHANGE_GRID, payload: { grid: board } })
    }

    /**
     * Renvoie la position (dans la grille) depuis deux positions x,y en HTML
     * @param from HTML Position
     * @param to HTML Position
     * @returns grid Position
     */
    getNextPosition(from: Position, to: Position): Position {
        return {
            x: this.position.x + Math.floor((to.x - from.x) / Settings.grid_size + 0.5),
            y: this.position.y - Math.floor((to.y - from.y) / Settings.grid_size + 0.5)
        };
    }

    /**
     * Array and html doesnt works in the same way, X/Y are inversed and we prefer to work in legacy x y axis (that's for the -7)
     * @param coords 
     * @returns 
     */
    toArrayCoords(coords: Position) {
        return { x: 7 - coords.y, y: coords.x }
    }


    // public showHints() {
    //     let board = store.getState().grid;

    //     for (const move of this.possibleMoves) {
    //         let gridCoords = this.toArrayCoords(move);
    //         board[gridCoords.x][gridCoords.y] = true;
    //     }

    //     store.dispatch({ type: actionTypes.CHANGE_GRID, payload: { grid: board } })
    // }

    // private hideHints(){
    //     let board = store.getState().grid;

    //     for (const move of this.possibleMoves) {
    //         let gridCoords = this.toArrayCoords(move);
    //         board[gridCoords.x][gridCoords.y].hint = false;
    //     }

    //     store.dispatch({ type: actionTypes.CHANGE_GRID, payload: { grid: board } })
    // }
}