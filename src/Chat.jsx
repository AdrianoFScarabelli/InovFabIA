import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Relogio from './Relogio';
import './Chat.css';

const Chat = () => {
  const gifs = ['/escutando.gif', '/processando.gif', '/respondendo.gif'];
  const [gifIndex, setGifIndex] = useState(0);
  const [pergunta, setPergunta] = useState('O que é o laboratório InovFabLab?');
  const [resposta, setResposta] = useState('');
  const [gravando, setGravando] = useState(false);

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const enviarPergunta = async (texto = pergunta) => {
    setGifIndex(1);

    try {

      const blob = new Blob([pergunta], { type: 'text/plain' });
      const file = new File([blob], 'pergunta.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/speech/process-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta: pergunta }),
      });

      console.log("Response status:", response.status);
      console.log("Response URL:", response.url);
      console.log("Response redirected:", response.redirected);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      console.error("Erro ao fazer parse do JSON:", e);
      setResposta('Resposta não está em formato JSON');
      setGifIndex(0);
      return;
    }

    setResposta(data.result.content || 'Sem resposta da API');
    setGifIndex(2);

    } catch (error) {
      setResposta('Erro ao conectar com a API');
      setGifIndex(0);
      console.error(error);
    }
  };

  const startGravacao = async () => {
    setPergunta('');
    setResposta('');
    setGifIndex(0);
    setGravando(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'audio.webm');

        setGifIndex(1);

        try {
          const response = await fetch('http://127.0.0.1:5000/transcricao', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          const texto = data.texto || 'Erro na transcrição';
          setPergunta(texto);

          await enviarPergunta(texto);

        } catch (err) {
          console.error('Erro ao transcrever:', err);
          setPergunta('Erro ao transcrever áudio');
          setGifIndex(0);
        }

        setGravando(false);
      };

      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 5000);

    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setPergunta('Erro ao acessar microfone');
      setGravando(false);
      setGifIndex(0);
    }
  };

  const handleGifClick = () => {
    startGravacao();
  };

  return (
    <div>
      <div className="logo-container">
        <img
          src="/logo.svg"
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
        <p className="perguntas">{pergunta}</p>
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