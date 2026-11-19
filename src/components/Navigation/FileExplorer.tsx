/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { VirtualFile, ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { 
  Folder, 
  FolderPlus,
  FilePlus,
  FileCode, 
  Search, 
  Trash2, 
  Check, 
  X,
  Edit2,
  HardDrive,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Minimize2,
  PanelLeftClose,
  Palette
} from 'lucide-react';
import { FOLDER_ICON_OPTIONS, renderFolderOrProjectIcon } from './FolderIconHelper';

interface FileExplorerProps {
  workspace: ProjectWorkspace;
  activeFile: VirtualFile | null;
  onSelectFile: (file: VirtualFile) => void;
  onNewFile: (folderPath?: string) => void;
  onDeleteFile?: (path: string) => void;
  onCreateCustomFile?: (name: string, targetFolder?: string) => void;
  onRenameFile?: (oldPath: string, newName: string) => void;
  onCreateFolder?: (folderPath: string) => void;
  onRenameFolder?: (oldFolderPath: string, newFolderPath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
  onRenameProject?: (newProjectName: string) => void;
  onChangeProjectIcon?: (iconId: string) => void;
  onChangeFolderIcon?: (folderPath: string, iconId: string) => void;
  onOpenLocalFolder?: () => void;
  onImportFolderFromInput?: (files: FileList) => void;
  onRefresh?: () => void;
  onCollapse?: () => void;
}

// Visual Studio icon color per file extension
function getFileColor(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rs':
      return 'text-amber-500';
    case 'go':
      return 'text-cyan-400';
    case 'ts':
    case 'tsx':
      return 'text-blue-400';
    case 'js':
    case 'jsx':
      return 'text-yellow-400';
    case 'py':
      return 'text-emerald-400';
    case 'json':
      return 'text-amber-300';
    case 'toml':
    case 'yaml':
    case 'yml':
      return 'text-red-400';
    case 'md':
      return 'text-purple-400';
    case 'hcl':
    case 'tf':
      return 'text-indigo-400';
    case 'dockerfile':
      return 'text-sky-400';
    default:
      return 'text-zinc-400';
  }
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  file?: VirtualFile;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  workspace,
  activeFile,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onCreateCustomFile,
  onRenameFile,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameProject,
  onChangeProjectIcon,
  onChangeFolderIcon,
  onOpenLocalFolder,
  onImportFolderFromInput,
  onRefresh,
  onCollapse,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  // Inline creation states
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [creatingTargetFolder, setCreatingTargetFolder] = useState<string>('');
  const [creationInput, setCreationInput] = useState<string>('');

  // Project rename & icon picker state
  const [isRenamingProject, setIsRenamingProject] = useState<boolean>(false);
  const [projectNameInput, setProjectNameInput] = useState<string>(workspace.name);
  const [iconPickerTarget, setIconPickerTarget] = useState<'__project__' | string | null>(null);

  // Folder rename state
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [folderRenameInput, setFolderRenameInput] = useState<string>('');

  // File rename state
  const [renamingFilePath, setRenamingFilePath] = useState<string | null>(null);
  const [fileRenameInput, setFileRenameInput] = useState<string>('');

  const directoryInputRef = useRef<HTMLInputElement>(null);

  // Build tree from files & explicit folders
  const fileTree = useMemo(() => {
    const root: TreeNode = {
      name: '',
      path: '',
      isFolder: true,
      children: [],
    };

    // 1. Add explicit empty folders if any
    (workspace.folders || []).forEach((fPath) => {
      const parts = fPath.split('/').filter(Boolean);
      let curr = root;
      let currPath = '';
      for (const part of parts) {
        currPath = currPath ? `${currPath}/${part}` : part;
        let found = curr.children.find((c) => c.isFolder && c.name === part);
        if (!found) {
          found = {
            name: part,
            path: currPath,
            isFolder: true,
            children: [],
          };
          curr.children.push(found);
        }
        curr = found;
      }
    });

    // 2. Add files
    workspace.files.forEach((file) => {
      const parts = file.path.split('/').filter(Boolean);
      let curr = root;
      let currPath = '';

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        currPath = currPath ? `${currPath}/${part}` : part;
        let found = curr.children.find((c) => c.isFolder && c.name === part);
        if (!found) {
          found = {
            name: part,
            path: currPath,
            isFolder: true,
            children: [],
          };
          curr.children.push(found);
        }
        curr = found;
      }

      const fileName = parts[parts.length - 1] || file.name;
      curr.children.push({
        name: fileName,
        path: file.path,
        isFolder: false,
        file: file,
        children: [],
      });
    });

    // Sort: folders first (alphabetical), then files (alphabetical)
    function sortNodes(node: TreeNode) {
      node.children.sort((a, b) => {
        if (a.isFolder === b.isFolder) {
          return a.name.localeCompare(b.name);
        }
        return a.isFolder ? -1 : 1;
      });
      node.children.forEach(sortNodes);
    }
    sortNodes(root);

    return root.children;
  }, [workspace.files, workspace.folders]);

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const collapseAllFolders = () => {
    const allFolders = new Set<string>();
    function collect(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.isFolder) {
          allFolders.add(n.path);
          collect(n.children);
        }
      }
    }
    collect(fileTree);
    setCollapsedFolders(allFolders);
  };

  const handleStartCreate = (type: 'file' | 'folder', folderPath: string = '') => {
    setCreatingType(type);
    setCreatingTargetFolder(folderPath);
    setCreationInput('');
    if (folderPath && collapsedFolders.has(folderPath)) {
      toggleFolder(folderPath);
    }
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = creationInput.trim();
    if (!cleanName) {
      setCreatingType(null);
      return;
    }

    if (creatingType === 'file') {
      if (onCreateCustomFile) {
        onCreateCustomFile(cleanName, creatingTargetFolder);
      } else {
        onNewFile(creatingTargetFolder);
      }
    } else if (creatingType === 'folder' && onCreateFolder) {
      const fullPath = creatingTargetFolder
        ? `${creatingTargetFolder}/${cleanName}`
        : cleanName;
      onCreateFolder(fullPath);
    }

    setCreatingType(null);
    setCreationInput('');
  };

  const handleSaveProjectName = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectNameInput.trim() && onRenameProject) {
      onRenameProject(projectNameInput.trim());
    }
    setIsRenamingProject(false);
  };

  const handleStartRenameFolder = (folderPath: string, currentName: string) => {
    setRenamingFolder(folderPath);
    setFolderRenameInput(currentName);
  };

  const handleConfirmRenameFolder = (e: React.FormEvent, oldFolderPath: string) => {
    e.preventDefault();
    const newName = folderRenameInput.trim();
    if (newName && onRenameFolder) {
      const parts = oldFolderPath.split('/');
      parts[parts.length - 1] = newName;
      const newFolderPath = parts.join('/');
      onRenameFolder(oldFolderPath, newFolderPath);
    }
    setRenamingFolder(null);
  };

  const handleStartRenameFile = (file: VirtualFile) => {
    setRenamingFilePath(file.path);
    setFileRenameInput(file.name);
  };

  const handleConfirmRenameFile = (e: React.FormEvent, oldPath: string) => {
    e.preventDefault();
    if (fileRenameInput.trim() && onRenameFile) {
      onRenameFile(oldPath, fileRenameInput.trim());
    }
    setRenamingFilePath(null);
  };

  // Render tree recursively
  const renderTreeNodes = (nodes: TreeNode[], depth: number = 0) => {
    return nodes.map((node) => {
      // Search filter check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSelf = node.name.toLowerCase().includes(query);
        const matchesDescendant = (n: TreeNode): boolean =>
          n.name.toLowerCase().includes(query) ||
          n.children.some(matchesDescendant);
        if (!matchesSelf && !matchesDescendant(node)) {
          return null;
        }
      }

      if (node.isFolder) {
        const isCollapsed = collapsedFolders.has(node.path);
        const isRenamingThis = renamingFolder === node.path;

        return (
          <div key={node.path} className="flex flex-col">
            <div
              className={`group flex items-center justify-between px-1.5 py-0.5 hover:bg-[#2a2d2e] rounded-xs cursor-pointer select-none text-[11px] font-mono text-zinc-300 transition-colors ${
                isRenamingThis ? 'bg-[#2a2d2e]' : ''
              }`}
              style={{ paddingLeft: `${Math.max(6, depth * 12 + 6)}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              <div className="flex items-center space-x-1 min-w-0 flex-1">
                <span className="text-zinc-500 shrink-0">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
                <span className="shrink-0">
                  {renderFolderOrProjectIcon(workspace.folderIcons?.[node.path], !isCollapsed, 'w-3.5 h-3.5')}
                </span>

                {isRenamingThis ? (
                  <form
                    onSubmit={(e) => handleConfirmRenameFolder(e, node.path)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 flex-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={folderRenameInput}
                      onChange={(e) => setFolderRenameInput(e.target.value)}
                      onBlur={() => setRenamingFolder(null)}
                      className="bg-black border border-red-500 text-[11px] font-mono text-zinc-100 px-1 py-0 rounded outline-none w-full"
                    />
                  </form>
                ) : (
                  <span className="truncate text-zinc-200 font-medium">
                    {node.name}
                  </span>
                )}
              </div>

              {/* Folder Actions (Visible on hover) */}
              {!isRenamingThis && (
                <div
                  className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 shrink-0 pl-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onChangeFolderIcon && (
                    <button
                      type="button"
                      onClick={() => setIconPickerTarget(iconPickerTarget === node.path ? null : node.path)}
                      className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 rounded"
                      title={isTr ? 'Klasör simgesini değiştir' : 'Change folder icon'}
                      aria-label="Change folder icon"
                    >
                      <Palette className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartCreate('file', node.path)}
                    className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded"
                    title={isTr ? 'Klasör içine yeni dosya' : 'New file in folder'}
                    aria-label="New file in folder"
                  >
                    <FilePlus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCreate('folder', node.path)}
                    className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded"
                    title={isTr ? 'Alt klasör ekle' : 'New subfolder'}
                    aria-label="New subfolder"
                  >
                    <FolderPlus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartRenameFolder(node.path, node.name)}
                    className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded"
                    title={isTr ? 'Klasörü yeniden adlandır' : 'Rename folder'}
                    aria-label="Rename folder"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  {onDeleteFolder && (
                    <button
                      type="button"
                      onClick={() => onDeleteFolder(node.path)}
                      className="p-0.5 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded"
                      title={isTr ? 'Klasörü sil' : 'Delete folder'}
                      aria-label="Delete folder"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Inline Folder Icon Picker */}
            {iconPickerTarget === node.path && onChangeFolderIcon && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mx-2 my-1 p-1.5 bg-[#111115] border border-zinc-700 rounded grid grid-cols-6 gap-1 shadow-lg z-20"
              >
                {FOLDER_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeFolderIcon(node.path, opt.id);
                      setIconPickerTarget(null);
                    }}
                    className={`p-1 rounded flex items-center justify-center hover:bg-zinc-800 cursor-pointer ${
                      (workspace.folderIcons?.[node.path] || 'folder') === opt.id ? 'bg-zinc-800 ring-1 ring-red-500' : ''
                    }`}
                    title={isTr ? opt.labelTr : opt.labelEn}
                  >
                    {renderFolderOrProjectIcon(opt.id, false, 'w-3.5 h-3.5')}
                  </button>
                ))}
              </div>
            )}

            {/* Sub-tree */}
            {!isCollapsed && (
              <div className="flex flex-col">
                {/* Inline creator if creating directly inside this folder */}
                {creatingType && creatingTargetFolder === node.path && (
                  <form
                    onSubmit={handleConfirmCreate}
                    className="flex items-center space-x-1 px-1.5 py-1 bg-[#1e1e1e] border-l-2 border-[#007acc]"
                    style={{ paddingLeft: `${(depth + 1) * 12 + 6}px` }}
                  >
                    {creatingType === 'folder' ? (
                      <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <input
                      type="text"
                      autoFocus
                      placeholder={
                        creatingType === 'folder'
                          ? isTr
                            ? 'klasor_adi'
                            : 'folder_name'
                          : isTr
                          ? 'dosya.rs'
                          : 'file.rs'
                      }
                      value={creationInput}
                      onChange={(e) => setCreationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setCreatingType(null);
                      }}
                      className="bg-black border border-[#007acc] text-[11px] font-mono text-white px-1 py-0.5 rounded outline-none flex-1"
                    />
                    <button
                      type="submit"
                      className="p-0.5 text-emerald-400 hover:bg-zinc-700 rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatingType(null)}
                      className="p-0.5 text-zinc-400 hover:bg-zinc-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                )}

                {renderTreeNodes(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // File Node
      const isSelected = activeFile?.path === node.file?.path;
      const isRenamingFile = renamingFilePath === node.file?.path;

      return (
        <div
          key={node.path}
          className={`group flex items-center justify-between px-1.5 py-0.5 rounded-xs cursor-pointer select-none text-[11px] font-mono transition-colors ${
            isSelected
              ? 'bg-[#094771] text-white font-semibold'
              : 'text-zinc-300 hover:bg-[#2a2d2e] hover:text-zinc-100'
          }`}
          style={{ paddingLeft: `${Math.max(18, depth * 12 + 18)}px` }}
          onClick={() => node.file && onSelectFile(node.file)}
        >
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <FileCode
              className={`w-3.5 h-3.5 shrink-0 ${getFileColor(node.name)}`}
            />

            {isRenamingFile ? (
              <form
                onSubmit={(e) => handleConfirmRenameFile(e, node.path)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 flex-1"
              >
                <input
                  type="text"
                  autoFocus
                  value={fileRenameInput}
                  onChange={(e) => setFileRenameInput(e.target.value)}
                  onBlur={() => setRenamingFilePath(null)}
                  className="bg-black border border-[#007acc] text-[11px] font-mono text-zinc-100 px-1 py-0 rounded outline-none w-full"
                />
              </form>
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          {/* File Hover Actions */}
          {!isRenamingFile && (
            <div
              className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 shrink-0 pl-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => node.file && handleStartRenameFile(node.file)}
                className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded"
                title={isTr ? 'Yeniden adlandır' : 'Rename file'}
                aria-label="Rename file"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              {onDeleteFile && (
                <button
                  type="button"
                  onClick={() => onDeleteFile(node.path)}
                  className="p-0.5 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded"
                  title={isTr ? 'Dosyayı sil' : 'Delete file'}
                  aria-label="Delete file"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border-r border-[#2d2d2d] select-none text-zinc-300 font-sans">
      {/* Hidden WebKitDirectory input for universal fallback */}
      <input
        ref={directoryInputRef}
        type="file"
        // @ts-expect-error webkitdirectory attribute
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={(e) => {
          if (e.target.files && onImportFolderFromInput) {
            onImportFolderFromInput(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* Visual Studio Explorer Title & Tool Window Header */}
      <div className="px-2 py-1 bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between text-[11px] font-semibold text-zinc-300 uppercase tracking-wider shrink-0">
        <span className="truncate">
          {isTr ? 'Çözüm Gezgini' : 'Solution Explorer'}
        </span>

        {/* Toolbar Icons (Single accessible icons with title tooltips) */}
        <div className="flex items-center space-x-1">
          {/* New File */}
          <button
            type="button"
            onClick={() => handleStartCreate('file', '')}
            className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-white transition-colors"
            title={isTr ? 'Yeni Dosya Ekle' : 'New File'}
            aria-label="New File"
          >
            <FilePlus className="w-3.5 h-3.5 text-zinc-300" />
          </button>

          {/* New Folder */}
          <button
            type="button"
            onClick={() => handleStartCreate('folder', '')}
            className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-white transition-colors"
            title={isTr ? 'Yeni Klasör Ekle' : 'New Folder'}
            aria-label="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5 text-zinc-300" />
          </button>

          {/* Open Local Folder (Real Computer Access) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLocalFolder) {
                onOpenLocalFolder();
              } else {
                directoryInputRef.current?.click();
              }
            }}
            className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-cyan-300 transition-colors"
            title={
              isTr
                ? 'Bilgisayardan Klasör Aç (Gerçek Zamanlı)'
                : 'Open Local Folder from Computer'
            }
            aria-label="Open Local Folder"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Refresh Tree */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-white transition-colors"
            title={isTr ? 'Yenile' : 'Refresh'}
            aria-label="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
          </button>

          {/* Collapse All */}
          <button
            type="button"
            onClick={collapseAllFolders}
            className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-white transition-colors"
            title={isTr ? 'Tümünü Daralt' : 'Collapse All'}
            aria-label="Collapse All"
          >
            <Minimize2 className="w-3.5 h-3.5 text-zinc-300" />
          </button>

          {/* Collapse Sidebar */}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1 hover:bg-[#333333] rounded text-zinc-400 hover:text-white transition-colors"
              title={isTr ? 'Gezgini Kapat' : 'Close Explorer'}
              aria-label="Close Explorer"
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Project Root / Solution Header with Editable Name & Custom Icon */}
      <div className="relative px-2 py-1 bg-[#141418] border-b border-zinc-800 flex items-center justify-between group">
        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIconPickerTarget(iconPickerTarget === '__project__' ? null : '__project__')}
            className="p-0.5 hover:bg-zinc-800 rounded cursor-pointer transition-colors shrink-0"
            title={isTr ? 'Proje simgesini değiştir' : 'Change project icon'}
            aria-label="Change project icon"
          >
            {renderFolderOrProjectIcon(workspace.icon || 'box', true, 'w-3.5 h-3.5')}
          </button>

          {isRenamingProject ? (
            <form onSubmit={handleSaveProjectName} className="flex-1 flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                onBlur={() => setIsRenamingProject(false)}
                className="bg-black border border-red-500 text-[11px] font-mono text-white px-1 py-0 rounded outline-none w-full"
              />
            </form>
          ) : (
            <span
              onDoubleClick={() => setIsRenamingProject(true)}
              className="text-[11px] font-bold text-zinc-200 truncate cursor-pointer hover:underline"
              title={isTr ? 'Proje adını değiştirmek için çift tıklayın' : 'Double click to rename project'}
            >
              {workspace.name}
            </span>
          )}
        </div>

        {/* Project Icon Picker Popover */}
        {iconPickerTarget === '__project__' && onChangeProjectIcon && (
          <div className="absolute left-2 top-7 p-1.5 bg-[#111115] border border-zinc-700 rounded grid grid-cols-6 gap-1 shadow-xl z-40">
            {FOLDER_ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChangeProjectIcon(opt.id);
                  setIconPickerTarget(null);
                }}
                className={`p-1 rounded flex items-center justify-center hover:bg-zinc-800 cursor-pointer ${
                  (workspace.icon || 'box') === opt.id ? 'bg-zinc-800 ring-1 ring-red-500' : ''
                }`}
                title={isTr ? opt.labelTr : opt.labelEn}
              >
                {renderFolderOrProjectIcon(opt.id, false, 'w-3.5 h-3.5')}
              </button>
            ))}
          </div>
        )}

        {/* Rename Project Button */}
        {!isRenamingProject && onRenameProject && (
          <button
            type="button"
            onClick={() => {
              setProjectNameInput(workspace.name);
              setIsRenamingProject(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded"
            title={isTr ? 'Proje adını değiştir' : 'Rename project'}
            aria-label="Rename project"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
        )}

        {/* Local Disk Indicator Badge */}
        {workspace.isLocalDisk && (
          <span
            className="ml-1 px-1 py-0.2 bg-emerald-950/80 border border-emerald-600/50 text-[9px] text-emerald-300 font-mono rounded shrink-0"
            title={isTr ? 'Gerçek bilgisayar klasörü bağlı' : 'Live local disk directory'}
          >
            LOCAL
          </span>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-1.5 bg-[#181818] border-b border-[#282828]">
        <div className="flex items-center bg-[#252526] border border-[#3c3c3c] focus-within:border-[#007acc] rounded px-1.5 py-0.5">
          <Search className="w-3 h-3 text-zinc-500 mr-1 shrink-0" />
          <input
            type="text"
            placeholder={isTr ? 'Dosya veya klasör ara...' : 'Search files or folders...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] text-zinc-200 placeholder-zinc-500 w-full font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* File & Folder Tree Container */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5 text-[11px] font-mono">
        {/* Inline Creator for Root level */}
        {creatingType && !creatingTargetFolder && (
          <form
            onSubmit={handleConfirmCreate}
            className="flex items-center space-x-1 px-2 py-1 bg-[#1e1e1e] border-l-2 border-[#007acc] mb-1"
          >
            {creatingType === 'folder' ? (
              <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
            )}
            <input
              type="text"
              autoFocus
              placeholder={
                creatingType === 'folder'
                  ? isTr
                    ? 'klasor_adi'
                    : 'folder_name'
                  : isTr
                  ? 'yeni_dosya.rs'
                  : 'new_file.rs'
              }
              value={creationInput}
              onChange={(e) => setCreationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setCreatingType(null);
              }}
              className="bg-black border border-[#007acc] text-[11px] font-mono text-white px-1 py-0.5 rounded outline-none flex-1"
            />
            <button
              type="submit"
              className="p-0.5 text-emerald-400 hover:bg-zinc-700 rounded cursor-pointer"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setCreatingType(null)}
              className="p-0.5 text-zinc-400 hover:bg-zinc-700 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        )}

        {/* Tree Content */}
        {fileTree.length === 0 ? (
          <div className="p-3 text-center text-zinc-500 text-xs">
            {isTr
              ? 'Klasör boş. Dosya veya yerel klasör ekleyin.'
              : 'Folder is empty. Add a file or open a local folder.'}
          </div>
        ) : (
          renderTreeNodes(fileTree)
        )}
      </div>

      {/* Visual Studio Bottom Status / Local Directory Quick Icon Button */}
      <div className="px-2 py-1.5 bg-[#111115] border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
        <span className="truncate">
          {workspace.files.length} {isTr ? 'dosya' : 'files'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (onOpenLocalFolder) {
              onOpenLocalFolder();
            } else {
              directoryInputRef.current?.click();
            }
          }}
          className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 rounded cursor-pointer transition-colors"
          title={isTr ? 'Bilgisayardaki klasörü bağla' : 'Connect folder on computer'}
          aria-label="Open Local Folder"
        >
          <HardDrive className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
