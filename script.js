let board = null;
const game = new Chess();

// Initialize Local Engine Instance
const stockfish = typeof STOCKFISH === 'function' ? STOCKFISH() : null;

function prepareEngineMove() {
    if (game.game_over()) return;

    $('#status-text').text('Engine thinking...');
    
    if (stockfish) {
        stockfish.postMessage(`position fen ${game.fen()}`);
        stockfish.postMessage('go depth 10'); // Depth setting optimized for mobile calculation speeds
    }
}

if (stockfish) {
    stockfish.onmessage = function(event) {
        const message = event.data;
        
        // Listen for execution commands from evaluation loops
        if (message.startsWith('info depth')) {
            const parts = message.split(' ');
            const scoreIndex = parts.indexOf('score');
            if (scoreIndex !== -1) {
                const type = parts[scoreIndex + 1]; // cp or mate
                const value = parts[scoreIndex + 2];
                let evalText = type === 'cp' ? (parseInt(value) / 100).toFixed(2) : 'Mate in ' + value;
                // Reverse evaluation perspective because Engine plays Black
                if (type === 'cp') evalText = (parseFloat(evalText) * -1).toFixed(2);
                $('#engine-status').text('Analysis: ' + (evalText >= 0 ? '+' : '') + evalText + ' (depth ' + parts[2] + ')');
            }
        }

        if (message.startsWith('bestmove')) {
            const bestMove = message.split(' ')[1];
            
            game.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : undefined
            });

            board.position(game.fen());
            refreshInterface();
        }
    };
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    // Human is strictly White
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    refreshInterface();
    window.setTimeout(prepareEngineMove, 250);
}

function onSnapEnd() {
    board.position(game.fen());
}

function refreshInterface() {
    let stateSummary = 'Your Turn';

    if (game.in_checkmake || game.in_checkmate()) {
        stateSummary = 'Game Over: Checkmate!';
    } else if (game.in_draw()) {
        stateSummary = 'Game Over: Draw matched.';
    } else if (game.in_check()) {
        stateSummary = 'Check!';
    }

    $('#status-text').text(stateSummary);
    
    // Clear and build clean modern look list logs
    let moves = game.history();
    let pgnHtml = '';
    for (let i = 0; i < moves.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = moves[i];
        const blackMove = moves[i + 1] || '';
        pgnHtml += `<div style="padding: 3px 0;"><b>${moveNum}.</b> ${whiteMove} ${blackMove}</div>`;
    }
    
    $('#notation').html(pgnHtml || 'No moves made yet.');
    $('#notation').scrollTop($('#notation')[0].scrollHeight);
}

// Instantiate Layout Configuration Hooks
const layoutConfig = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('board', layoutConfig);
refreshInterface();

// Global System Interaction Commands
function undo() {
    game.undo(); // Pull back computer
    game.undo(); // Pull back player
    board.position(game.fen());
    refreshInterface();
}

function resetGame() {
    game.reset();
    board.start();
    refreshInterface();
    $('#engine-status').text('Stockfish Offline Engine Ready');
}

function copyFen() {
    navigator.clipboard.writeText(game.fen());
    alert('FEN string copied to clipboard!');
}

$(window).resize(board.resize);
