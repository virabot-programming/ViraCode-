export type MeetAccessType = 'OPEN' | 'TRUSTED' | 'RESTRICTED';

export interface MeetSpace {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: MeetAccessType | string;
    entryPointAccess?: string;
  };
  activeConference?: {
    conferenceRecord?: string;
  };
}

export interface ConferenceRecord {
  name: string;
  startTime?: string;
  endTime?: string;
  expireTime?: string;
  space?: string;
}

export class GoogleMeetApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleMeetApiError';
    this.status = status;
  }
}

const MEET_API_BASE = 'https://meet.googleapis.com/v2';

async function parseMeetError(res: Response): Promise<GoogleMeetApiError> {
  let msg = `Google Meet API error (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error?.message) {
      msg = body.error.message;
    }
  } catch {
    // keep status fallback
  }
  return new GoogleMeetApiError(msg, res.status);
}

export async function createMeetSpace(
  accessToken: string,
  accessType: MeetAccessType = 'TRUSTED'
): Promise<MeetSpace> {
  const res = await fetch(`${MEET_API_BASE}/spaces`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {
        accessType,
      },
    }),
  });
  if (!res.ok) {
    throw await parseMeetError(res);
  }
  return res.json();
}

export async function getMeetSpace(
  accessToken: string,
  spaceNameOrCode: string
): Promise<MeetSpace> {
  const normalized = spaceNameOrCode.startsWith('spaces/')
    ? spaceNameOrCode
    : `spaces/${spaceNameOrCode.trim()}`;
  const res = await fetch(`${MEET_API_BASE}/${normalized}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw await parseMeetError(res);
  }
  return res.json();
}

export async function updateMeetSpaceAccess(
  accessToken: string,
  spaceName: string,
  accessType: MeetAccessType
): Promise<MeetSpace> {
  const res = await fetch(
    `${MEET_API_BASE}/${spaceName}?updateMask=config.accessType`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: { accessType },
      }),
    }
  );
  if (!res.ok) {
    throw await parseMeetError(res);
  }
  return res.json();
}

export async function endActiveMeetConference(
  accessToken: string,
  spaceName: string
): Promise<void> {
  const res = await fetch(`${MEET_API_BASE}/${spaceName}:endActiveConference`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw await parseMeetError(res);
  }
}

export async function listConferenceRecords(
  accessToken: string
): Promise<ConferenceRecord[]> {
  const res = await fetch(`${MEET_API_BASE}/conferenceRecords?pageSize=12`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw await parseMeetError(res);
  }
  const data = await res.json();
  return Array.isArray(data.conferenceRecords) ? data.conferenceRecords : [];
}
