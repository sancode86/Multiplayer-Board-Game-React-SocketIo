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

var vidaPJ1 = 3;
var vidaPJ2 = 3;

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

 var tablero = [...tableroInicial] 

app.get("/api", (req, res) => {
    res.json({ tablero: tablero });
  }); 

var clientesConectados = [];

io.on('connection', (socket) => {
  console.log('Cliente conectado: ', socket.id);
  clientesConectados.push(socket.id);

  io.emit("mensaje", tablero);
  io.emit("socket", socket.id);

  io.to(clientesConectados[0]).emit("tuPieza", PJ1);
  io.to(clientesConectados[0]).emit("piezaEnemigo", PJ2);
  io.to(clientesConectados[1]).emit("tuPieza", PJ2);
  io.to(clientesConectados[1]).emit("piezaEnemigo", PJ1);

  io.to(clientesConectados[0]).emit("vida", vidaPJ1);
  io.to(clientesConectados[1]).emit("vida", vidaPJ2);

  socket.on('movimiento', (userData) => {
 
    tablero[userData.index] = userData.pieza;
    tablero[userData.vaciar] = 0;
    io.emit("mensaje", tablero);
    io.emit("socket", socket.id);
    io.emit("movimientoDetectado");

    console.log(userData);
    console.log(tablero);
    checkearGanador();

  });

  socket.on("disconnect", (reason) => {
   console.log("Se fue: ", socket.id)
   console.log("cantidad Clientes: ",  io.engine.clientsCount)

   if(io.engine.clientsCount === 0){
    clientesConectados = [];
   }  
 
  });

});

function checkearGanador(){
  var buscarPJ1 = tablero.find(pieza => pieza == PJ1);
  var buscarPJ2 = tablero.find(pieza => pieza == PJ2);
  if(buscarPJ1 === undefined){
    console.log("gano PJ2");
    tablero = [...tableroInicial];
    io.emit("mensaje", tablero);
  }
  if(buscarPJ2 === undefined){
    console.log("gano PJ1");
    tablero = [...tableroInicial];
    io.emit("mensaje", tablero);
  }
}

server.listen(3030, () => {
  console.log('listening on 3030');
});
