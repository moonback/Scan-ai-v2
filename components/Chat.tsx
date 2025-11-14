
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
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2563eb] border-t-transparent"></div>
    );
    if(isPlaying) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01" />
      </svg>
    );
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#2563eb] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="flex h-full flex-col bg-transparent">
      <div className="safe-area-top px-2.5 pt-2.5 sm:px-6 sm:pt-3">
        <div className="glass-card flex items-center gap-3 rounded-[26px] border border-white/30 bg-white/85 px-3 py-2 sm:rounded-[28px] sm:px-4 sm:py-3">
          <button
            onClick={onBack}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/50 bg-white/80 text-slate-500 transition hover:text-[var(--accent)] sm:h-11 sm:w-11"
            aria-label="Retour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-12 w-12 rounded-2xl object-cover shadow-inner sm:h-14 sm:w-14"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64/edf2ff/94a3b8?text=?';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Assistant IA</p>
            <h2 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{product.product_name}</h2>
          </div>
        </div>
      </div>

      <div className="smooth-scroll flex-1 overflow-y-auto px-2.5 py-3.5 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="mr-3 hidden h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm sm:flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[86%] rounded-[26px] px-4 py-3 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:text-base ${
                    isUser
                      ? 'bg-gradient-to-br from-[#4f46e5] to-[#0ea5e9] text-white'
                      : 'bg-white/90 text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.role === 'model' && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/60 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <SpeakerIcon text={msg.text} />
                        <span className="font-medium uppercase tracking-[0.3em] text-[var(--accent-dark)]">Audio</span>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div>
                          <p className="mb-1 font-semibold text-slate-600">Sources vérifiées</p>
                          <ul className="space-y-1">
                            {msg.sources.map((source, i) => source.web && (
                              <li key={i}>
                                <a
                                  href={source.web.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
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
                {isUser && (
                  <div className="ml-3 hidden h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm sm:flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="hidden h-8 w-8 items-center justify-center rounded-2xl bg-white/80 shadow-sm sm:flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="glass-card rounded-[26px] px-4 py-3 text-sm text-slate-500 shadow-lg">
                <Loader />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="safe-area-bottom px-2.5 pb-3.5 sm:px-6 sm:pb-4">
        <div className="glass-chat-input flex items-center gap-2 rounded-[26px] border border-white/40 bg-white/80 px-2.5 py-1.5 shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent-soft)] sm:rounded-[30px] sm:px-3 sm:py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question..."
            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 sm:text-base focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="glass-button flex h-10 w-10 items-center justify-center rounded-2xl disabled:opacity-50 sm:h-11 sm:w-11"
            aria-label="Envoyer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
