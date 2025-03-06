import React, { useState, useEffect, useRef } from 'react';
import Marble from './Marble';
import '../App.css';

function MarbleRace() {
  // Definiamo un array iniziale di biglie con id, colore e posizione iniziale 0
  const initialMarbles = [
    { id: 1, color: '#FF5733', position: 0 },
    { id: 2, color: '#33FF57', position: 0 },
    { id: 3, color: '#3357FF', position: 0 },
    { id: 4, color: '#F1C40F', position: 0 },
    { id: 5, color: '#9B59B6', position: 0 }
  ];
  
  const [marbles, setMarbles] = useState(initialMarbles);
  const [raceStarted, setRaceStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const raceIntervalRef = useRef(null);

  // Funzione per iniziare la gara
  const startRace = () => {
    if (raceStarted) return;
    setRaceStarted(true);
    setWinner(null);
    // Resetta le posizioni
    setMarbles(initialMarbles);
    
    // Aggiorniamo la posizione di ogni biglia a intervalli regolari
    raceIntervalRef.current = setInterval(() => {
      setMarbles(prevMarbles =>
        prevMarbles.map(marble => {
          // Incremento casuale (tra 0 e 5%)
          const increment = Math.random() * 5;
          let newPos = marble.position + increment;
          if (newPos > 100) newPos = 100;
          return { ...marble, position: newPos };
        })
      );
    }, 100);
  };

  // Effetto per verificare se una biglia ha raggiunto il traguardo
  useEffect(() => {
    if (raceStarted) {
      const finishingMarble = marbles.find(m => m.position >= 100);
      if (finishingMarble) {
        setWinner(`Biglia ${finishingMarble.id}`);
        setRaceStarted(false);
        clearInterval(raceIntervalRef.current);
      }
    }
  }, [marbles, raceStarted]);

  return (
    <div className="race-container">
      <div className="track">
        {marbles.map(marble => (
          <Marble key={marble.id} color={marble.color} position={marble.position} />
        ))}
      </div>
      <div>
        {!raceStarted && <button onClick={startRace}>Inizia Gara</button>}
      </div>
      {winner && <div style={{ marginTop: '10px', fontSize: '20px' }}>Vincitore: {winner}</div>}
    </div>
  );
}

export default MarbleRace;
