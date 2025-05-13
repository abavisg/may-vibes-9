/**
 * Text-to-speech utility functions for reading content aloud
 */

// Store the speech synthesis instance
let speechSynthesis: SpeechSynthesis | null = null;
let speechUtterance: SpeechSynthesisUtterance | null = null;

// Initialize the speech synthesis when the browser is ready
const initSpeechSynthesis = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  if ('speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  
  return false;
};

// Function to stop any ongoing speech
export const stopSpeech = (): void => {
  if (!speechSynthesis) {
    if (!initSpeechSynthesis()) return;
  }
  
  if (speechSynthesis?.speaking) {
    speechSynthesis.cancel();
  }
};

// Function to read text aloud
export const speakText = (text: string, options: {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
} = {}): void => {
  if (!speechSynthesis) {
    if (!initSpeechSynthesis()) {
      console.error("Text-to-speech is not supported in this browser");
      return;
    }
  }
  
  // Stop any ongoing speech
  stopSpeech();
  
  // Create a new utterance
  speechUtterance = new SpeechSynthesisUtterance(text);
  
  // Set options
  speechUtterance.rate = options.rate || 1;
  speechUtterance.pitch = options.pitch || 1;
  speechUtterance.volume = options.volume || 1;
  
  // Set voice if provided
  if (options.voice) {
    speechUtterance.voice = options.voice;
  }
  
  // Speak the text
  speechSynthesis?.speak(speechUtterance);
};

// Function to get available voices
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!speechSynthesis) {
      if (!initSpeechSynthesis()) {
        resolve([]);
        return;
      }
    }
    
    // Some browsers need a timeout for voices to load
    setTimeout(() => {
      const voices = speechSynthesis?.getVoices() || [];
      resolve(voices);
    }, 100);
  });
};

// Function to get a child-friendly voice (preferably female voice)
export const getChildFriendlyVoice = async (): Promise<SpeechSynthesisVoice | null> => {
  const voices = await getVoices();
  
  if (!voices.length) return null;
  
  // Prioritize voices in this order:
  // 1. English female voices with "kid" or "child" in the name
  // 2. Any female English voice
  // 3. Any English voice
  // 4. Any voice
  
  // Look for kid-specific voices first
  const kidVoice = voices.find(voice => 
    voice.name.toLowerCase().includes('kid') || 
    voice.name.toLowerCase().includes('child')
  );
  
  if (kidVoice) return kidVoice;
  
  // Then look for female English voices
  const femaleEnglishVoice = voices.find(voice => 
    voice.lang.startsWith('en') && 
    voice.name.toLowerCase().includes('female')
  );
  
  if (femaleEnglishVoice) return femaleEnglishVoice;
  
  // Then any English voice
  const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
  
  if (englishVoice) return englishVoice;
  
  // Default to the first available voice
  return voices[0];
};

// Function to read a card aloud (title and content)
export const speakCard = async (title: string, content: string): Promise<void> => {
  const childVoice = await getChildFriendlyVoice();
  
  // Clean up the content (remove HTML tags)
  const cleanContent = content.replace(/<[^>]*>?/gm, '');
  
  // Create a full text to speak
  const textToSpeak = `${title}. ${cleanContent}`;
  
  // Speak with a child-friendly voice if available
  speakText(textToSpeak, {
    rate: 0.9, // Slightly slower rate for better comprehension
    pitch: 1.1, // Slightly higher pitch for a more animated sound
    voice: childVoice
  });
};

// Function to check if text-to-speech is supported
export const isSpeechSupported = (): boolean => {
  return initSpeechSynthesis();
};

// Function to check if speech is currently in progress
export const isSpeaking = (): boolean => {
  return speechSynthesis?.speaking || false;
};