const crypto = require('crypto');

class Mines {
  constructor() {
    this.BOARD_SIZE = 25;
  }

  generateRandomSeed() {
    return crypto.randomBytes(16).toString("hex");
  }

  getCombinedSeed(serverSeed, clientSeed, nonce) {
    return `${serverSeed}-${clientSeed}-${nonce}`;
  }

  createPRNG(seed) {
    let index = 0;
    return function () {
      const number = parseInt(seed.slice(index, index + 2), 16) / 256;
      index = (index + 2) % 64;
      return number;
    };
  }

  createGridFromArray(items) {
    let grid = [];
    for (let i = 0; i < Math.sqrt(this.BOARD_SIZE); i++) {
      const row = items.slice(i * Math.sqrt(this.BOARD_SIZE), i * Math.sqrt(this.BOARD_SIZE) + Math.sqrt(this.BOARD_SIZE));
      grid.push(row);
    }
    return grid;
  }

  shuffleBoard(arr, PRNG, amountOfTimes) {
    for (let i = 0; i < amountOfTimes; i++) {
      for (let j = arr.length - 1; j > 0; j--) {
        const k = Math.floor(PRNG() * (j + 1));
        [arr[j], arr[k]] = [arr[k], arr[j]];
      }
    }
  }

  createBoard(clientSeed, serverSeed, nonce, betAmount, mineCount) {
    const hash = crypto.createHmac("sha256", this.getCombinedSeed(serverSeed, clientSeed, nonce)).digest("hex");
    const arr = [];
    const PRNG = this.createPRNG(hash);

    // Initialize the board with all diamonds
    for (let i = 0; i < this.BOARD_SIZE - mineCount; i++) {
      arr.push('diamond');
    }

    // Place mines randomly on the board
    for (let i = 0; i < mineCount; i++) {
      let index = Math.floor(PRNG() * (this.BOARD_SIZE - i));
      if (arr[index] === 'mine') {
        // If the position already has a mine, find the next empty position
        while (arr[index] === 'mine') {
          index = (index + 1) % this.BOARD_SIZE;
        }
      }
      arr.splice(index, 0, 'mine');
    }

    return { grid: this.createGridFromArray(arr), betAmount };
  }



  logMinesPositions(board) {
    const positions = [];
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === 'mine') {
          positions.push(`(${x + 1},${y + 1})`);
        }
      }
    }
    console.log("Positions of Mines:", positions.join(", "));
  }
}

module.exports = Mines;