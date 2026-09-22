/**
 * Synthèse et reconnaissance vocales natives du navigateur.
 * Tout est optionnel : si l'API manque, les fonctions renvoient false/null et
 * l'interface masque simplement les boutons.
 */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function micSupported() {
  return recognitionCtor() !== null;
}

/** Choisit une voix française si le système en propose une. */
function frenchVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /fr[-_]FR/i.test(v.lang) && /female|amelie|audrey|marie/i.test(v.name)) ??
    voices.find((v) => /^fr/i.test(v.lang)) ??
    null
  );
}

export function speak(text: string) {
  if (!speechSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 1.02;
  u.pitch = 1.05;
  const v = frenchVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Démarre une dictée ponctuelle. Renvoie une fonction d'arrêt, ou null si le
 * navigateur ne sait pas faire.
 */
export function listenOnce(
  onText: (text: string) => void,
  onEnd: () => void,
): (() => void) | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) onText(transcript);
  };
  recognition.onerror = onEnd;
  recognition.onend = onEnd;
  recognition.start();

  return () => recognition.stop();
}
