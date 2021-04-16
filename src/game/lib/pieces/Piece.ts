

export default abstract class Piece {
    constructor(public name: string, public color: string, public position: Position){}

    get imgClass(){
        return this.color + this.name; 
    }

    move(e: React.DragEvent<HTMLDivElement>){
        console.log(e)
    }
}