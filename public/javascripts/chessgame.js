const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPeice = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row , rowindex) => {
    row.forEach((square ,squareindex) => {
        const squareElement = document.createElement("div");
        squareElement.classList.add("square",(rowindex + squareindex) % 2 ===0 ? "light" :"dark" );

        squareElement.dataset.row = rowindex;
        squareElement.dataset.col = squareindex;

        if(square){
            const pieceElement = document.createElement("div");
            pieceElement.classList.add("piece",
            square.color === "w" ? "white" :"black"
            );  
            pieceElement.innerText = getPieceUnicode(square);
            pieceElement.draggable = playerRole === square.color;

            pieceElement.addEventListener("dragstart",(e) => {
                if(pieceElement.draggable){
                    draggedPeice = pieceElement;
                    sourceSquare = { row: rowindex, col: squareindex};
                    e.dataTransfer.setData("text/plain","")
                }
            });

            pieceElement.addEventListener("dragend",(e) => {
                draggedPeice = null;
                sourceSquare = null;
            });
            squareElement.appendChild(pieceElement);
        }
        squareElement.addEventListener("dragover",function(e){
            e.preventDefault();
        })
        squareElement.addEventListener("drop",(e)=> {
            e.preventDefault();
            if(draggedPeice){
                const targetSource = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col)
                };
                handleMove(sourceSquare,targetSource)
            }
        });
        boardElement.appendChild(squareElement);
    });
 });
if(playerRole === "b"){
    boardElement.classList.add("flipped");
}
else{
    boardElement.classList.remove("flipped");
}

};

const handleMove = (source, target) => {
    // Convert column index to file (letter) and row index to rank (number)
    const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
    const to = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;

    const move = {
        from: from,
        to: to,
        promotion: 'q', // Assuming default promotion to queen
    };

    socket.emit('move', move);
};

const getPieceUnicode = (piece)=> {
    const unicodePiece = {
        p: '♙', // White Pawn
        r: '♜', // Black Rook
        n: '♞', // Black Knight
        b: '♝', // Black Bishop
        q: '♛', // Black Queen
        k: '♚', // Black King
        P: '♟', // Black Pawn
        R: '♖', // White Rook
        N: '♘', // White Knight
        B: '♗', // White Bishop
        Q: '♕', // White Queen
        K: '♔', // White King
    };
    
    

    return unicodePiece[piece.type] || "";
} 

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard()
});

socket.on("spectatorRole",function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
})
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})

renderBoard();
