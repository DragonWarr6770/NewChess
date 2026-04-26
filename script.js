var board = null;
var game = new Chess();

// Theme: Using high-quality Wikipedia-style pieces
function pieceTheme (piece) {
  // This uses the official chessboardjs image repository
  return 'https://chessboardjs.com/img/chesspieces/wikipedia/' + piece + '.png';
}

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
    // 1. Update notation
    let history = game.history();
    let html = '';
    for (let i = 0; i < history.length; i += 2) {
        html += `<div class="move-row">
                    <div class="move-num">${Math.floor(i/2)+1}</div>
                    <div class="move-piece">${history[i]}</div>
                    <div class="move-piece">${history[i+1] || ''}</div>
                 </div>`;
    }
    $('#notation').html(html);
    $('#notation').scrollTop($('#notation')[0].scrollHeight);

    // 2. Update status info
    let status = game.turn() === 'w' ? "White's turn" : "Black's turn";
    if (game.in_check()) status += " (Check!)";
    if (game.in_checkmate()) status = "Checkmate!";
    $('#status-text').text(status);
}

// Global functions for buttons
function undo() { game.undo(); board.position(game.fen()); updateUI(); }
function reset() { game.reset(); board.start(); updateUI(); }
function copy() { navigator.clipboard.writeText(game.fen()); }

var config = {
  draggable: true,
  position: 'start',
  pieceTheme: pieceTheme, // This links the images
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

board = Chessboard('board', config);
updateUI();