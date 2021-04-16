

export default abstract class Piece {
    constructor(public name: string, public color: string){

    }

    get imgClass(){
        return this.color + this.name; 
    }
}