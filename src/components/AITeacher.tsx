import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const API_KEY = "AIzaSyAuFi5KtPsMJI5IC8c5FjvYD5IbuBdwH_U";
const genAI = new GoogleGenerativeAI(API_KEY);

interface AITeacherProps {
  boardState: any;
}

const AITeacher: React.FC<AITeacherProps> = ({ boardState }) => {
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Como professor de Go (Baduk), responda em português à seguinte pergunta sobre o jogo: ${userQuestion}. 
                     Estado atual do tabuleiro: ${JSON.stringify(boardState)}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setResponse(response.text());
    } catch (error) {
      setResponse("Desculpe, não consegui processar sua pergunta. Tente novamente.");
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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Professor de Go</h3>
      
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