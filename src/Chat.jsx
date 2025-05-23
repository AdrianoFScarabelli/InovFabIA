import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Relogio from './Relogio';
import './Chat.css';

const Chat = () => {
  const gifs = ['/escutando.gif', '/processando.gif', '/respondendo.gif'];
  const [gifIndex, setGifIndex] = useState(0);
  const [pergunta, setPergunta] = useState('O que é o laboratório InovFabLab?');
  const [resposta, setResposta] = useState('');

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const enviarPergunta = async () => {
  setGifIndex(1);

  try {
    const blob = new Blob([pergunta], { type: 'text/plain' });
    const file = new File([blob], 'pergunta.txt');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://kaue-api-llm-d9dpbadvbhfaezd0.brazilsouth-01.azurewebsites.net/speech/process-file/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    setResposta(data || 'Sem resposta da API');
    setGifIndex(2);
  } catch (error) {
    setResposta('Erro ao conectar com a API');
    setGifIndex(0);
    console.error(error);
  }
  };

  const handleGifClick = () => {
    enviarPergunta();
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
        <p className='perguntas'>{pergunta}</p>
        {resposta && (
          <p className="resposta">{resposta}</p>
        )}
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