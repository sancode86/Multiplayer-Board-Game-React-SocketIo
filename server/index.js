const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {     
        origin: '*'   
    },
  });

// Piezas de los jugadores
const PJ1 = "😀";
const PJ2 = "😋";

var tableroInicial = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, PJ2, PJ2, PJ2, PJ2, PJ2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, PJ1, PJ1, PJ1, PJ1, PJ1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

app.get("/api", (req, res) => {
    res.json({ tablero: tableroInicial });
  }); 

var clientesConectados = [];

io.on('connection', (socket) => {
  // console.log('Cliente conectado: ', socket.id);
  clientesConectados.push(socket.id);

  io.emit("mensaje", tableroInicial);
  io.emit("socket", socket.id);

  io.to(clientesConectados[0]).emit("tuPieza", PJ1);
  io.to(clientesConectados[0]).emit("piezaEnemigo", PJ2);

  socket.on('movimiento', (userData) => {
 
    tableroInicial[userData.index] = userData.pieza;
    tableroInicial[userData.vaciar] = 0;
    io.emit("mensaje", tableroInicial);
    io.emit("socket", socket.id);

    console.log(userData);
    console.log(tableroInicial);

  });

});

function checkearGanador(){
  var buscarPJ1 = tableroInicial.find(pieza => pieza == PJ1);
  var buscarPJ2 = tableroInicial.find(pieza => pieza == PJ2);
  if(buscarPJ1 === undefined){
    console.log("gano PJ2");
  }
  if(buscarPJ2 === undefined){
    console.log("gano PJ1");
  }
}

server.listen(3030, () => {
  console.log('listening on 3030');
});
