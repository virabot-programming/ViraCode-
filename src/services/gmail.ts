export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailPayloadPart {
  mimeType?: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: {
    size?: number;
    data?: string;
  };
  parts?: GmailPayloadPart[];
}

export interface GmailMessageRaw {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailPayloadPart;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText: string;
  isUnread: boolean;
}

export class GmailApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GmailApiError';
    this.status = status;
  }
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function parseGmailError(res: Response): Promise<GmailApiError> {
  let msg = `Gmail API error (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error?.message) {
      msg = body.error.message;
    }
  } catch {
    // keep status fallback
  }
  return new GmailApiError(msg, res.status);
}

function decodeBase64Url(data?: string): string {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeRfc2047(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function extractPlainText(part?: GmailPayloadPart): string {
  if (!part) return '';
  if (part.mimeType === 'text/plain' && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }
  if (part.parts && part.parts.length > 0) {
    for (const sub of part.parts) {
      const found = extractPlainText(sub);
      if (found) return found;
    }
    for (const sub of part.parts) {
      if (sub.mimeType === 'text/html' && sub.body?.data) {
        return decodeBase64Url(sub.body.data)
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
  }
  if (part.body?.data) {
    const decoded = decodeBase64Url(part.body.data);
    if (part.mimeType === 'text/html') {
      return decoded
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return decoded;
  }
  return '';
}

function parseGmailMessage(raw: GmailMessageRaw): GmailMessageItem {
  const headers = raw.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const labelIds = Array.isArray(raw.labelIds) ? raw.labelIds : [];
  const bodyText = extractPlainText(raw.payload) || raw.snippet || '';

  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds,
    snippet: raw.snippet || '',
    subject: getHeader('Subject') || '(No Subject)',
    from: getHeader('From') || 'Unknown Sender',
    to: getHeader('To') || '',
    date: getHeader('Date') || '',
    bodyText,
    isUnread: labelIds.includes('UNREAD'),
  };
}

export async function listGmailMessages(
  accessToken: string,
  options?: { q?: string; labelId?: string; maxResults?: number }
): Promise<GmailMessageItem[]> {
  const params = new URLSearchParams();
  params.set('maxResults', String(options?.maxResults ?? 15));
  if (options?.q?.trim()) {
    params.set('q', options.q.trim());
  }
  if (options?.labelId && options.labelId !== 'ALL') {
    params.set('labelIds', options.labelId);
  }

  const res = await fetch(`${GMAIL_API_BASE}/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw await parseGmailError(res);
  }
  const data = await res.json();
  const refs: Array<{ id: string }> = Array.isArray(data.messages) ? data.messages : [];
  if (refs.length === 0) return [];

  const details = await Promise.all(
    refs.slice(0, 15).map(async (ref) => {
      const msgRes = await fetch(`${GMAIL_API_BASE}/messages/${encodeURIComponent(ref.id)}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!msgRes.ok) {
        if (msgRes.status === 401) {
          throw await parseGmailError(msgRes);
        }
        return null;
      }
      const raw: GmailMessageRaw = await msgRes.json();
      return parseGmailMessage(raw);
    })
  );

  return details.filter((m): m is GmailMessageItem => m !== null);
}

export async function sendGmailMessage(
  accessToken: string,
  input: { to: string; subject: string; body: string; threadId?: string }
): Promise<void> {
  const lines = [
    `To: ${input.to.trim()}`,
    `Subject: ${encodeRfc2047(input.subject.trim() || '(No Subject)')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    input.body,
  ];
  const raw = encodeBase64Url(lines.join('\r\n'));

  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw,
      ...(input.threadId ? { threadId: input.threadId } : {}),
    }),
  });
  if (!res.ok) {
    throw await parseGmailError(res);
  }
}

export async function createGmailDraft(
  accessToken: string,
  input: { to: string; subject: string; body: string }
): Promise<void> {
  const lines = [
    `To: ${input.to.trim()}`,
    `Subject: ${encodeRfc2047(input.subject.trim() || '(No Subject)')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    input.body,
  ];
  const raw = encodeBase64Url(lines.join('\r\n'));

  const res = await fetch(`${GMAIL_API_BASE}/drafts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { raw },
    }),
  });
  if (!res.ok) {
    throw await parseGmailError(res);
  }
}

export async function trashGmailMessage(
  accessToken: string,
  messageId: string
): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}/trash`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    throw await parseGmailError(res);
  }
}

export async function setGmailMessageUnread(
  accessToken: string,
  messageId: string,
  unread: boolean
): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds: unread ? ['UNREAD'] : [],
        removeLabelIds: unread ? [] : ['UNREAD'],
      }),
    }
  );
  if (!res.ok) {
    throw await parseGmailError(res);
  }
}
