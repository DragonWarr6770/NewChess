let board = null;
const game = new Chess();
const $status = $('#game-status');
const $eval = $('#engine-eval');
const $pgn = $('#pgn-log');

// Background Web Worker to manage AI logic cleanly without hanging UI
const stockfish = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');

function makeAIMove() {
    if (game.game_over()) return;

    // Send state array to engine
    stockfish.postMessage(`position fen ${game.fen()}`);
    // Configure thinking depth limit (higher depth = smarter but slower execution)
    stockfish.postMessage('go depth 12'); 
}

stockfish.onmessage = function(event) {
    const line = event.data;
    if (line.startsWith('bestmove')) {
        const moveRaw = line.split(' ')[1];
        
        // Execute calculated move paths
        game.move({
            from: moveRaw.substring(0, 2),
            to: moveRaw.substring(2, 4),
            promotion: moveRaw.length > 4 ? moveRaw.substring(4, 5) : undefined
        });

        board.position(game.fen());
        updateDashboardState();
    }
};

function onDragStart(source, piece, position, orientation) {
    // Prevent moving items if game is concluded
    if (game.game_over()) return false;

    // Direct movement tracking exclusively for player color constraints
    if ((orientation === 'white' && piece.search(/^w/) === -1) ||
        (orientation === 'black' && piece.search(/^b/) === -1)) {
        return false;
    }
}

function onDrop(source, target) {
    // Attempt validating parameters via strict movement engine rules
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Promotes to Queen automatically for simplified mobile workflow
    });

    // Reset snapback positioning if marked illegal
    if (move === null) return 'snapback';

    updateDashboardState();
    // Dispatch thread command trigger execution for engine response
    window.setTimeout(makeAIMove, 250);
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
    $pgn.html(game.pgn({ max_width: 5, newline_char: '<br>' }));
    $pgn.scrollTop($pgn[0].scrollHeight);
}

// System Hardware Setup Variables
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

// Control Node Element Listeners
$('#btn-undo').on('click', () => {
    game.undo(); // Remove AI move
    game.undo(); // Remove Player move
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

// Force canvas component redraw calculations on browser screen window snaps
$(window).resize(board.resize);