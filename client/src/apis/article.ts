import { api, generateBrowserId } from "../utils/api";

export interface StreamChunk {
    agent_name: string;
    text: string;
    status?: string;
}

// Start a new session
export const startNewSession = async () => {
    return api.post("/api/session/new");
};

// Generate a full article
export const generateArticle = async (prompt: string, sessionId: string | null, userId: string | null) => {
    return api.post("/api/generate", {
        prompt,
        session_id: sessionId,
        user_id: userId,
    });
};

// Stream agent outputs (async generator)
export const streamAgentOutputs = async function* (prompt: string, sessionId: string | null, userId: string | null) {
    let browserId = localStorage.getItem("folio_browser_id");
    if (!browserId)  browserId = generateBrowserId();

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/generate/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_API_KEY,
            "x-browser-id": browserId, // <-- Key addition
        },
        body: JSON.stringify({ prompt, session_id: sessionId, user_id: userId }),
        mode: "cors",
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    if (!reader) return;

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const data = JSON.parse(line);
                yield data; // Yield each agent step
                if (data.status === "done") return;
            } catch (error) {
                console.error('Error parsing JSON:', error, 'Line:', line);
            }
        }
    }
};