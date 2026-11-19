/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Search,
  FolderPlus,
  Upload,
  Trash2,
  ExternalLink,
  FileText,
  Folder,
  Code2,
  AlertTriangle,
  Eye,
  X,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/LanguageContext';
import { VirtualFile } from '../../types/engine';
import {
  DriveFileItem,
  GoogleDriveApiError,
  createDriveFolder,
  deleteDriveFile,
  downloadDriveFileContent,
  listDriveFiles,
  uploadTextFileToDrive,
} from '../../services/googleDrive';

interface GoogleDrivePanelProps {
  activeFile?: VirtualFile | null;
  onOpenFileInEditor?: (file: { name: string; content: string }) => void;
}

type DriveTypeFilter = 'ALL' | 'FOLDERS' | 'FILES';

type PendingDriveAction =
  | { type: 'uploadActiveFile'; fileName: string; content: string }
  | { type: 'createFolder'; folderName: string }
  | { type: 'deleteFile'; fileId: string; fileName: string };

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({
  activeFile,
  onOpenFileInEditor,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const {
    user,
    keepSignedInOnDevice,
    setKeepSignedInOnDevice,
    googleDriveAccessToken,
    authError,
    signInWithGoogleDrive,
    clearGoogleDriveAccessToken,
  } = useAuth();

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<DriveTypeFilter>('ALL');
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [apiError, setApiError] = useState<{ message: string; status?: number } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingDriveAction | null>(null);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof GoogleDriveApiError) {
        if (err.status === 401) {
          clearGoogleDriveAccessToken();
        } else if (err.status === 403) {
          const lower = err.message.toLowerCase();
          if (lower.includes('insufficient') || lower.includes('scope')) {
            clearGoogleDriveAccessToken();
          }
          setApiError({
            status: 403,
            message: isTr
              ? 'Google Drive erişim izni reddedildi (403). Drive kapsamlarını yeniden onaylayın veya farklı bir Google hesabıyla giriş yapın.'
              : 'Google Drive access denied (403). Please re-authorize Drive scopes or sign in with another Google account.',
          });
          return;
        }
        setApiError({ message: err.message, status: err.status });
      } else if (err instanceof Error) {
        setApiError({ message: err.message });
      } else {
        setApiError({
          message: isTr ? 'Google Drive isteği başarısız oldu.' : 'Google Drive request failed.',
        });
      }
    },
    [clearGoogleDriveAccessToken, isTr]
  );

  const loadFiles = useCallback(
    async (queryOverride?: string) => {
      if (!googleDriveAccessToken) return;
      setIsLoading(true);
      setApiError(null);
      try {
        const list = await listDriveFiles(
          googleDriveAccessToken,
          queryOverride !== undefined ? queryOverride : searchQuery
        );
        setFiles(list);
        setSelectedFile((prev) => {
          if (prev && list.some((f) => f.id === prev.id)) return prev;
          return list[0] ?? null;
        });
      } catch (err) {
        handleApiError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [googleDriveAccessToken, searchQuery, handleApiError]
  );

  useEffect(() => {
    if (googleDriveAccessToken) {
      loadFiles();
    } else {
      setFiles([]);
      setSelectedFile(null);
      setPreviewContent(null);
    }
  }, [googleDriveAccessToken, loadFiles]);

  const isTextPreviewable = (file: DriveFileItem) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    if (isFolder) return false;
    return (
      file.mimeType.startsWith('text/') ||
      file.mimeType.includes('json') ||
      file.mimeType.includes('javascript') ||
      file.mimeType.includes('typescript') ||
      file.mimeType === 'application/vnd.google-apps.document' ||
      /\.(ts|tsx|js|jsx|rs|py|go|cpp|c|md|txt|json|sql|html|css)$/i.test(file.name)
    );
  };

  const handleInspectFile = async (file: DriveFileItem) => {
    setSelectedFile(file);
    setPreviewContent(null);
    if (!googleDriveAccessToken || !isTextPreviewable(file)) return;
    setIsLoadingPreview(true);
    try {
      const content = await downloadDriveFileContent(googleDriveAccessToken, file);
      setPreviewContent(content);
    } catch {
      setPreviewContent(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleImportToEditor = async (file: DriveFileItem) => {
    if (!googleDriveAccessToken || !onOpenFileInEditor) return;
    setOpeningFileId(file.id);
    setApiError(null);
    setStatusNotice(null);
    try {
      const content = await downloadDriveFileContent(googleDriveAccessToken, file);
      const safeName = file.name.includes('.') ? file.name : `${file.name}.txt`;
      onOpenFileInEditor({ name: safeName, content });
      setStatusNotice(
        isTr ? `"${file.name}" editörde açıldı.` : `Opened "${file.name}" in editor.`
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      setOpeningFileId(null);
    }
  };

  const executePendingAction = async () => {
    if (!pendingAction || !googleDriveAccessToken) return;
    setIsMutating(true);
    setApiError(null);
    setStatusNotice(null);

    try {
      if (pendingAction.type === 'uploadActiveFile') {
        const created = await uploadTextFileToDrive(
          googleDriveAccessToken,
          pendingAction.fileName,
          pendingAction.content
        );
        setFiles((prev) => [created, ...prev]);
        setSelectedFile(created);
        setStatusNotice(
          isTr
            ? `"${created.name}" Google Drive'a yüklendi.`
            : `Uploaded "${created.name}" to Google Drive.`
        );
      } else if (pendingAction.type === 'createFolder') {
        const folder = await createDriveFolder(
          googleDriveAccessToken,
          pendingAction.folderName
        );
        setFiles((prev) => [folder, ...prev]);
        setSelectedFile(folder);
        setIsAddingFolder(false);
        setNewFolderName('');
        setStatusNotice(
          isTr ? `"${folder.name}" klasörü oluşturuldu.` : `Created folder "${folder.name}".`
        );
      } else if (pendingAction.type === 'deleteFile') {
        await deleteDriveFile(googleDriveAccessToken, pendingAction.fileId);
        setFiles((prev) => prev.filter((f) => f.id !== pendingAction.fileId));
        if (selectedFile?.id === pendingAction.fileId) {
          setSelectedFile(null);
          setPreviewContent(null);
        }
        setStatusNotice(
          isTr
            ? `"${pendingAction.fileName}" Google Drive'dan silindi.`
            : `Deleted "${pendingAction.fileName}" from Google Drive.`
        );
      }
      setPendingAction(null);
    } catch (err) {
      handleApiError(err);
      setPendingAction(null);
    } finally {
      setIsMutating(false);
    }
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = Number(bytesStr);
    if (Number.isNaN(bytes) || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatModified = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const filteredFiles = files.filter((file) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    if (typeFilter === 'FOLDERS') return isFolder;
    if (typeFilter === 'FILES') return !isFolder;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200 font-showcase-body select-none overflow-hidden relative">
      {!googleDriveAccessToken ? (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="max-w-lg w-full bg-[#111115] border border-zinc-800/80 rounded-2xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <Cloud className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-showcase-display text-xl font-bold text-white">
                {isTr ? 'Google Drive Çalışma Alanı' : 'Google Drive Workspace'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {user && keepSignedInOnDevice
                  ? isTr
                    ? `Bu cihazda ${user.email || user.displayName} hesabı açık. DevFeed hizmetlerine erişimi sürdürmek için tek tıkla doğrulayın.`
                    : `Signed in on this device as ${user.email || user.displayName}. Resume Workspace access in one click.`
                  : isTr
                  ? 'Drive dosyalarınızı listeleyin, kod ve belgeleri önizleyip tek tıkla editöre aktarın, klasör oluşturun veya aktif dosyanızı Drive hesabınıza yükleyin.'
                  : 'Sign in with Google to browse files, preview code or documents, open files directly in ViraCode Editor, and upload active code.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => signInWithGoogleDrive()}
                className="gsi-material-button"
                aria-label="Sign in with Google"
              >
                <div className="gsi-material-button-state" />
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => signInWithGoogleDrive({ forceSelectAccount: true })}
                className="px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-red-400" />
                <span>{isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}</span>
              </button>
            </div>

            <div className="flex justify-center">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedInOnDevice}
                  onChange={(e) => setKeepSignedInOnDevice(e.target.checked)}
                  className="rounded accent-red-500 cursor-pointer"
                />
                <span>{isTr ? 'Bu cihazda oturumu açık tut' : 'Keep session open on this device'}</span>
              </label>
            </div>

            {(authError || apiError) && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-left text-xs font-mono text-red-200">
                {authError || apiError?.message}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Toolbar */}
          <div className="px-6 py-3.5 bg-[#0e0e12] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadFiles();
                }}
                className="flex items-center bg-[#09090b] border border-zinc-800 focus-within:border-red-500 rounded-lg px-3 py-2 flex-1 max-w-md"
              >
                <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTr ? 'Google Drive dosyalarında ara...' : 'Search Google Drive files...'}
                  className="bg-transparent border-none outline-none text-xs text-white w-full"
                />
              </form>

              <div className="flex items-center bg-[#09090b] border border-zinc-800 rounded-lg p-1 shrink-0">
                {(
                  [
                    { id: 'ALL', label: isTr ? 'Tümü' : 'All' },
                    { id: 'FOLDERS', label: isTr ? 'Klasörler' : 'Folders' },
                    { id: 'FILES', label: isTr ? 'Dosyalar' : 'Files' },
                  ] as Array<{ id: DriveTypeFilter; label: string }>
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                      typeFilter === tab.id
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {activeFile && (
                <button
                  type="button"
                  onClick={() =>
                    setPendingAction({
                      type: 'uploadActiveFile',
                      fileName: activeFile.name,
                      content: activeFile.content,
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isTr ? `Yükle: ${activeFile.name}` : `Upload: ${activeFile.name}`}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAddingFolder((prev) => !prev)}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isTr ? 'Yeni Klasör' : 'New Folder'}</span>
              </button>
              <button
                type="button"
                onClick={() => loadFiles()}
                disabled={isLoading}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer disabled:opacity-50"
                title={isTr ? 'Yenile' : 'Refresh'}
                aria-label="Refresh Drive"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isAddingFolder && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFolderName.trim()) return;
                setPendingAction({
                  type: 'createFolder',
                  folderName: newFolderName.trim(),
                });
              }}
              className="px-6 py-3 bg-[#111115] border-b border-zinc-800/80 flex items-center space-x-2 shrink-0"
            >
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={isTr ? 'Yeni klasör adı...' : 'New folder name...'}
                className="flex-1 max-w-sm bg-[#09090b] border border-zinc-700 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isTr ? 'Oluştur' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingFolder(false);
                  setNewFolderName('');
                }}
                className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {apiError && (
            <div className="mx-6 mt-4 p-3.5 bg-red-950/60 border border-red-700/60 rounded-xl text-xs font-mono text-red-200 space-y-2 shrink-0">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="break-words">{apiError.message}</span>
              </div>
              {apiError.status === 403 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => signInWithGoogleDrive()}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-sans font-semibold cursor-pointer"
                  >
                    {isTr ? 'Yetkileri Yenile' : 'Refresh Permissions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => signInWithGoogleDrive({ forceSelectAccount: true })}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-sans font-medium cursor-pointer"
                  >
                    {isTr ? 'Farklı Hesapla Giriş' : 'Use Another Account'}
                  </button>
                </div>
              )}
            </div>
          )}

          {statusNotice && (
            <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-xs font-mono text-emerald-300 shrink-0">
              {statusNotice}
            </div>
          )}

          {/* Main 2-Column Split: Data Table + File Inspector */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] overflow-hidden">
            {/* Structured Files Table */}
            <div className="overflow-y-auto border-b lg:border-b-0 lg:border-r border-zinc-800/80">
              {isLoading ? (
                <div className="text-center py-12 text-xs font-mono text-zinc-500">
                  {isTr ? 'Drive dosyaları yükleniyor...' : 'Loading Drive files...'}
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-14 text-sm text-zinc-500 px-6">
                  {isTr ? 'Google Drive üzerinde eşleşen dosya bulunamadı.' : 'No Drive files found.'}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#0d0d11] border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-6 font-medium">{isTr ? 'Dosya Adı' : 'Name'}</th>
                      <th className="py-2.5 px-3 font-medium hidden sm:table-cell">{isTr ? 'Tür' : 'Type'}</th>
                      <th className="py-2.5 px-3 font-medium text-right">{isTr ? 'Boyut' : 'Size'}</th>
                      <th className="py-2.5 px-3 font-medium text-right hidden md:table-cell">
                        {isTr ? 'Düzenleme' : 'Modified'}
                      </th>
                      <th className="py-2.5 px-6 font-medium text-right">{isTr ? 'İşlemler' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {filteredFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const canOpenInEditor = isTextPreviewable(file);
                      const isSelected = selectedFile?.id === file.id;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => handleInspectFile(file)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-red-600/10' : 'hover:bg-[#111115]'
                          }`}
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {isFolder ? (
                                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-red-400 shrink-0" />
                              )}
                              <span className="font-medium text-zinc-100 truncate max-w-[260px]">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-zinc-400 font-mono text-[11px] hidden sm:table-cell truncate max-w-[160px]">
                            {isFolder ? (isTr ? 'Klasör' : 'Folder') : file.mimeType.split('.').pop()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-400 tabular-nums whitespace-nowrap">
                            {isFolder ? '—' : formatSize(file.size)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-500 tabular-nums whitespace-nowrap hidden md:table-cell">
                            {formatModified(file.modifiedTime)}
                          </td>
                          <td
                            className="py-3 px-6 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center space-x-1">
                              {canOpenInEditor && onOpenFileInEditor && (
                                <button
                                  type="button"
                                  onClick={() => handleImportToEditor(file)}
                                  disabled={openingFileId === file.id}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                                  title={isTr ? 'Editörde Aç' : 'Open in Editor'}
                                  aria-label={isTr ? 'Editörde Aç' : 'Open in Editor'}
                                >
                                  <Code2
                                    className={`w-3.5 h-3.5 ${
                                      openingFileId === file.id ? 'animate-pulse' : ''
                                    }`}
                                  />
                                </button>
                              )}
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                  title={isTr ? 'Drive\'da Görüntüle' : 'Open in Drive'}
                                  aria-label={isTr ? 'Drive\'da Görüntüle' : 'Open in Drive'}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({
                                    type: 'deleteFile',
                                    fileId: file.id,
                                    fileName: file.name,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title={isTr ? 'Dosyayı Sil' : 'Delete File'}
                                aria-label={isTr ? 'Dosyayı Sil' : 'Delete File'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right File Inspector & Content Preview */}
            <aside className="bg-[#0c0c0f] flex flex-col overflow-hidden">
              {selectedFile ? (
                <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
                  <div className="space-y-1 border-b border-zinc-800/80 pb-4 shrink-0">
                    <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono">
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                      <span>{isTr ? 'Dosya Ayrıntıları' : 'File Inspector'}</span>
                    </div>
                    <h3 className="font-showcase-display text-base font-bold text-white break-words">
                      {selectedFile.name}
                    </h3>
                  </div>

                  <dl className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs shrink-0">
                    <dt className="text-zinc-500">{isTr ? 'MIME Türü' : 'MIME Type'}</dt>
                    <dd className="font-mono text-zinc-300 truncate text-right" title={selectedFile.mimeType}>
                      {selectedFile.mimeType}
                    </dd>
                    <dt className="text-zinc-500">{isTr ? 'Boyut' : 'Size'}</dt>
                    <dd className="font-mono text-zinc-300 tabular-nums text-right">
                      {formatSize(selectedFile.size)}
                    </dd>
                    <dt className="text-zinc-500">{isTr ? 'Son Değişiklik' : 'Modified'}</dt>
                    <dd className="font-mono text-zinc-300 tabular-nums text-right">
                      {formatModified(selectedFile.modifiedTime)}
                    </dd>
                  </dl>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {isTextPreviewable(selectedFile) && onOpenFileInEditor && (
                      <button
                        type="button"
                        onClick={() => handleImportToEditor(selectedFile)}
                        disabled={openingFileId === selectedFile.id}
                        className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{isTr ? 'Editörde Aç' : 'Open in Editor'}</span>
                      </button>
                    )}
                    {selectedFile.webViewLink && (
                      <a
                        href={selectedFile.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium inline-flex items-center justify-center space-x-1.5"
                      >
                        <span>{isTr ? 'Drive\'da Aç' : 'Open in Drive'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800/80 pt-4">
                    <div className="text-xs font-medium text-zinc-400 mb-2 shrink-0">
                      {isTr ? 'İçerik Önizleme' : 'Content Preview'}
                    </div>
                    <div className="flex-1 bg-[#09090b] border border-zinc-800 rounded-xl p-3 overflow-auto">
                      {isLoadingPreview ? (
                        <div className="text-xs font-mono text-zinc-500">
                          {isTr ? 'İçerik okunuyor...' : 'Loading preview...'}
                        </div>
                      ) : previewContent !== null ? (
                        <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                          {previewContent.slice(0, 6000)}
                        </pre>
                      ) : (
                        <div className="text-xs text-zinc-500">
                          {isTr
                            ? 'Bu dosya türü için satır içi metin önizlemesi kullanılamıyor.'
                            : 'Inline text preview is not available for this file type.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-500 space-y-2">
                  <Cloud className="w-7 h-7 text-zinc-700" />
                  <p>
                    {isTr
                      ? 'Ayrıntı ve içerik önizlemesi için listeden bir öğe seçin.'
                      : 'Select any item from the list to inspect metadata and preview contents.'}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* Mandatory Confirmation Modal */}
      {pendingAction && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111115] border border-zinc-700 rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-semibold text-white">
              {pendingAction.type === 'uploadActiveFile' &&
                (isTr
                  ? `"${pendingAction.fileName}" dosyası Google Drive hesabınıza yüklensin mi?`
                  : `Upload "${pendingAction.fileName}" to your Google Drive?`)}
              {pendingAction.type === 'createFolder' &&
                (isTr
                  ? `Google Drive içinde "${pendingAction.folderName}" klasörü oluşturulsun mu?`
                  : `Create folder "${pendingAction.folderName}" in Google Drive?`)}
              {pendingAction.type === 'deleteFile' &&
                (isTr
                  ? `"${pendingAction.fileName}" Google Drive'dan kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`
                  : `Permanently delete "${pendingAction.fileName}" from Google Drive? This action cannot be undone.`)}
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isMutating}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                {isTr ? 'İptal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executePendingAction}
                disabled={isMutating}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isMutating
                  ? isTr
                    ? 'İşleniyor...'
                    : 'Working...'
                  : pendingAction.type === 'deleteFile'
                    ? isTr
                      ? 'Sil'
                      : 'Delete'
                    : isTr
                      ? 'Onayla'
                      : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
