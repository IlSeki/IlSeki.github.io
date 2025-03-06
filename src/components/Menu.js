import React, { useState } from 'react';

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
    <div>
      <h1>Menu Iniziale - Inserisci le Biglie</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nome biglia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <input
          type="text"
          placeholder="URL immagine (opzionale)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
        />
        <button onClick={handleAddMarble} style={{ padding: '8px 16px' }}>
          Aggiungi Biglia
        </button>
      </div>
      {marbles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Biglie Aggiunte:</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {marbles.map(marble => (
              <li key={marble.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                {marble.image ? (
                  <img src={marble.image} alt={marble.name} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                ) : (
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: marble.color, 
                    marginRight: '10px' 
                  }}></div>
                )}
                <span>{marble.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={onStart} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Inizia Gara
      </button>
    </div>
  );
}

export default Menu;
