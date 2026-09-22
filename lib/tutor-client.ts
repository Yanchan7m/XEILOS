export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Interroge le vrai tuteur IA (/api/tutor) en streaming.
 * Renvoie false si l'API n'est pas disponible (pas de clé, réseau, erreur) :
 * l'appelant bascule alors sur les réponses scriptées.
 */
export async function streamTutor(
  messages: ChatMessage[],
  weakModules: string[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, weakModules }),
      signal,
    });
  } catch {
    return false;
  }

  if (!res.ok || !res.body) return false;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let received = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) {
      received = true;
      onChunk(text);
    }
  }

  return received;
}
