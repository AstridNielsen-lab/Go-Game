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
const waitingPlayers = new Map();

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

      socket.on('join_waiting_room', (playerName) => {
        if (!waitingPlayers.has('GO2025')) {
          waitingPlayers.set('GO2025', []);
        }
        const players = waitingPlayers.get('GO2025');
        players.push({ id: socket.id, name: playerName });
        waitingPlayers.set('GO2025', players);
        
        // Broadcast updated waiting list to all clients
        io.emit('waiting_players_updated', players.map(p => p.name));
      });

      socket.on('select_opponent', (opponentId) => {
        const players = waitingPlayers.get('GO2025');
        const player1 = players.find(p => p.id === socket.id);
        const player2 = players.find(p => p.id === opponentId);

        if (player1 && player2) {
          const gameId = 'GO2025';
          games.set(gameId, {
            players: [player1.id, player2.id],
            moves: [],
            currentPlayer: 'black'
          });

          // Remove players from waiting list
          waitingPlayers.set('GO2025', 
            players.filter(p => p.id !== player1.id && p.id !== player2.id)
          );

          // Notify players and start the game
          io.to(player1.id).emit('game_ready', { gameId, color: 'black' });
          io.to(player2.id).emit('game_ready', { gameId, color: 'white' });
          
          // Update waiting list for other players
          io.emit('waiting_players_updated', 
            waitingPlayers.get('GO2025').map(p => p.name)
          );
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
        if (waitingPlayers.has('GO2025')) {
          const players = waitingPlayers.get('GO2025').filter(p => p.id !== socket.id);
          waitingPlayers.set('GO2025', players);
          io.emit('waiting_players_updated', players.map(p => p.name));
        }
        
        games.forEach((game, gameId) => {
          if (game.players.includes(socket.id)) {
            io.to(gameId).emit('player_left', socket.id);
            games.delete(gameId);
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

const mainServer = app.listen(3000, () => {
  console.log('Main server running on port 3000');
});