import React, { useState, useEffect } from 'react';
import Relogio from './Relogio';
import './App.css';

const App = () => {
  const imagens = [
    '/foto1.jpg',
    '/foto2.jpg',
    '/foto3.jpg',
    '/foto4.jpg',
    '/foto5.jpg',
  ];

  const [indexAtual, setIndexAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndexAtual((prevIndex) =>
        prevIndex === imagens.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalo);
  }, [imagens.length]);

  return (
    <div>
      <div className="relogio-container">
        <Relogio/>
      </div>
      <div className="slider-container">
        <img
          src={imagens[indexAtual]}
          alt="Imagem rotativa"
          className="slider-image"
        />
      </div>
      <div className="welcome-container">
        <h1 className="welcome">Bem-vindo, faça uma pergunta ao InovFabIA para iniciar.</h1>
      </div>
    </div>
    
  );
};

export default App;