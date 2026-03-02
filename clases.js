


//HTML ELEMENTS
const boardElement = document.getElementById('board');
const scoreBoard = document.getElementById('scoreBoard');
const startButton = document.getElementById('start');
const gameOverSign = document.getElementById('gameOver');


//SETTINGS
let directions;
const emptySquares = []
const squareTypes = {
    emptySquare: 0,
    snakeSquare:1,
    foodSquare:2
}


class Square{
    constructor(tipo=squareTypes.emptySquare,ubicacion){
        this.tipo = tipo
        this.ubicacion=ubicacion
    }

    //Cambiar tipo square
    drawNewSquare(type){
        this.tipo = squareTypes[type]
        const squareElement = document.getElementById(`${this.ubicacion.join('')}`)
        squareElement.setAttribute('class',`square ${type}`)

        if(type==='emptySquare'){
            emptySquares.push(`${this.ubicacion.join('')}`)
        }else{
            if(emptySquares.indexOf(`${this.ubicacion.join('')}`)){
                emptySquares.splice(emptySquares.indexOf(`${this.ubicacion.join('')}`),1)
            }
        }
    }

    drawNewSquare(){
        const squareElement = document.getElementById(`${this.ubicacion.join('')}`)
        squareElement.setAttribute('class',`square ${Object.keys(squareTypes).find(key=> squareTypes[key]===Number(this.tipo))}`)

        if(this.tipo==='emptySquare'){
            emptySquares.push(`${this.ubicacion.join('')}`)
        }else{
            if(emptySquares.indexOf(`${this.ubicacion.join('')}`)){
                emptySquares.splice(emptySquares.indexOf(`${this.ubicacion.join('')}`),1)
            }
        }
    }
}


class Board{
    constructor(size){
        this.size = size
        this.boardSquares = Array.from({length:size},
            (_,r)=>Array.from({length:size},(_,c)=>new Square(squareTypes.emptySquare,[r,c]))
        )
    }

    drawBoard(boardElement){
        let fragment = document.createDocumentFragment()
        this.boardSquares.forEach((row,rowIndex)=>{
            row.forEach((column,columIndex)=>{
                const squareValue = `${rowIndex}${columIndex}`
                const squareElement = document.createElement('div')
                squareElement.setAttribute('class','square emptySquare')
                squareElement.setAttribute('id',squareValue)
                fragment.appendChild(squareElement)
                emptySquares.push(squareValue)
            })
        })
        boardElement.appendChild(fragment)
    }

    isValidMove(coords, direction){
        const row = parseInt(coords[0])
        const col = parseInt(coords[1])

        //1. ¿Fuera de los limites?
        if(coords<0 || coords>= Math.pow(this.size,2)) return false;

        //2. Cruzo una pared lateral
        if(direction==='ArrowRight' && col===0) return false;
        if(direction==='ArrowLeft' && col === this.size-1) return false;

        //3. ¿Choco consigo misma?
        const square = this.boardSquares[row][col];
        if(square.tipo === squareTypes.snakeSquare) return false;

        return true;
    }
}


class Snake{
    constructor(body, direction){
        this.body=body
        this.direction=direction
    }

    init(){
        this.body.forEach(indexSquare =>{
            const square = new Square(squareTypes.snakeSquare,[indexSquare[0],indexSquare[1]])
            square.drawNewSquare()
        })
    }

    setDirection(direction){
        this.direction=direction
    }

    getNextHead(){
        const head = this.body[this.body.length -1];
        const nextPos = String(Number(head) + directions[this.direction]).padStart(2,'0');
        return nextPos
    }

    move(newHead, grow=false){
        this.body.push(newHead)
        if(!grow){
            return this.body.shift() //cola eliminada
        }
        return null; //Si crecio
    }
}

class food{

}

class Game{
    constructor(boardSize){
        this.board = new Board(boardSize)
        this.snake = new Snake(['00','01','02','03'],'ArrowRight')
        this.score = 0;
        this.emptySquares = []
        this.init(boardSize)
    }

    init(boardSize){
        //Creamos el tablero
        this.board.drawBoard(boardElement)
        directions ={
            ArrowUp: -boardSize,
            ArrowDown: boardSize,
            ArrowRight: 1,
            ArrowLeft: -1
        };
        this.snake.init()

        //Mover a la serpiente
        document.addEventListener('keydown',(ev)=>{
            switch(ev.code){
                case 'ArrowUp':
                    this.snake.direction != 'ArrowDown' && this.snake.setDirection(ev.code)
                    break;
                case 'ArrowDown':
                    this.snake.direction != 'ArrowUp' && this.snake.setDirection(ev.code)
                    break;
                case 'ArrowLeft':
                    this.snake.direction != 'ArrowRight' && this.snake.setDirection(ev.code)
                    break;
                case 'ArrowRight':
                    this.snake.direction != 'ArrowLeft' && this.snake.setDirection(ev.code)
                    break;
            }
        })

    }
}

startButton.addEventListener('click',()=>{
    const game = new Game(10)
})



