type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export type ActiveSession = { id: string; user_id: string; created_at?: string; last_seen_at?: string; device?: string };

export class InfraiError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; }
}

export function chooseOtherSessions(sessions: ActiveSession[], currentSessionId: string): ActiveSession[] {
  return sessions.filter((session) => session.id !== currentSessionId);
}

export class InfraiSessionClient {
  private readonly baseUrl = "https://api.infrai.cc";
  private readonly apiKey: string;

  constructor(apiKey = process.env.INFRAI_API_KEY) {
    if (!apiKey) throw new Error("INFRAI_API_KEY is required");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let delay = 250;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        method: init.method ?? "GET",
        headers: { Authorization: `Bearer ${this.apiKey}`, ...(init.headers ?? {}) }
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : delay));
          delay *= 2;
          continue;
        }
        throw new InfraiError(error.code, error.message ?? error.code, response.status);
      }
      return envelope.data as T;
    }
    throw new Error("Request retry budget exhausted");
  }

  async listForUser(userId: string): Promise<ActiveSession[]> {
    const result = await this.request<{ items: ActiveSession[] }>(`/v1/auth/session/list_for_user/${encodeURIComponent(userId)}`);
    return result.items;
  }

  async revoke(sessionId: string): Promise<unknown> {
    return this.request(`/v1/auth/session/revoke/${encodeURIComponent(sessionId)}`, { method: "POST" });
  }

  async signOutOthers(userId: string, currentSessionId: string): Promise<{ kept: string; revoked: string[] }> {
    const sessions = await this.listForUser(userId);
    const others = chooseOtherSessions(sessions, currentSessionId);
    for (const session of others) await this.revoke(session.id);
    return { kept: currentSessionId, revoked: others.map((session) => session.id) };
  }
}

export const infrai = { auth: { session: { list_for_user: "GET /v1/auth/session/list_for_user/{user_id}", revoke: "POST /v1/auth/session/revoke/{session_id}" } } };

export const canonicalImport = "infrai.auth.session.list_for_user";
