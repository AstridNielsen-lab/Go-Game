import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

const servers = new Map();
const games = new Map();

app.get('/start-server', (req, res) => {
  const port = parseInt(req.query.port) || 3001;
  
  if (!servers.has(port)) {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

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

    const server = httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    
    servers.set(port, { server, io });
  }
  
  res.json({ status: 'Server started', port });
});

app.get('/stop-server', (req, res) => {
  const port = parseInt(req.query.port) || 3001;
  
  if (servers.has(port)) {
    const { server } = servers.get(port);
    server.close();
    servers.delete(port);
    res.json({ status: 'Server stopped', port });
  } else {
    res.status(404).json({ status: 'Server not found', port });
  }
});

// Start the main server on port 3000
const mainServer = app.listen(3000, () => {
  console.log('Main server running on port 3000');
});