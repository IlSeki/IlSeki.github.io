import React, { useState } from 'react';
import './Menu.css'; // Import a CSS file for additional styling

// Funzione per generare un colore casuale
const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for(let i=0; i<6; i++){
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function Menu({ marbles, setMarbles, onStart }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const handleAddMarble = () => {
    if (name.trim() === "") {
      alert("Inserisci il nome della biglia");
      return;
    }
    // Se non è fornita immagine, usa un colore casuale
    const newMarble = {
      id: Date.now(),
      name: name.trim(),
      image: image.trim() || null,
      color: image.trim() ? null : randomColor()
    };
    setMarbles([...marbles, newMarble]);
    setName("");
    setImage("");
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">Menu Iniziale - Inserisci le Biglie</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Nome biglia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="URL immagine (opzionale)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddMarble} className="add-button">
          Aggiungi Biglia
        </button>
      </div>
      {marbles.length > 0 && (
        <div className="marbles-list-container">
          <h2 className="marbles-list-title">Biglie Aggiunte:</h2>
          <ul className="marbles-list">
            {marbles.map(marble => (
              <li key={marble.id} className="marble-item">
                {marble.image ? (
                  <img src={marble.image} alt={marble.name} className="marble-image" />
                ) : (
                  <div className="marble-color" style={{ backgroundColor: marble.color, border: '2px solid #fff' }}></div>
                )}
                <span className="marble-name">{marble.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={onStart} className="start-button" style={{ backgroundColor: '#33ff99', color: '#333' }}>
        Inizia Gara
      </button>
    </div>
  );
}

export default Menu;
