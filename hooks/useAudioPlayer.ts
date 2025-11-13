
import { useState, useRef, useCallback } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';

const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const play = useCallback(async (base64Audio: string) => {
    if (isPlaying) {
      sourceRef.current?.stop();
    }
    
    setIsPlaying(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    }
    const context = audioContextRef.current;
    
    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, context, SAMPLE_RATE, NUM_CHANNELS);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      source.start();
      sourceRef.current = source;
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { play, isPlaying, isGenerating, setIsGenerating };
};
