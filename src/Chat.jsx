import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Relogio from './Relogio';
import './Chat.css';

const Chat = () => {
  const gifs = ['/escutando.gif', '/processando.gif', '/respondendo.gif'];
  const [gifIndex, setGifIndex] = useState(0);
  const [gravando, setGravando] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const mensagensRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  useEffect(() => {
    if (location.state?.iniciarGravacao) {
      startGravacao();
    }
  }, [location.state]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('✅ WebSocket ativo em Chat.jsx');
    };

    socket.onmessage = (event) => {
      console.log('📩 Mensagem recebida no Chat.jsx:', event.data);
      if (event.data === 'pressionado') {
        startGravacao();
      }
    };

    socket.onerror = (error) => {
      console.error('❌ Erro WebSocket em Chat.jsx:', error);
    };

    socket.onclose = () => {
      console.warn('⚠️ WebSocket desconectado em Chat.jsx');
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (mensagens.length === 0) return;

    const timeout = setTimeout(() => {
      console.log('⏳ Inatividade detectada, retornando à tela inicial...');
      navigate('/');
    }, 30000); // 30 segundos

    return () => clearTimeout(timeout); // limpa o timer se novas mensagens chegarem
  }, [mensagens, navigate]);

  useEffect(() => {
    // Força o carregamento das vozes
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  // Função auxiliar para selecionar voz feminina em pt-BR
  const getVozFeminina = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice =>
      voice.lang === 'pt-BR' &&
      /female|mulher|maria|brasil/i.test(voice.name)
    ) || voices.find(voice => voice.lang === 'pt-BR');
  };

  const enviarPergunta = async (textoPergunta) => {
    setGifIndex(1);

    try {
      const response = await fetch('http://127.0.0.1:8000/speech/process-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: textoPergunta }),
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();
      const textoResposta = data.result?.content || 'Sem resposta da API';

      // Adiciona pergunta e resposta ao histórico
      setMensagens(prev => [...prev, { pergunta: textoPergunta, resposta: textoResposta }]);
      setGifIndex(2);

      // 🗣️ Falar resposta em voz alta
      const utterance = new SpeechSynthesisUtterance(textoResposta);
      utterance.lang = 'pt-BR';
      utterance.voice = getVozFeminina();
      window.speechSynthesis.cancel(); // cancela falas anteriores
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Erro na LLM:', error);
      const erroMsg = 'Erro ao conectar com a API.';
      setMensagens(prev => [...prev, { pergunta: textoPergunta, resposta: erroMsg }]);
      setGifIndex(0);

      // 🗣️ Falar mensagem de erro também
      const utteranceErro = new SpeechSynthesisUtterance(erroMsg);
      utteranceErro.lang = 'pt-BR';
      utteranceErro.voice = getVozFeminina();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utteranceErro);
    }
  };

  const startGravacao = async () => {
    if (gravando) return;

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
          const texto = data.texto || 'Erro na transcrição.';

          await enviarPergunta(texto);

        } catch (err) {
          console.error('Erro na transcrição:', err);
          setMensagens(prev => [...prev, { pergunta: 'Áudio não compreendido.', resposta: 'Erro na transcrição.' }]);
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
      setMensagens(prev => [...prev, { pergunta: 'Erro ao acessar microfone.', resposta: '' }]);
      setGravando(false);
      setGifIndex(0);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
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

      <div className="chat-container" ref={mensagensRef}>
        {mensagens.map((msg, i) => (
          <div key={i} className="mensagem">
            <p className="perguntas"><strong>Você:</strong> {msg.pergunta}</p>
            <p className="resposta"><strong>InovFabIA:</strong> {msg.resposta} <br/><br/>Quer realizar outra pergunta? Aperte o botão do totem novamente.</p>
          </div>
        ))}
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