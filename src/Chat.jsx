import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Relogio from './Relogio';
import './Chat.css';

const Chat = () => {
  const gifs = ['/escutando.gif', '/processando.gif', '/respondendo.gif'];
  const [gifIndex, setGifIndex] = useState(0);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  }; 

  const handleGifClick = () => {
    setGifIndex((prevIndex) => (prevIndex + 1) % gifs.length);
  };

  return (
    <div>
      <div className="logo-container">
        <img
          src='/logo.svg'
          alt="Logo do InovFabLab"
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      
      <div className="relogio-container">
        <Relogio />
      </div>

      <div className="titulo-container">
        <h1 className="titulo">Bem-vindo ao InovFabIA</h1>
      </div>

      <div className="chat-container">
        <p className='perguntas'>O que é o laboratório InovFabLab?</p>
      </div>

      <div className="resposta-container">
        <img
          src={gifs[gifIndex]}
          alt={`animação ${gifIndex}`}
          className="gif"
          onClick={handleGifClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default Chat;
