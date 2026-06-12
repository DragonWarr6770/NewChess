let board = null;
const game = new Chess();
const aiEngine = new jsChessEngine.Game(); // Native embedded AI

const $status = $('#game-status');
const $pgn = $('#pgn-log');

function makeAIMove() {
    if (game.game_over()) return;

    // The AI reads the current position and calculates the best response instantly
    const aiMove = jsChessEngine.aiMove(game.fen(), 2); // Level 2 difficulty
    
    const fromSquare = Object.keys(aiMove)[0].toLowerCase();
    const toSquare = aiMove[Object.keys(aiMove)[0]].toLowerCase();

    // Apply the move to chess.js rules validation
    game.move({
        from: fromSquare,
        to: toSquare,
        promotion: 'q'
    });

    // Sync up the visual board animation
    board.position(game.fen());
    updateDashboardState();
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;

    // Player can only drag White pieces
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop(source, target) {
    // Check if the user's move is legal
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateDashboardState();
    
    // Trigger the AI move after a brief delay
    window.setTimeout(makeAIMove, 300);
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateDashboardState() {
    let statusText = 'Your Turn';

    if (game.in_checkmate()) {
        statusText = 'Game Over: Checkmate.';
    } else if (game.in_draw()) {
        statusText = 'Game Over: Match drawn.';
    } else if (game.in_check()) {
        statusText = 'Check!';
    }

    $status.text(statusText);
    
    // Format PGN history log
    let pgnHtml = game.pgn({ max_width: 5, newline_char: '<br>' });
    $pgn.html(pgnHtml || 'No moves made yet.');
    $pgn.scrollTop($pgn[0].scrollHeight);
}

const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('my-board', config);
updateDashboardState();

// Control Panel Action Wireframing
$('#btn-undo').on('click', () => {
    game.undo(); // Undo AI move
    game.undo(); // Undo Player move
    board.position(game.fen());
    updateDashboardState();
});

$('#btn-flip').on('click', () => {
    board.flip();
});

$('#btn-restart').on('click', () => {
    game.reset();
    board.start();
    updateDashboardState();
});

$(window).resize(board.resize);
