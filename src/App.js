import React, { useState } from 'react';
import Menu from './components/Menu';
import Race from './components/Race';
import './App.css';

function App() {
  // phase: "menu" oppure "race" (dopo la raccolta dei dati)
  const [phase, setPhase] = useState("menu");
  // memorizziamo le biglie inserite nel menu (array di oggetti { id, name, image, color })
  const [marbles, setMarbles] = useState([]);

  // Quando la gara termina, qui potresti salvare i risultati
  const handleRaceEnd = (finalState) => {
    console.log("Risultato gara:", finalState);
    // Per semplicità, torniamo al menu
    setPhase("menu");
  };

  return (
    <div className="App container" style={{ backgroundColor: '#f0f0f0' }}>
      {phase === "menu" && (
        <Menu 
          marbles={marbles}
          setMarbles={setMarbles}
          onStart={() => {
            if(marbles.length > 0) {
              setPhase("race");
            } else {
              alert("Aggiungi almeno una biglia per iniziare la gara!");
            }
          }}
        />
      )}
      {phase === "race" && (
        <Race marbles={marbles} onRaceEnd={handleRaceEnd} />
      )}
    </div>
  );
}

export default App;
