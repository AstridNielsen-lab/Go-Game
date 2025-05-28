import React, { useState, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Play } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { BoardState, Position } from '../types/gameTypes';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyAuFi5KtPsMJI5IC8c5FjvYD5IbuBdwH_U";

interface AITeacherProps {
  boardState: BoardState;
  onPlayMove?: (position: Position) => void;
}

const AITeacher: React.FC<AITeacherProps> = ({ boardState, onPlayMove }) => {
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState<string>("");
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const generateResponse = async (userQuestion: string) => {
    setIsLoading(true);
    try {
      const payload = {
        contents: [{
          parts: [{
            text: `Como professor de Go (Baduk), responda em português à seguinte pergunta sobre o jogo: ${userQuestion}. 
                   Estado atual do tabuleiro: ${JSON.stringify(boardState)}`
          }]
        }]
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      setResponse("Desculpe, não consegui processar sua pergunta. Tente novamente.");
    }
    setIsLoading(false);
  };

  const handleAIPlay = async () => {
    setIsLoading(true);
    try {
      const payload = {
        contents: [{
          parts: [{
            text: `Como jogador de Go, analise o tabuleiro atual e sugira a melhor jogada possível. 
                   Responda apenas com as coordenadas x,y da jogada, por exemplo: "5,7". 
                   Estado do tabuleiro: ${JSON.stringify(boardState)}`
          }]
        }]
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const moveText = data.candidates[0].content.parts[0].text;
      const [x, y] = moveText.trim().split(',').map(Number);

      if (!isNaN(x) && !isNaN(y) && onPlayMove) {
        onPlayMove({ x, y });
        setResponse("IA jogou na posição " + moveText);
      } else {
        setResponse("A IA não conseguiu fazer uma jogada válida. Tente novamente.");
      }
    } catch (error) {
      setResponse("Erro ao processar a jogada da IA. Tente novamente.");
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      generateResponse(question);
      resetTranscript();
    }
  };

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'pt-BR' });
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Professor de Go</h3>
        {onPlayMove && (
          <button
            onClick={handleAIPlay}
            disabled={isLoading || boardState.gameOver}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <Play size={20} />
            Jogar com IA
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="Faça uma pergunta sobre Go..."
          />
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2 rounded-md ${isVoiceEnabled ? 'bg-red-500' : 'bg-blue-500'} text-white`}
          >
            {isVoiceEnabled ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md"
            disabled={isLoading}
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </form>

      {listening && (
        <div className="text-sm text-gray-600 mb-2">
          Ouvindo: {transcript}
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-600">Pensando...</div>
      ) : response && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-gray-800">{response}</p>
        </div>
      )}
    </div>
  );
};

export default AITeacher;
