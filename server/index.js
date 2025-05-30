import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const games = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create_game', (gameId) => {
    games.set(gameId, {
      players: [socket.id],
      moves: [],
      currentPlayer: 'black'
    });
    socket.join(gameId);
    socket.emit('game_created', gameId);
  });

  socket.on('join_game', (gameId) => {
    const game = games.get(gameId);
    if (game && game.players.length < 2) {
      game.players.push(socket.id);
      socket.join(gameId);
      socket.emit('game_joined', gameId);
      io.to(gameId).emit('player_joined', socket.id);
    } else {
      socket.emit('game_full');
    }
  });

  socket.on('make_move', ({ gameId, move }) => {
    const game = games.get(gameId);
    if (game) {
      game.moves.push(move);
      game.currentPlayer = game.currentPlayer === 'black' ? 'white' : 'black';
      io.to(gameId).emit('move_made', move);
    }
  });

  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      if (game.players.includes(socket.id)) {
        game.players = game.players.filter(id => id !== socket.id);
        io.to(gameId).emit('player_left', socket.id);
        if (game.players.length === 0) {
          games.delete(gameId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});