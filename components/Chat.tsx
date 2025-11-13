
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { type Product, type ChatMessage, type GroundingChunk } from '../types';
import { getChatResponse } from '../services/geminiService';
import { generateSpeech } from '../services/ttsService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import Loader from './Loader';

const SpeakerIcon: React.FC<{
  text: string;
}> = ({ text }) => {
  const { play, isPlaying, isGenerating, setIsGenerating } = useAudioPlayer();

  const handlePlay = useCallback(async () => {
    if (isPlaying || isGenerating) return;
    setIsGenerating(true);
    try {
      const audio = await generateSpeech(text);
      await play(audio);
    } catch (e) {
      console.error(e);
      // Handle error in UI
    } finally {
      setIsGenerating(false);
    }
  }, [text, play, isPlaying, isGenerating, setIsGenerating]);
  
  const Icon = () => {
    if(isGenerating) return (
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
    );
    if(isPlaying) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01" />
      </svg>
    );
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01" />
      </svg>
    );
  }

  return (
    <button 
      onClick={handlePlay} 
      className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group"
      aria-label={isPlaying ? "Arrêter la lecture" : "Lire le message"}
      title={isPlaying ? "Arrêter la lecture" : "Lire le message"}
    >
      <Icon />
    </button>
  );
};

interface ChatProps {
  product: Product;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ product, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const productContext = `Name: ${product.product_name}, Brands: ${product.brands}, Ingredients: ${product.ingredients_text_with_allergens}`;

  useEffect(() => {
    setMessages([{ role: 'model', text: `Bonjour ! Je peux répondre à toutes vos questions sur ${product.product_name}.` }]);
  }, [product.product_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await getChatResponse(input, productContext);
      const modelMessage: ChatMessage = { role: 'model', text, sources };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: 'Désolé, une erreur s\'est produite. Veuillez réessayer.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex items-center p-3 glass-header border-b border-white/10">
        <button 
          onClick={onBack} 
          className="mr-3 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          aria-label="Retour"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src={product.image_url} 
          alt={product.product_name} 
          className="w-10 h-10 rounded-lg object-cover mr-2 border border-white/20 shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40/374151/9CA3AF?text=?';
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold truncate text-white">{product.product_name}</h2>
          <p className="text-xs text-gray-400 truncate">Assistant IA</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gradient-to-b from-transparent to-gray-900/50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-full glass-icon flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-xs md:max-w-md p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-lg ${
              msg.role === 'user' 
                ? 'glass-message-user text-white rounded-br-sm' 
                : 'glass-message text-white rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
              {msg.role === 'model' && (
                <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <SpeakerIcon text={msg.text}/>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex-1 text-xs text-gray-400">
                      <h4 className="font-semibold text-gray-300 mb-0.5">Sources:</h4>
                      <ul className="space-y-0.5">
                        {msg.sources.map((source, i) => source.web && (
                          <li key={i}>
                            <a 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {source.web.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full glass-input flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full glass-icon flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="glass-message rounded-xl rounded-bl-sm p-3">
              <Loader/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 sm:p-3 glass-header border-t border-white/10">
        <div className="flex items-center glass-chat-input rounded-lg sm:rounded-xl focus-within:ring-2 focus-within:ring-cyan-400/30 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question..."
            className="flex-1 bg-transparent p-2 sm:p-2.5 text-white placeholder-gray-400 focus:outline-none text-xs sm:text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className="m-1.5 p-2 glass-button rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
            aria-label="Envoyer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
