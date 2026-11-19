export interface ChatSpace {
  name: string;
  displayName?: string;
  spaceType?: string;
  type?: string;
  singleUserBotDm?: boolean;
  spaceThreadingState?: string;
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    name?: string;
    displayName?: string;
    type?: string;
  };
  thread?: {
    name?: string;
  };
}

export class GoogleChatApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleChatApiError';
    this.status = status;
  }
}

const CHAT_API_BASE = 'https://chat.googleapis.com/v1';

async function parseErrorResponse(res: Response): Promise<GoogleChatApiError> {
  let msg = `Google Chat API error (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error?.message) {
      msg = body.error.message;
    }
  } catch {
    // keep fallback status message
  }
  return new GoogleChatApiError(msg, res.status);
}

export async function listChatSpaces(accessToken: string): Promise<ChatSpace[]> {
  const res = await fetch(`${CHAT_API_BASE}/spaces?pageSize=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  const data = await res.json();
  return Array.isArray(data.spaces) ? data.spaces : [];
}

export async function createChatSpace(
  accessToken: string,
  displayName: string
): Promise<ChatSpace> {
  const res = await fetch(`${CHAT_API_BASE}/spaces`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceType: 'SPACE',
      displayName: displayName.trim(),
    }),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  return res.json();
}

export async function listSpaceMessages(
  accessToken: string,
  spaceName: string
): Promise<ChatMessage[]> {
  const res = await fetch(
    `${CHAT_API_BASE}/${spaceName}/messages?pageSize=50&orderBy=createTime%20desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  const data = await res.json();
  const list: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];
  return [...list].reverse();
}

export async function sendSpaceMessage(
  accessToken: string,
  spaceName: string,
  text: string
): Promise<ChatMessage> {
  const res = await fetch(`${CHAT_API_BASE}/${spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
  return res.json();
}

export async function deleteSpaceMessage(
  accessToken: string,
  messageName: string
): Promise<void> {
  const res = await fetch(`${CHAT_API_BASE}/${messageName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res);
  }
}
