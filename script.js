var board = null;
var game = new Chess();

function onDragStart (source, piece, position, orientation) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop (source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';
    updateUI();
}

function onSnapEnd () {
    board.position(game.fen());
}

function updateUI() {
    // Update Status Text
    let status = game.turn() === 'w' ? "White to move" : "Black to move";
    if (game.in_checkmate()) status = "CHECKMATE";
    if (game.in_draw()) status = "DRAW";
    $('#status').text(status);

    // Update FEN
    $('#fen').text(game.fen());

    // Update Move List
    renderMoveList();
}

function renderMoveList() {
    const history = game.history();
    const $historyObj = $('#move-history');
    $historyObj.empty();

    for (let i = 0; i < history.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1] ? history[i + 1] : "";

        $historyObj.append(`
            <div class="move-row">
                <div class="move-num">${moveNum}.</div>
                <div class="move-val">${whiteMove}</div>
                <div class="move-val">${blackMove}</div>
            </div>
        `);
    }
    // Auto-scroll to bottom
    $historyObj.scrollTop($historyObj[0].scrollHeight);
}

function undoMove() {
    game.undo();
    board.position(game.fen());
    updateUI();
}

function resetGame() {
    game.reset();
    board.start();
    updateUI();
}

function copyFEN() {
    navigator.clipboard.writeText(game.fen());
    alert("FEN copied to clipboard");
}

board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
});

updateUI();