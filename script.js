var board = null;
var game = new Chess();
var $status = $('#status');
var $pgn = $('#pgn');

function onDragStart (source, piece, position, orientation) {
  // Do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // Only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop (source, target) {
  // Check if move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Always promote to queen for simplicity
  });

  // If illegal, snap back
  if (move === null) return 'snapback';

  updateStatus();
}

// Update the board position after the piece snap
function onSnapEnd () {
  board.position(game.fen());
}

function updateStatus () {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position';
  } else {
    status = moveColor + ' to move';
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  $status.html(status);
  $pgn.html(game.pgn());
}

function resetGame() {
    game.reset();
    board.start();
    updateStatus();
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

board = Chessboard('board', config);

updateStatus();