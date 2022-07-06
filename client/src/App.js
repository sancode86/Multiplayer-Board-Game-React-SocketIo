import { useState, useEffect, useRef, createRef } from "react";
import "./App.css";
import io from "socket.io-client";

let socket = io("//localhost:3030", {});
// const socket = io() 


function App() {
  const [tablero, setTablero] = useState([0]);
  const [enMano, setEnMano] = useState("");
  const [tuPieza, setTuPieza] = useState(2);
  const [piezaEnemigo, setPiezaEnemigo] = useState(1);
  const [vida, setVida] = useState(3);
  const [socketId, setSocketId] = useState("");

  let movimiento = new Audio("/movimiento.mp3");

  const sonidoMovimiento = () => {
    movimiento.play();
    movimiento.stop(); 
  
  }


  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setTablero(data.tablero));
  }, []);

  useEffect(() => {
   if(vida === 0){
    console.log("Perdiste");
   }
  }, [vida]);

  // Crear referencias a los casilleros, emular/similar a "getElementbyId"
  const refCasillero = useRef([]);
  refCasillero.current = tablero.map(
    (element, i) => refCasillero.current[i] ?? createRef()
  );

  socket.on("mensaje", (mensaje) => {
    setTablero(mensaje);
  });

  socket.on("socket", (socket) => {
    setSocketId(socketId);
  });

  socket.on("tuPieza", (pieza) => {
    setTuPieza(pieza);
  });
  socket.on("vida", (vida) => {
    setVida(vida);
    console.log("vida", vida);
  });
  socket.on("piezaEnemigo", (pieza) => {
    setPiezaEnemigo(pieza);
  });
  socket.on("movimientoDetectado", () => {
    sonidoMovimiento();
    console.log("MOVIMIENTO")
  });

  function clickCasillero(index) {
    if (enMano === "" && tablero[index] === tuPieza) {
      levantarPieza(tablero[index], index);
    }
    if (enMano !== "" && tablero[index] !== tuPieza) {
      ponerPieza(index);
    }
  }

  const movimientosPosibles = [0, 1, -1, 9, -9, 8, 10, -10, -8];

  function movimientosDisponibles(index) {
    const colorDisponible = "#98971a";
    const colorAtaque = "#d65d0e";

    // Primero deshabilitar todos los botones/casilleros
    for (let i = 0; i < tablero.length; i++) {
      refCasillero.current[i].current.disabled = true;
    }
    // Habilitar segun movimientos posibles
    for (let w = 0; w < movimientosPosibles.length; w++) {
      if (
        tablero[index + movimientosPosibles[w]] !== tuPieza &&
        index + movimientosPosibles[w] < tablero.length &&
        index + movimientosPosibles[w] > -1
      ) {
        if (tablero[index + movimientosPosibles[w]] === piezaEnemigo) {
          refCasillero.current[
            index + movimientosPosibles[w]
          ].current.style.backgroundColor = colorAtaque;
        } else {
          refCasillero.current[
            index + movimientosPosibles[w]
          ].current.style.backgroundColor = colorDisponible;
        }
        refCasillero.current[
          index + movimientosPosibles[w]
        ].current.disabled = false;
      }
    }
  }

  function ponerPieza(index) {
    socket.emit("movimiento", {
      pieza: enMano.pieza,
      index: index,
      vaciar: enMano.index,
    });
    const update = [...tablero];
    update[index] = enMano.pieza;
    update[enMano.index] = 0;
    setTablero(update);
    setEnMano("");
    // sonidoMovimiento();

    // Rehabilitar todos los casilleros
    for (let i = 0; i < tablero.length; i++) {
      refCasillero.current[i].current.style.backgroundColor = "#504945";
      refCasillero.current[i].current.style.border = "1px solid #3c3836";
      refCasillero.current[i].current.disabled = false;
    }
  }

  function levantarPieza(pieza, index) {
    refCasillero.current[index].current.style.backgroundColor = "#504945";
    refCasillero.current[index].current.style.border = "1px solid #98971a";
    setEnMano({ pieza: pieza, index: index });
    movimientosDisponibles(index);
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <p>{!data ? "Loading..." : data}</p> */}
        <section className="tablero">
          {tablero?.map((casillero, index) =>
            casillero !== 0 ? (
              <button
                ref={refCasillero.current[index]}
                key={index}
                id={"casillero" + index}
                className="casillero"
                onClick={() => clickCasillero(index)}
              >
                {casillero}
              </button>
            ) : (
              <button
                ref={refCasillero.current[index]}
                key={index}
                id={"casillero" + index}
                className="casillero"
                onClick={() => clickCasillero(index)}
              ></button>
            )
          )}
        </section>
      </header>
    </div>
  );
}
export default App;
