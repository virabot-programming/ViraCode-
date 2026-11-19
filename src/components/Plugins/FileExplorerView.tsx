import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Copy, 
  Eye, 
  Binary, 
  FileText, 
  Check,
  HardDrive
} from 'lucide-react';
import { VirtualFile, ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';

interface FileExplorerViewProps {
  workspace: ProjectWorkspace;
  activeFile: VirtualFile;
  onSelectFile: (file: VirtualFile) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (path: string) => void;
  onDuplicateFile: (path: string) => void;
  onExportFile: (file: VirtualFile) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  workspace,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onDuplicateFile,
  onExportFile,
}) => {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInspectFile, setSelectedInspectFile] = useState<VirtualFile>(activeFile);
  const [showHexView, setShowHexView] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const filteredFiles = workspace.files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate Hex representation of file text
  const generateHexDump = (content: string) => {
    const bytes = Array.from(content).slice(0, 192); // First 192 bytes
    const rows = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = chunk
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      const ascii = chunk
        .map((c) => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126 ? c : '.'))
        .join('');
      const offset = i.toString(16).padStart(4, '0').toUpperCase();
      rows.push({ offset, hex, ascii });
    }
    return rows;
  };

  const hexRows = generateHexDump(selectedInspectFile.content);

  // Simulated SHA-256 hash
  const fileHash = `0x${Array.from(selectedInspectFile.name + selectedInspectFile.content.slice(0, 32))
    .reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)
    .toString(16)
    .padStart(16, '7f')
    .toUpperCase()}`;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName('');
    setShowNewFileModal(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#080b11] text-[#c9d1d9] font-sans overflow-hidden p-4 gap-4">
      {/* Left Column: File Tree & Search */}
      <div className="w-full md:w-80 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              {language === 'tr' ? 'Dosya Gezgini' : 'File Explorer'}
            </span>
          </div>

          <button
            onClick={() => setShowNewFileModal(true)}
            className="p-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 cursor-pointer"
            title="Yeni Dosya"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'tr' ? 'Dosya veya yol ara...' : 'Search files...'}
            className="w-full bg-black/60 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 outline-none focus:border-cyan-500/80"
          />
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedInspectFile.path === file.path;
            const isCurrentActive = activeFile.path === file.path;

            return (
              <div
                key={file.path}
                onClick={() => setSelectedInspectFile(file)}
                className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 shadow-sm'
                    : 'hover:bg-zinc-800/60 border border-transparent text-zinc-300'
                }`}
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <div className="truncate text-xs font-mono">
                    <span className="font-medium">{file.name}</span>
                    <span className="text-[10px] text-zinc-500 ml-1.5">({file.size} B)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFile(file);
                    }}
                    className="p-1 hover:text-cyan-300 text-zinc-400"
                    title="Editörde Aç"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportFile(file);
                    }}
                    className="p-1 hover:text-cyan-300 text-zinc-400"
                    title="İndir"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  {workspace.files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.path);
                      }}
                      className="p-1 hover:text-rose-400 text-zinc-400"
                      title="Sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Directory Stats Footer */}
        <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <span>{workspace.files.length} dosya</span>
          <span>{workspace.files.reduce((sum, f) => sum + f.size, 0)} Bayt</span>
        </div>
      </div>

      {/* Right Column: Deep File Inspector & Hex Viewer */}
      <div className="flex-1 flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 overflow-hidden">
        {/* Inspector Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-3 mb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white font-mono">{selectedInspectFile.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
                {selectedInspectFile.language.toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">{selectedInspectFile.path}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setShowHexView(!showHexView)}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                showHexView 
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-200' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Binary className="w-3.5 h-3.5 text-purple-400" />
              <span>{showHexView ? 'Hex Görünümünü Kapat' : 'Hex / İkili Görünüm'}</span>
            </button>

            <button
              onClick={() => onSelectFile(selectedInspectFile)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{language === 'tr' ? 'Editörde Aç' : 'Open in Editor'}</span>
            </button>
          </div>
        </div>

        {/* File Metadata Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-zinc-500 block">Dosya Boyutu</span>
            <span className="text-xs font-mono font-bold text-zinc-200">{selectedInspectFile.size} Bayt</span>
          </div>
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-zinc-500 block">Satır Sayısı</span>
            <span className="text-xs font-mono font-bold text-zinc-200">{selectedInspectFile.content.split('\n').length} Satır</span>
          </div>
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-zinc-500 block">Karmaşıklık</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{selectedInspectFile.complexityScore || 'O(1)'}</span>
          </div>
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-zinc-500 block">Test Kapsamı</span>
            <span className="text-xs font-mono font-bold text-emerald-400">%{selectedInspectFile.testCoverage || 100}</span>
          </div>
        </div>

        {/* SHA-256 Checksum */}
        <div className="bg-black/40 border border-zinc-800/80 rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-zinc-500">SHA-256:</span>
            <span className="text-cyan-400 truncate">{fileHash}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(fileHash);
              setCopiedHash(true);
              setTimeout(() => setCopiedHash(false), 2000);
            }}
            className="hover:text-white"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Content Viewer: Raw or Hex Dump */}
        <div className="flex-1 bg-black/70 border border-zinc-800 rounded-lg p-3 overflow-y-auto font-mono text-xs">
          {showHexView ? (
            <div className="space-y-1">
              <div className="text-[11px] text-zinc-500 border-b border-zinc-800 pb-1 mb-2 flex justify-between font-bold">
                <span>OFFSET</span>
                <span className="pl-4">HEX RAW BYTES (00-0F)</span>
                <span>ASCII DECODE</span>
              </div>
              {hexRows.map((row, i) => (
                <div key={i} className="flex justify-between text-[11px] leading-tight">
                  <span className="text-purple-400">{row.offset}</span>
                  <span className="text-cyan-300 font-mono tracking-wider">{row.hex}</span>
                  <span className="text-emerald-400">{row.ascii}</span>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {selectedInspectFile.content}
            </pre>
          )}
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full max-w-sm space-y-3 shadow-2xl">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {language === 'tr' ? 'Yeni Dosya Oluştur' : 'Create New File'}
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="ornek_modul.rs / util.go / index.ts"
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 outline-none focus:border-cyan-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
