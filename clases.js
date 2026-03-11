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
        this.ubicacion=ubicacion //Array [row,column]
    }

    //Cambiar tipo square
    updateType(type){
        this.tipo = squareTypes[type]
        const id = this.ubicacion.join('');
        const element = document.getElementById(id);

        if(element){
            element.className = `square ${type}`
        }

        if(type==='emptySquare'){
            if(!emptySquares.includes(id)) emptySquares.push(id);
        }else{
            const index = emptySquares.indexOf(id);
            if(index !== -1) emptySquares.splice(index,1)
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

    drawBoard(container){
        container.innerHTML = '';
        let fragment = document.createDocumentFragment()
        this.boardSquares.forEach((row,rowIndex)=>{
            row.forEach((column,columIndex)=>{
                const squareElement = document.createElement('div')
                squareElement.className = 'square emptySquare';
                squareElement.setAttribute('id',`${rowIndex}${columIndex}`)
                fragment.appendChild(squareElement)
                emptySquares.push(`${rowIndex}${columIndex}`)
            })
        })
        container.appendChild(fragment)
    }

    getSquareAt(coords) {
        const r = parseInt(coords[0]);
        const c = parseInt(coords[1]);
        return this.boardSquares[r][c];
    }

    isValidMove(coords, direction){
        const row = parseInt(coords[0])
        const col = parseInt(coords[1])

        if (isNaN(row) || isNaN(col)) return false;

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
    constructor(body, direction,board){
        this.body=body
        this.direction=direction
        this.board = board
        this.body.forEach(pos =>{
            this.board.getSquareAt(pos).updateType('snakeSquare')
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
        this.board.getSquareAt(newHead).updateType('snakeSquare')
        if(!grow){
            const tailPos = this.body.shift()
            this.board.getSquareAt(tailPos).updateType('emptySquare')
        }
    }
}

class Food{
    constructor(board){
        this.board = board;
        this.position = null;
        this.spawn();
    }

    spawn(){
        const randomIndex = Math.floor(Math.random()*emptySquares.length)
        const newPos = emptySquares[randomIndex]

        this.position = newPos
        this.board.getSquareAt(newPos).updateType('foodSquare');
    }
}

class Game{
    constructor(boardSize,gameSpeed){
        this.boardSize = boardSize
        this.gameSpeed = gameSpeed
        this.board = new Board(boardSize)
        this.snake = null;
        this.food = null;
        this.score = 0;
        this.moveInterval = null;
    }

    init(){
        emptySquares.length=0;

        //Creamos el tablero
        this.board.drawBoard(boardElement)
        directions ={
            ArrowUp: -this.boardSize,
            ArrowDown: this.boardSize,
            ArrowRight: 1,
            ArrowLeft: -1
        };

        this.snake = new Snake(['00', '01', '02', '03'], 'ArrowRight', this.board);
        this.food = new Food(this.board);

        this.score = this.snake.body.length
        this.updateScoreUI();
        this.setupControls();

        if(this.moveInterval) clearInterval(this.moveInterval);
        this.moveInterval = setInterval(()=>this.gameLoop(), this.gameSpeed)
    }

    setupControls(){
        // Usamos una función con nombre para poder removerla si es necesario
        const handleKeyDown = (ev) => {
            const forbidden = {
                'ArrowUp': 'ArrowDown',
                'ArrowDown': 'ArrowUp',
                'ArrowLeft': 'ArrowRight',
                'ArrowRight': 'ArrowLeft'
            };
            if (directions[ev.code] && this.snake.direction !== forbidden[ev.code]) {
                this.snake.setDirection(ev.code);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    gameLoop(){
        const nextHead = this.snake.getNextHead();

        // Validar si el movimiento es posible
        if (!this.board.isValidMove(nextHead, this.snake.direction)) {
            this.gameOver();
            return;
        }

        // ¿Hay comida en la siguiente posición?
        const isFood = nextHead === this.food.position;

        if (isFood) {
            this.snake.move(nextHead, true); // Mueve y crece
            this.score++;
            this.updateScoreUI();
            this.food.spawn(); // Crea nueva comida
        } else {
            this.snake.move(nextHead, false); // Mueve normal
        }
    }

    updateScoreUI() {
        scoreBoard.innerText = this.score;
    }

    gameOver() {
        clearInterval(this.moveInterval);
        gameOverSign.style.display = 'block';
        startButton.disabled = false;
        console.log("Fin del juego. Puntuación:", this.score);
    }
}

startButton.addEventListener('click',()=>{
    gameOverSign.style.display = 'none'
    startButton.disabled=true;
    const game = new Game(10,200)
    game.init()
})



