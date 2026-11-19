export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export class GoogleDriveApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleDriveApiError';
    this.status = status;
  }
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

async function parseDriveError(res: Response): Promise<GoogleDriveApiError> {
  let msg = `Google Drive API error (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error?.message) {
      msg = body.error.message;
    }
  } catch {
    // keep status fallback
  }
  return new GoogleDriveApiError(msg, res.status);
}

export async function listDriveFiles(
  accessToken: string,
  searchQuery?: string
): Promise<DriveFileItem[]> {
  const params = new URLSearchParams();
  params.set('pageSize', '30');
  params.set('fields', 'files(id,name,mimeType,modifiedTime,size,webViewLink)');
  params.set('orderBy', 'folder,modifiedTime desc');

  const trimmed = searchQuery?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    params.set('q', `trashed = false and name contains '${escaped}'`);
  } else {
    params.set('q', 'trashed = false');
  }

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw await parseDriveError(res);
  }
  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
}

export async function downloadDriveFileContent(
  accessToken: string,
  file: DriveFileItem
): Promise<string> {
  const isGoogleDoc = file.mimeType.startsWith('application/vnd.google-apps.');
  const url = isGoogleDoc
    ? `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=text/plain`
    : `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw await parseDriveError(res);
  }
  return res.text();
}

export async function uploadTextFileToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFileItem> {
  const boundary = 'viracode_drive_multipart_boundary';
  const metadata = JSON.stringify({
    name: fileName,
    mimeType,
  });

  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!res.ok) {
    throw await parseDriveError(res);
  }
  return res.json();
}

export async function createDriveFolder(
  accessToken: string,
  folderName: string
): Promise<DriveFileItem> {
  const res = await fetch(
    `${DRIVE_API_BASE}/files?fields=id,name,mimeType,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName.trim(),
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
  if (!res.ok) {
    throw await parseDriveError(res);
  }
  return res.json();
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw await parseDriveError(res);
  }
}
