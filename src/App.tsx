/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { ProjectWorkspace, VirtualFile } from './types/engine';
import { CodeEditor } from './components/Editor/CodeEditor';
import { VirtualDebugger } from './components/Runtime/VirtualDebugger';
import { QuantumWorkspace } from './components/Quantum/QuantumWorkspace';
import { DatabaseEditor } from './components/Database/DatabaseEditor';
import { FileExplorer } from './components/Navigation/FileExplorer';
import { LeftHomePanel } from './components/Navigation/LeftHomePanel';
import { ActivityBar, LeftSidebarToolType } from './components/Navigation/ActivityBar';
import { RightSidebar, RightSidebarTool } from './components/Navigation/RightSidebar';
import { GitBoxIIRepo } from './components/GitBox/GitBoxIIStudio';
import { FOLDER_ICON_OPTIONS, renderFolderOrProjectIcon } from './components/Navigation/FolderIconHelper';
import { StartupSplashLoader } from './components/Branding/StartupSplashLoader';
import { CopyrightsPage } from './components/Branding/CopyrightsPage';
import { ViraCodeLogo } from './components/Branding/ViraCodeLogo';
import { VbpDevFeedWorkspace, DevFeedTab } from './components/Workspace/VbpDevFeedWorkspace';
import { HelpCenterModal } from './components/Help/HelpCenterModal';
import { ReleaseNotesModal } from './components/Release/ReleaseNotesModal';
import { RubberDuckStation } from './components/RubberDuck/RubberDuckStation';
import { ViraBotPanel } from './components/AI/ViraBotPanel';
import { executeCodeLive } from './services/codeRunner';
import { PluginManifest } from './types/plugins';
import { PluginsPanel, DEFAULT_BUILTIN_PLUGINS } from './components/Plugins/PluginsPanel';
import { renderPluginIcon } from './components/Plugins/PluginIconHelper';
import { SystemMonitorView } from './components/Plugins/SystemMonitorView';
import { MathProgrammingView } from './components/Plugins/MathProgrammingView';
import { AdvancedTerminalView } from './components/Plugins/AdvancedTerminalView';
import { 
  openLocalDirectory, 
  readDirectoryFromInput, 
  saveFileToDisk, 
  createFolderOnDisk,
  detectLanguage
} from './services/localFileSystem';
import { useI18n } from './i18n/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { 
  FileCode, 
  FilePlus,
  Terminal as TerminalIcon, 
  Play, 
  ArrowLeft, 
  X,
  Plus,
  Check,
  Search,
  HardDrive,
  FolderPlus,
  PanelLeftClose,
  PanelRightClose,
  Cpu,
  Bot,
  HelpCircle,
  Edit3,
  GitCommit,
  Home,
  Copyright,
  PinOff,
  Puzzle,
  Database,
  PlayCircle,
  LogIn,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_EMPTY_PROJECTS: ProjectWorkspace[] = [
  {
    id: 'default-project',
    name: 'Default Project',
    icon: 'box',
    folderIcons: {},
    tagline: 'Clean Modular Workspace',
    paradigm: 'Polyglot Systems & Apps',
    rootPath: '/Default Project',
    primaryLanguage: 'typescript',
    targetArch: 'x86_64-avx512',
    files: [],
    folders: [],
    manifestFile: '',
    dependencies: {},
    architecture: SAMPLE_PROJECTS[0].architecture,
    sastIssues: [],
    perfMetrics: [],
    testSuites: [],
    deployment: SAMPLE_PROJECTS[0].deployment,
    memoryMetrics: { heapMb: 12, stackKb: 32, allocsPerSec: 0, leaksDetected: 0, gcPauseMs: 0.1 },
  },
  {
    id: 'sources',
    name: 'Sources',
    icon: 'code',
    folderIcons: {},
    tagline: 'Source Modules Repository',
    paradigm: 'Polyglot Source Library',
    rootPath: '/Sources',
    primaryLanguage: 'rust',
    targetArch: 'x86_64-avx512',
    files: [],
    folders: [],
    manifestFile: '',
    dependencies: {},
    architecture: SAMPLE_PROJECTS[0].architecture,
    sastIssues: [],
    perfMetrics: [],
    testSuites: [],
    deployment: SAMPLE_PROJECTS[0].deployment,
    memoryMetrics: { heapMb: 12, stackKb: 32, allocsPerSec: 0, leaksDetected: 0, gcPauseMs: 0.1 },
  },
];

export default function App() {
  const { language } = useI18n();
  const isTr = language === 'tr';
  const { user, signInWithGoogle, signOutUser } = useAuth();

  // Boot & Splash Screen State
  const [isBooting, setIsBooting] = useState<boolean>(true);

  // Workspace Name, New Project Folder & Icon Picker State
  const [isEditingWsName, setIsEditingWsName] = useState<boolean>(false);
  const [editingWsNameText, setEditingWsNameText] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [newProjectNameText, setNewProjectNameText] = useState<string>('');
  const [isProjectIconPickerOpen, setIsProjectIconPickerOpen] = useState<boolean>(false);
  const [isAddingTabFile, setIsAddingTabFile] = useState<boolean>(false);
  const [newTabFileName, setNewTabFileName] = useState<string>('');
  const [isCreatingEmptyFile, setIsCreatingEmptyFile] = useState<boolean>(false);
  const [emptyNewFileName, setEmptyNewFileName] = useState<string>('');

  // Workspaces state: start cleanly with empty Default Project & Sources
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>(DEFAULT_EMPTY_PROJECTS);
  const [activeWsId, setActiveWsId] = useState<string>('default-project');
  const currentWorkspace = workspaces.find((w) => w.id === activeWsId) || workspaces[0];

  // Active file & open tabs (empty by default until user creates or opens a file)
  const [activeFile, setActiveFile] = useState<VirtualFile | null>(null);
  const [openFiles, setOpenFiles] = useState<VirtualFile[]>([]);

  // Dual Sidebar States: Left & Right
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viracode_center_mode') !== 'devfeed';
    } catch {
      return true;
    }
  });
  const [activeLeftTool, setActiveLeftTool] = useState<LeftSidebarToolType>('explorer');

  // Right sidebar defaults to File Properties ('properties') FIRST
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viracode_center_mode') !== 'devfeed';
    } catch {
      return true;
    }
  });
  const [activeRightTool, setActiveRightTool] = useState<RightSidebarTool>('properties');

  // Center Stage Mode: By default 'editor', restoring DevFeed if user was actively in DevFeed on this device.
  const [centerMode, setCenterMode] = useState<'editor' | 'database' | 'quantum' | 'home' | 'copyrights' | 'devfeed'>(() => {
    try {
      const saved = localStorage.getItem('viracode_center_mode');
      return saved === 'devfeed' ? 'devfeed' : 'editor';
    } catch {
      return 'editor';
    }
  });
  const [devFeedInitialTab, setDevFeedInitialTab] = useState<DevFeedTab>(() => {
    try {
      const saved = localStorage.getItem('viracode_devfeed_active_tab') as DevFeedTab | null;
      return saved && ['overview', 'googlechat', 'gmail', 'googledrive', 'googlemeet'].includes(saved)
        ? saved
        : 'overview';
    } catch {
      return 'overview';
    }
  });
  const preHomeSidebarsRef = useRef<{ left: boolean; right: boolean; bottom: boolean } | null>(
    (() => {
      try {
        return localStorage.getItem('viracode_center_mode') === 'devfeed'
          ? { left: true, right: true, bottom: true }
          : null;
      } catch {
        return null;
      }
    })()
  );

  // Modals & Assistant States
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);
  const [isDuckStationOpen, setIsDuckStationOpen] = useState<boolean>(false);
  const [isViraBotOpen, setIsViraBotOpen] = useState<boolean>(false);

  // Bottom Output/Terminal Dock State
  const [isBottomDockOpen, setIsBottomDockOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viracode_center_mode') !== 'devfeed';
    } catch {
      return true;
    }
  });
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ViraCode IDE [Version 5.0.0 - Modular Edition]',
    '(c) VBP. All rights reserved.',
    'System Invariants Verified: Memory Safe (0 leaks), AVX-512 Ready.',
  ]);

  // Search in files query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Unified Plugins State (Built-in + Custom JSON/Form Plugins with per-plugin Pinning)
  const [plugins, setPlugins] = useState<PluginManifest[]>(() => {
    try {
      const customRaw = localStorage.getItem('viracode_custom_plugins');
      const customList: PluginManifest[] = customRaw ? JSON.parse(customRaw) : [];

      const prefsRaw = localStorage.getItem('viracode_builtin_plugin_prefs');
      const prefs: Record<string, { isEnabled?: boolean; isPinned?: boolean }> = prefsRaw
        ? JSON.parse(prefsRaw)
        : {};

      const mergedBuiltins = DEFAULT_BUILTIN_PLUGINS.map((bp) => ({
        ...bp,
        isEnabled: typeof prefs[bp.id]?.isEnabled === 'boolean' ? prefs[bp.id].isEnabled! : bp.isEnabled,
        isPinned: typeof prefs[bp.id]?.isPinned === 'boolean' ? prefs[bp.id].isPinned! : Boolean(bp.isPinned),
      }));

      return [...customList, ...mergedBuiltins];
    } catch {
      return DEFAULT_BUILTIN_PLUGINS;
    }
  });

  const handlePluginsChange = (updated: PluginManifest[]) => {
    setPlugins(updated);
    try {
      const customOnes = updated.filter((p) => !p.isBuiltin);
      localStorage.setItem('viracode_custom_plugins', JSON.stringify(customOnes));

      const builtinPrefs: Record<string, { isEnabled: boolean; isPinned: boolean }> = {};
      updated
        .filter((p) => p.isBuiltin)
        .forEach((p) => {
          builtinPrefs[p.id] = {
            isEnabled: p.isEnabled,
            isPinned: Boolean(p.isPinned),
          };
        });
      localStorage.setItem('viracode_builtin_plugin_prefs', JSON.stringify(builtinPrefs));
    } catch {}
  };

  const pinnedPlugins = plugins.filter((p) => p.isEnabled && p.isPinned);

  // Resizable dimension states
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('viracode_left_sidebar_width');
      return saved ? Math.max(180, Math.min(500, parseInt(saved, 10))) : 260;
    } catch (e) {
      return 260;
    }
  });

  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('viracode_right_sidebar_width');
      return saved ? Math.max(220, Math.min(650, parseInt(saved, 10))) : 360;
    } catch (e) {
      return 360;
    }
  });

  const [terminalHeight, setTerminalHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('viracode_terminal_height');
      return saved ? Math.max(60, Math.min(450, parseInt(saved, 10))) : 140;
    } catch (e) {
      return 140;
    }
  });

  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  const [isDraggingTerminal, setIsDraggingTerminal] = useState<boolean>(false);

  // Synchronize active file & multi-file tabs when workspace changes
  useEffect(() => {
    if (currentWorkspace.files.length > 0) {
      const nextFile = currentWorkspace.files[0];
      setActiveFile(nextFile);
      setOpenFiles(currentWorkspace.files.slice(0, 6));
    } else {
      setActiveFile(null);
      setOpenFiles([]);
    }
  }, [activeWsId]);

  // Window drag event listeners for resizing both sidebars & bottom dock
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(180, Math.min(600, e.clientX - 48));
        setLeftSidebarWidth(newWidth);
        try {
          localStorage.setItem('viracode_left_sidebar_width', newWidth.toString());
        } catch (err) {}
      } else if (isDraggingRight) {
        const newWidth = Math.max(220, Math.min(700, window.innerWidth - e.clientX));
        setRightSidebarWidth(newWidth);
        try {
          localStorage.setItem('viracode_right_sidebar_width', newWidth.toString());
        } catch (err) {}
      } else if (isDraggingTerminal) {
        const newHeight = Math.max(60, Math.min(window.innerHeight - 150, window.innerHeight - e.clientY - 30));
        setTerminalHeight(newHeight);
        try {
          localStorage.setItem('viracode_terminal_height', newHeight.toString());
        } catch (err) {}
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) setIsDraggingLeft(false);
      if (isDraggingRight) setIsDraggingRight(false);
      if (isDraggingTerminal) setIsDraggingTerminal(false);
    };

    if (isDraggingLeft || isDraggingRight || isDraggingTerminal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingTerminal ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft, isDraggingRight, isDraggingTerminal]);

  // Persist active DevFeed center mode on this device
  useEffect(() => {
    try {
      localStorage.setItem('viracode_center_mode', centerMode === 'devfeed' ? 'devfeed' : 'editor');
    } catch {
      // Ignore storage errors
    }
  }, [centerMode]);

  // Full-stage (Home / Copyrights / VBP DevFeed) & return-to-editor handlers
  const handleReturnToEditor = () => {
    if ((centerMode === 'home' || centerMode === 'copyrights' || centerMode === 'devfeed') && preHomeSidebarsRef.current) {
      setIsLeftSidebarOpen(preHomeSidebarsRef.current.left);
      setIsRightSidebarOpen(preHomeSidebarsRef.current.right);
      setIsBottomDockOpen(preHomeSidebarsRef.current.bottom);
      preHomeSidebarsRef.current = null;
    }
    setCenterMode('editor');
  };

  const handleOpenHome = () => {
    if (centerMode === 'home') {
      handleReturnToEditor();
      return;
    }
    if (centerMode !== 'copyrights' && centerMode !== 'devfeed') {
      preHomeSidebarsRef.current = {
        left: isLeftSidebarOpen,
        right: isRightSidebarOpen,
        bottom: isBottomDockOpen,
      };
    }
    setCenterMode('home');
    setIsRightSidebarOpen(false);
    setIsLeftSidebarOpen(false);
    setIsBottomDockOpen(false);
  };

  const handleOpenCopyrights = () => {
    if (centerMode === 'copyrights') {
      handleReturnToEditor();
      return;
    }
    if (centerMode !== 'home' && centerMode !== 'devfeed') {
      preHomeSidebarsRef.current = {
        left: isLeftSidebarOpen,
        right: isRightSidebarOpen,
        bottom: isBottomDockOpen,
      };
    }
    setCenterMode('copyrights');
    setIsRightSidebarOpen(false);
    setIsLeftSidebarOpen(false);
    setIsBottomDockOpen(false);
  };

  const handleOpenDevFeed = (initialTab?: DevFeedTab) => {
    if (centerMode === 'devfeed' && !initialTab) {
      handleReturnToEditor();
      return;
    }
    if (centerMode !== 'home' && centerMode !== 'copyrights' && centerMode !== 'devfeed') {
      preHomeSidebarsRef.current = {
        left: isLeftSidebarOpen,
        right: isRightSidebarOpen,
        bottom: isBottomDockOpen,
      };
    }
    if (initialTab) {
      setDevFeedInitialTab(initialTab);
    }
    setCenterMode('devfeed');
    setIsRightSidebarOpen(false);
    setIsLeftSidebarOpen(false);
    setIsBottomDockOpen(false);
  };

  // File selection
  const handleSelectFile = (file: VirtualFile) => {
    if (!file || !file.path) return;
    setActiveFile(file);
    setOpenFiles((prev) => {
      const clean = prev.filter((f): f is VirtualFile => Boolean(f && f.path));
      return clean.some((f) => f.path === file.path) ? clean : [...clean, file];
    });
    setCenterMode('editor');
  };

  const handleCloseTab = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = openFiles.filter(
      (f): f is VirtualFile => Boolean(f && f.path && f.path !== filePath)
    );
    setOpenFiles(updated);
    if (activeFile?.path === filePath) {
      if (updated.length > 0) {
        setActiveFile(updated[updated.length - 1]);
      } else {
        setActiveFile(null);
      }
    }
  };

  // Real-time File Content Update (with live disk write if local folder is connected)
  const handleUpdateFileContent = async (newContent: string) => {
    if (!activeFile) return;
    const updatedFiles = currentWorkspace.files.map((f) =>
      f.path === activeFile.path ? { ...f, content: newContent, size: newContent.length } : f
    );
    const updatedWs = { ...currentWorkspace, files: updatedFiles };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
    setActiveFile({ ...activeFile, content: newContent, size: newContent.length });
    setOpenFiles((prev) =>
      prev
        .filter((f): f is VirtualFile => Boolean(f && f.path))
        .map((f) =>
          f.path === activeFile.path ? { ...f, content: newContent, size: newContent.length } : f
        )
    );

    // Live Local Disk Sync
    if (currentWorkspace.isLocalDisk && currentWorkspace.dirHandle) {
      const saved = await saveFileToDisk(currentWorkspace.dirHandle, activeFile.path, newContent);
      if (saved) {
        setTerminalLogs((prev) => [
          ...prev,
          `💾 [Yerel Diske Kaydedildi] ${activeFile.path}`,
        ]);
      }
    }
  };

  // Real Local Folder Access (File System Access API)
  const handleOpenLocalFolder = async () => {
    try {
      setTerminalLogs((prev) => [
        ...prev,
        isTr ? '📂 Bilgisayardan yerel klasör seçimi bekleniyor...' : '📂 Opening local directory dialog...',
      ]);

      const result = await openLocalDirectory();
      if (!result.files || result.files.length === 0) {
        setTerminalLogs((prev) => [
          ...prev,
          isTr ? '⚠️ Seçilen klasör boş veya okunabilir dosya bulunamadı.' : '⚠️ Selected directory is empty.',
        ]);
        return;
      }

      const newWsId = `local-${Date.now()}`;
      const newWs: ProjectWorkspace = {
        id: newWsId,
        name: result.folderName,
        tagline: isTr ? 'Bilgisayardaki Gerçek Klasör' : 'Real Local Folder on Computer',
        paradigm: 'Local File System Sync',
        rootPath: `/${result.folderName}`,
        primaryLanguage: result.files[0]?.language || 'typescript',
        targetArch: 'Local Host System',
        files: result.files,
        folders: result.folders,
        isLocalDisk: true,
        dirHandle: result.dirHandle,
        manifestFile: result.files.find((f) => f.name.includes('config') || f.name.includes('Cargo') || f.name.includes('package'))?.name || '',
        dependencies: {},
        architecture: SAMPLE_PROJECTS[0].architecture,
        sastIssues: [],
        perfMetrics: [],
        testSuites: [],
        deployment: SAMPLE_PROJECTS[0].deployment,
        memoryMetrics: { heapMb: 32, stackKb: 64, allocsPerSec: 0, leaksDetected: 0, gcPauseMs: 0.1 },
      };

      setWorkspaces([newWs, ...workspaces]);
      setActiveWsId(newWs.id);
      setActiveFile(result.files[0]);
      setOpenFiles([result.files[0]]);
      setCenterMode('editor');

      setTerminalLogs((prev) => [
        ...prev,
        `✅ [Yerel Disk Bağlandı] "${result.folderName}" klasörü ${result.files.length} dosya ile yüklendi.`,
      ]);

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      } catch (e) {}
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setTerminalLogs((prev) => [
          ...prev,
          `❌ [Hata] ${err.message}`,
        ]);
      }
    }
  };

  // Fallback Directory Input Handler
  const handleImportFolderFromInput = async (files: FileList) => {
    try {
      const result = await readDirectoryFromInput(files);
      if (result.files.length === 0) return;

      const newWsId = `import-${Date.now()}`;
      const newWs: ProjectWorkspace = {
        id: newWsId,
        name: result.folderName,
        tagline: 'Imported Directory',
        paradigm: 'Imported System',
        rootPath: `/${result.folderName}`,
        primaryLanguage: result.files[0]?.language || 'typescript',
        targetArch: 'Local Host System',
        files: result.files,
        folders: result.folders,
        manifestFile: '',
        dependencies: {},
        architecture: SAMPLE_PROJECTS[0].architecture,
        sastIssues: [],
        perfMetrics: [],
        testSuites: [],
        deployment: SAMPLE_PROJECTS[0].deployment,
        memoryMetrics: { heapMb: 32, stackKb: 64, allocsPerSec: 0, leaksDetected: 0, gcPauseMs: 0.1 },
      };

      setWorkspaces([newWs, ...workspaces]);
      setActiveWsId(newWs.id);
      setActiveFile(result.files[0]);
      setOpenFiles([result.files[0]]);
      setCenterMode('editor');
    } catch (e: any) {
      console.warn('Import failed:', e);
    }
  };

  // Create / Open New Project Folder from Top Bar (starts clean & empty)
  const handleCreateNewProject = (projectName: string) => {
    const cleanName = projectName.trim();
    if (!cleanName) return;

    const newWsId = `project-${Date.now()}`;
    const newWs: ProjectWorkspace = {
      id: newWsId,
      name: cleanName,
      icon: 'folder',
      folderIcons: {},
      tagline: isTr ? 'Yeni Proje Klasörü' : 'New Project Folder',
      paradigm: 'Modular TypeScript & Systems',
      rootPath: `/${cleanName}`,
      primaryLanguage: 'typescript',
      targetArch: 'x86_64-avx512',
      files: [],
      folders: [],
      manifestFile: '',
      dependencies: {},
      architecture: SAMPLE_PROJECTS[0].architecture,
      sastIssues: [],
      perfMetrics: [],
      testSuites: [],
      deployment: SAMPLE_PROJECTS[0].deployment,
      memoryMetrics: { heapMb: 16, stackKb: 32, allocsPerSec: 0, leaksDetected: 0, gcPauseMs: 0.1 },
    };

    setWorkspaces((prev) => [newWs, ...prev]);
    setActiveWsId(newWs.id);
    setActiveFile(null);
    setOpenFiles([]);
    setCenterMode('editor');
    setTerminalLogs((prev) => [
      ...prev,
      `📁 [Yeni Proje Klasörü] "${cleanName}" oluşturuldu ve açıldı.`,
    ]);
  };

  // Change Project Icon
  const handleChangeProjectIcon = (iconId: string) => {
    const updatedWs = { ...currentWorkspace, icon: iconId };
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
  };

  // Change Folder Icon inside Project
  const handleChangeFolderIcon = (folderPath: string, iconId: string) => {
    const updatedFolderIcons = { ...(currentWorkspace.folderIcons || {}), [folderPath]: iconId };
    const updatedWs = { ...currentWorkspace, folderIcons: updatedFolderIcons };
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
  };

  // Project Rename
  const handleRenameProject = (newName: string) => {
    const updatedWs = { ...currentWorkspace, name: newName };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
    setTerminalLogs((prev) => [
      ...prev,
      `🏷️ Proje adı "${newName}" olarak güncellendi.`,
    ]);
  };

  // Folder Creation
  const handleCreateFolder = async (folderPath: string) => {
    const existingFolders = currentWorkspace.folders || [];
    if (existingFolders.includes(folderPath)) return;

    const updatedFolders = [...existingFolders, folderPath];
    const updatedWs = { ...currentWorkspace, folders: updatedFolders };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));

    if (currentWorkspace.isLocalDisk && currentWorkspace.dirHandle) {
      await createFolderOnDisk(currentWorkspace.dirHandle, folderPath);
    }

    setTerminalLogs((prev) => [
      ...prev,
      `📁 Yeni klasör oluşturuldu: ${folderPath}`,
    ]);
  };

  // Folder Rename
  const handleRenameFolder = (oldFolderPath: string, newFolderPath: string) => {
    const oldPrefix = `${oldFolderPath}/`;
    const newPrefix = `${newFolderPath}/`;

    const updatedFiles = currentWorkspace.files.map((f) => {
      if (f.path.startsWith(oldPrefix)) {
        const subPath = f.path.slice(oldPrefix.length);
        const updatedPath = `${newPrefix}${subPath}`;
        return { ...f, path: updatedPath };
      }
      return f;
    });

    const updatedFolders = (currentWorkspace.folders || []).map((f) => {
      if (f === oldFolderPath) return newFolderPath;
      if (f.startsWith(oldPrefix)) {
        return `${newPrefix}${f.slice(oldPrefix.length)}`;
      }
      return f;
    });

    const updatedWs = { ...currentWorkspace, files: updatedFiles, folders: updatedFolders };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));

    setTerminalLogs((prev) => [
      ...prev,
      `📁 Klasör yeniden adlandırıldı: ${oldFolderPath} -> ${newFolderPath}`,
    ]);
  };

  // Folder Delete
  const handleDeleteFolder = (folderPath: string) => {
    const prefix = `${folderPath}/`;
    const updatedFiles = currentWorkspace.files.filter((f) => !f.path.startsWith(prefix));
    const updatedFolders = (currentWorkspace.folders || []).filter(
      (f) => f !== folderPath && !f.startsWith(prefix)
    );

    const updatedWs = { ...currentWorkspace, files: updatedFiles, folders: updatedFolders };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));

    setTerminalLogs((prev) => [
      ...prev,
      `🗑️ Klasör silindi: ${folderPath}`,
    ]);
  };

  // File Creation (supports optional initialContent for SQL/QPU exports & opens as tab)
  const handleCreateCustomFile = async (name: string, targetFolder?: string, initialContent?: string) => {
    const fullPath = targetFolder ? `${targetFolder}/${name}` : name;
    const existing = currentWorkspace.files.find((f) => f.path === fullPath);
    if (existing) {
      const updatedExisting =
        initialContent !== undefined
          ? { ...existing, content: initialContent, size: initialContent.length, modifiedAt: new Date().toLocaleTimeString() }
          : existing;
      if (initialContent !== undefined) {
        const updatedFiles = currentWorkspace.files.map((f) =>
          f.path === fullPath ? updatedExisting : f
        );
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === currentWorkspace.id ? { ...w, files: updatedFiles } : w))
        );
      }
      setActiveFile(updatedExisting);
      setOpenFiles((prev) => {
        if (prev.some((f) => f.path === fullPath)) {
          return prev.map((f) => (f.path === fullPath ? updatedExisting : f));
        }
        return [...prev, updatedExisting];
      });
      setCenterMode('editor');
      return;
    }

    const lang = detectLanguage(name);
    const content = initialContent ?? `// ${name}\n\n`;
    const newFile: VirtualFile = {
      path: fullPath,
      name: name,
      language: lang,
      content,
      size: content.length,
      modifiedAt: new Date().toLocaleTimeString(),
      astNodes: [],
      symbolCount: 1,
      complexityScore: 'O(1)',
      testCoverage: 100,
    };

    const updatedFiles = [...currentWorkspace.files, newFile];
    const updatedWs = { ...currentWorkspace, files: updatedFiles };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
    setActiveFile(newFile);
    setOpenFiles((prev) => [...prev, newFile]);
    setCenterMode('editor');

    if (currentWorkspace.isLocalDisk && currentWorkspace.dirHandle) {
      await saveFileToDisk(currentWorkspace.dirHandle, fullPath, newFile.content);
    }

    setTerminalLogs((prev) => [...prev, `📄 Dosya oluşturuldu: ${fullPath}`]);
  };

  // File Rename
  const handleRenameFile = async (oldPath: string, newName: string) => {
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');

    const updatedFiles = currentWorkspace.files.map((f) =>
      f.path === oldPath ? { ...f, path: newPath, name: newName, language: detectLanguage(newName) } : f
    );

    const updatedWs = { ...currentWorkspace, files: updatedFiles };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));

    if (activeFile?.path === oldPath) {
      setActiveFile({ ...activeFile, path: newPath, name: newName, language: detectLanguage(newName) });
    }

    setOpenFiles((prev) =>
      prev
        .filter((f): f is VirtualFile => Boolean(f && f.path))
        .map((f) =>
          f.path === oldPath ? { ...f, path: newPath, name: newName, language: detectLanguage(newName) } : f
        )
    );

    setTerminalLogs((prev) => [...prev, `📄 Dosya yeniden adlandırıldı: ${oldPath} -> ${newPath}`]);
  };

  // File Delete
  const handleDeleteFile = (path: string) => {
    const updatedFiles = currentWorkspace.files.filter((f) => f.path !== path);
    const updatedWs = { ...currentWorkspace, files: updatedFiles };
    setWorkspaces(workspaces.map((w) => (w.id === updatedWs.id ? updatedWs : w)));

    const remainingOpen = openFiles.filter(
      (f): f is VirtualFile => Boolean(f && f.path && f.path !== path)
    );
    setOpenFiles(remainingOpen);

    if (activeFile?.path === path) {
      if (remainingOpen.length > 0) {
        setActiveFile(remainingOpen[remainingOpen.length - 1]);
      } else {
        setActiveFile(null);
      }
    }

    setTerminalLogs((prev) => [...prev, `🗑️ Dosya silindi: ${path}`]);
  };

  // Fork from GitBox II
  const handleForkGitBoxRepo = (repo: GitBoxIIRepo) => {
    const newWsId = `fork-${repo.id}-${Date.now()}`;
    const mappedFiles: VirtualFile[] = (repo.files || [])
      .filter((f): f is NonNullable<typeof f> => Boolean(f && f.path))
      .map((f) => ({
        path: f.path,
        name: f.name || f.path.split('/').pop() || 'file',
        language: (f.language || 'typescript') as any,
        content: typeof f.content === 'string' ? f.content : '',
        size: typeof f.content === 'string' ? f.content.length : 0,
        modifiedAt: new Date().toLocaleTimeString(),
        astNodes: [],
        symbolCount: 15,
        complexityScore: 'O(1)',
        testCoverage: 100,
      }));

    const newWs: ProjectWorkspace = {
      id: newWsId,
      name: repo.name,
      tagline: repo.description,
      paradigm: 'Distributed Concurrent & Autonomous',
      rootPath: `/app/${repo.name}`,
      primaryLanguage: repo.primaryLanguage as any,
      targetArch: 'x86_64-avx512',
      manifestFile: repo.primaryLanguage === 'rust' ? 'Cargo.toml' : 'package.json',
      dependencies: { tokio: '1.38', serde: '1.0' },
      architecture: SAMPLE_PROJECTS[0].architecture,
      sastIssues: [],
      perfMetrics: [],
      testSuites: [],
      deployment: SAMPLE_PROJECTS[0].deployment,
      files: mappedFiles,
      memoryMetrics: { heapMb: 45, stackKb: 64, allocsPerSec: 120, leaksDetected: 0, gcPauseMs: 0.4 },
    };

    const firstFile = newWs.files[0] || null;
    setWorkspaces((prev) => [newWs, ...prev]);
    setActiveWsId(newWs.id);
    setActiveFile(firstFile);
    setOpenFiles(firstFile ? [firstFile] : []);
    setCenterMode('editor');

    setTerminalLogs((prev) => [
      ...prev,
      `📦 [GitBox II] "${repo.name}" başarıyla fork edildi ve çalışma alanına aktarıldı.`,
    ]);
  };

  // Real Code Execution Engine (JS, TS, Python, Rust, Go, C++, etc.)
  const handleRunCode = async () => {
    if (!activeFile) {
      setIsBottomDockOpen(true);
      setTerminalLogs((prev) => [
        ...prev,
        isTr ? '⚠️ Çalıştırmak için önce bir kod dosyası açın veya oluşturun.' : '⚠️ Open or create a code file before running.',
      ]);
      return;
    }

    setIsRunningCode(true);
    setIsBottomDockOpen(true);
    const lang = activeFile.language;

    setTerminalLogs((prev) => [
      ...prev,
      `------ [ViraCode Kernel v5.0.0 - Real Execution] Yürütülüyor: ${activeFile.path} (${lang}) ------`,
    ]);

    const result = await executeCodeLive(activeFile.content, lang);

    setTerminalLogs((prev) => [
      ...prev,
      ...result.logs.map((l) => `[Out] ${l}`),
      `========== [Süreç Bitti] Durum: ${result.success ? 'BAŞARILI' : 'HATA'} | Süre: ${result.executionTimeMs}ms ==========`,
    ]);

    setIsRunningCode(false);

    if (result.success) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-300 font-sans antialiased selection:bg-red-600/40 selection:text-red-100">
      {/* ViraCode Startup Boot Loading Animation */}
      {isBooting && (
        <StartupSplashLoader
          onFinish={() => setIsBooting(false)}
          minDurationMs={1800}
        />
      )}

      {/* ViraCode Sleek Dark Top Header Bar */}
      <header className="h-8 shrink-0 bg-[#111115] border-b border-zinc-800/80 flex items-center justify-between px-2 select-none text-xs z-30 shadow-xs">
        {/* Left: ViraCode Brand & Solution Selector */}
        <div className="flex items-center space-x-2 min-w-0">
          <div 
            onClick={() => setIsBooting(true)}
            className="flex items-center space-x-1.5 text-white font-bold shrink-0 cursor-pointer group"
            title={isTr ? 'Yükleme efektini tekrar oynat' : 'Replay boot animation'}
          >
            <ViraCodeLogo
              size="xs"
              className="group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold tracking-wider text-[11px] font-mono text-white flex items-center space-x-1">
              <span>VIRACODE IDE</span>
              <span className="text-[9px] px-1 py-0 bg-red-950 text-red-400 border border-red-800/50 rounded font-normal hidden sm:inline">v5.0.0</span>
            </span>
          </div>

          <div className="h-3.5 w-px bg-zinc-800 hidden sm:block" />

          {/* Active Workspace Selector, Project Icon Picker, Rename & New Project Folder */}
          <div className="flex items-center space-x-1 font-mono relative">
            {/* Project Icon Picker Trigger */}
            <button
              type="button"
              onClick={() => setIsProjectIconPickerOpen((prev) => !prev)}
              className="p-1 bg-[#0c0c0e] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded cursor-pointer transition-colors"
              title={isTr ? 'Proje klasör simgesini değiştir' : 'Change project folder icon'}
              aria-label="Change Project Icon"
            >
              {renderFolderOrProjectIcon(currentWorkspace.icon || 'box', true, 'w-3.5 h-3.5')}
            </button>

            {isProjectIconPickerOpen && (
              <div className="absolute left-0 top-8 p-1.5 bg-[#111115] border border-zinc-700 rounded grid grid-cols-6 gap-1 shadow-2xl z-50">
                {FOLDER_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      handleChangeProjectIcon(opt.id);
                      setIsProjectIconPickerOpen(false);
                    }}
                    className={`p-1 rounded flex items-center justify-center hover:bg-zinc-800 cursor-pointer ${
                      (currentWorkspace.icon || 'box') === opt.id ? 'bg-zinc-800 ring-1 ring-red-500' : ''
                    }`}
                    title={isTr ? opt.labelTr : opt.labelEn}
                  >
                    {renderFolderOrProjectIcon(opt.id, false, 'w-3.5 h-3.5')}
                  </button>
                ))}
              </div>
            )}

            <select
              value={activeWsId}
              onChange={(e) => setActiveWsId(e.target.value)}
              className="bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-600 text-[11px] text-zinc-200 rounded px-1.5 py-0.5 outline-none cursor-pointer font-mono"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.isLocalDisk ? '💾 ' : ''}
                  {w.name}
                </option>
              ))}
            </select>

            {/* Editable Folder/Project Name */}
            {isEditingWsName ? (
              <input
                type="text"
                autoFocus
                value={editingWsNameText}
                onChange={(e) => setEditingWsNameText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingWsNameText.trim()) handleRenameProject(editingWsNameText.trim());
                    setIsEditingWsName(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingWsName(false);
                  }
                }}
                onBlur={() => {
                  if (editingWsNameText.trim()) handleRenameProject(editingWsNameText.trim());
                  setIsEditingWsName(false);
                }}
                className="bg-black border border-red-500 text-white text-[11px] font-mono rounded px-1.5 py-0.5 outline-none w-28"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingWsNameText(currentWorkspace.name);
                  setIsEditingWsName(true);
                }}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors cursor-pointer"
                title={isTr ? 'Klasör / Proje adını değiştir' : 'Rename folder / project name'}
                aria-label="Rename Folder Name"
              >
                <Edit3 className="w-3 h-3 text-red-400" />
              </button>
            )}

            {/* Create / Open New Project Folder from Top Bar */}
            {isCreatingProject ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newProjectNameText.trim()) {
                    handleCreateNewProject(newProjectNameText.trim());
                  }
                  setIsCreatingProject(false);
                  setNewProjectNameText('');
                }}
                className="flex items-center space-x-1"
              >
                <input
                  type="text"
                  autoFocus
                  value={newProjectNameText}
                  onChange={(e) => setNewProjectNameText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsCreatingProject(false);
                      setNewProjectNameText('');
                    }
                  }}
                  placeholder={isTr ? 'yeni_proje' : 'new_project'}
                  className="bg-black border border-red-500 text-white text-[11px] font-mono rounded px-1.5 py-0.5 outline-none w-28"
                />
                <button
                  type="submit"
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded border border-zinc-700 cursor-pointer"
                  title={isTr ? 'Oluştur ve Aç' : 'Create & Open'}
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProject(false);
                    setNewProjectNameText('');
                  }}
                  className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded border border-zinc-700 cursor-pointer"
                  title={isTr ? 'İptal' : 'Cancel'}
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNewProjectNameText('');
                  setIsCreatingProject(true);
                }}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded cursor-pointer transition-colors"
                title={isTr ? 'Yeni proje klasörü oluştur / aç' : 'Create / open new project folder'}
                aria-label="New Project Folder"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>

          {/* Local Folder Open Button directly in Header */}
          <button
            type="button"
            onClick={handleOpenLocalFolder}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded cursor-pointer transition-colors"
            title={isTr ? 'Bilgisayardaki klasörü bağla' : 'Open folder on computer'}
            aria-label="Open Local Folder"
          >
            <HardDrive className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>

        {/* Center: Center Mode Indicator & Switcher */}
        <div className="flex items-center space-x-2">
          {centerMode !== 'editor' ? (
            <button
              type="button"
              onClick={handleReturnToEditor}
              className="p-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-all cursor-pointer shadow-xs active:scale-95"
              title={isTr ? 'Kod Editörüne Geri Dön' : 'Return to Code Editor'}
              aria-label="Return to Code Editor"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-zinc-400 font-mono">
              <span className="text-red-400 font-bold">{currentWorkspace.name}</span>
              {activeFile && (
                <>
                  <span>-</span>
                  <span className="text-zinc-200 font-medium">{activeFile.name}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Run & Utilities in Sleek Black/Gray Theme */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Run Code - Icon Only */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunningCode}
            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            title={isTr ? 'Gerçek Kodu Çalıştır (F5)' : 'Run Live Code (F5)'}
            aria-label="Run Code"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? 'animate-spin' : ''}`} />
          </button>

          {/* Release Timeline Trigger */}
          <button
            type="button"
            onClick={() => {
              setActiveRightTool('timeline');
              setIsRightSidebarOpen(true);
            }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isRightSidebarOpen && activeRightTool === 'timeline'
                ? 'text-red-300 bg-zinc-800 border border-red-500/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isTr ? 'Sürüm Zaman Çizelgesi (v5.0.0)' : 'Release Timeline (v5.0.0)'}
            aria-label="Release Timeline"
          >
            <GitCommit className="w-3.5 h-3.5 text-red-400" />
          </button>

          {/* ViraCode Assistant Single-Icon Trigger */}
          <button
            type="button"
            onClick={() => setIsViraBotOpen(!isViraBotOpen)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isViraBotOpen ? 'text-red-300 bg-zinc-800 border border-red-500/60' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isTr ? 'ViraCode Assistant' : 'ViraCode Assistant'}
            aria-label="ViraCode Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-red-400" />
          </button>

          {/* Rubber Duck Single-Icon Trigger */}
          <button
            type="button"
            onClick={() => setIsDuckStationOpen(true)}
            className="p-1 text-amber-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title={isTr ? 'Lastik Ördek İstasyonu' : 'Rubber Duck Station'}
            aria-label="Rubber Duck"
          >
            <span className="text-xs">🦆</span>
          </button>

          {/* Help Center */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title={isTr ? 'Yardım Merkezi' : 'Help Center'}
            aria-label="Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Terminal Bottom Dock */}
          <button
            type="button"
            onClick={() => setIsBottomDockOpen(!isBottomDockOpen)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isBottomDockOpen ? 'text-red-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isTr ? 'Terminali Aç / Kapat' : 'Toggle Terminal'}
            aria-label="Toggle Output Terminal"
          >
            <TerminalIcon className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Left Sidebar */}
          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isLeftSidebarOpen ? 'text-red-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isTr ? 'Sol Gezgini Aç/Kapat' : 'Toggle Left Sidebar'}
            aria-label="Toggle Left Sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Right Sidebar */}
          <button
            type="button"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isRightSidebarOpen ? 'text-red-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isTr ? 'Sağ Paneli Aç/Kapat' : 'Toggle Right Sidebar'}
            aria-label="Toggle Right Sidebar"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>

          {/* Google Account Sign-In / Switch / Sign-Out */}
          {user ? (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => signInWithGoogle({ forceSelectAccount: true })}
                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded transition-colors cursor-pointer text-[11px] font-mono hidden sm:inline-flex items-center"
                title={isTr ? 'Farklı Bir Hesapla Giriş Yap' : 'Sign in with a Different Account'}
                aria-label={isTr ? 'Farklı Hesap' : 'Switch Account'}
              >
                <span className="truncate max-w-[90px] hidden md:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                type="button"
                onClick={signOutUser}
                className="flex items-center space-x-1 px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded transition-colors cursor-pointer text-[11px] font-mono"
                title={`${user.email || user.displayName || ''} — ${isTr ? 'Çıkış Yap' : 'Sign Out'}`}
                aria-label={isTr ? 'Çıkış Yap' : 'Sign Out'}
              >
                <LogOut className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle({ forceSelectAccount: true })}
              className="flex items-center space-x-1 px-1.5 py-0.5 bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-red-500 rounded transition-colors cursor-pointer text-[11px] font-mono"
              title={isTr ? 'Google ile Giriş Yap' : 'Sign in with Google'}
              aria-label={isTr ? 'Google ile Giriş Yap' : 'Sign in with Google'}
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">{isTr ? 'Giriş' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body: Activity Bar + Left Sidebar + Center Stage + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Leftmost Activity Bar */}
        <ActivityBar
          activeTool={activeLeftTool}
          isLeftSidebarOpen={isLeftSidebarOpen}
          isHomeActive={centerMode === 'home'}
          onOpenHome={handleOpenHome}
          isCopyrightsActive={centerMode === 'copyrights'}
          onOpenCopyrights={handleOpenCopyrights}
          isDevFeedActive={centerMode === 'devfeed'}
          onOpenDevFeed={() => handleOpenDevFeed()}
          onSelectLeftTool={(tool) => {
            setActiveLeftTool(tool);
            setIsLeftSidebarOpen(true);
          }}
          onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          pinnedPlugins={pinnedPlugins}
        />

        {/* Left Sidebar (Solution Explorer / Search / Git) */}
        {isLeftSidebarOpen && (
          <aside
            style={{ width: `${leftSidebarWidth}px` }}
            className="shrink-0 flex flex-col h-full bg-[#09090b] border-r border-zinc-800/80 overflow-hidden relative select-none"
          >
            {activeLeftTool === 'explorer' && (
              <FileExplorer
                workspace={currentWorkspace}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onNewFile={() => handleCreateCustomFile('new_module.rs')}
                onCreateCustomFile={handleCreateCustomFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameProject={handleRenameProject}
                onChangeProjectIcon={handleChangeProjectIcon}
                onChangeFolderIcon={handleChangeFolderIcon}
                onOpenLocalFolder={handleOpenLocalFolder}
                onImportFolderFromInput={handleImportFolderFromInput}
                onRefresh={() => {
                  setTerminalLogs((prev) => [...prev, isTr ? '🔄 Gezgin yenilendi.' : '🔄 Explorer refreshed.']);
                }}
                onCollapse={() => setIsLeftSidebarOpen(false)}
              />
            )}

            {activeLeftTool === 'search' && (
              <div className="flex flex-col h-full bg-[#09090b] border-r border-zinc-800/80 p-2 text-xs font-mono">
                <div className="px-1 py-1 text-[11px] font-bold text-zinc-200 uppercase tracking-wider border-b border-zinc-800/80 mb-2 flex items-center justify-between">
                  <span>{isTr ? 'Dosyalarda Ara' : 'Search in Files'}</span>
                  <button onClick={() => setIsLeftSidebarOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer" title="Kapat">
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center bg-[#111115] border border-zinc-800 focus-within:border-red-500 rounded px-2 py-1 mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 mr-1" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={isTr ? 'Aranacak metin...' : 'Search term...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full text-xs"
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {currentWorkspace.files
                    .filter((f) => !searchQuery || f.content.toLowerCase().includes(searchQuery.toLowerCase()) || f.path.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((file) => (
                      <div
                        key={file.path}
                        onClick={() => handleSelectFile(file)}
                        className="px-2 py-1 bg-[#111115] hover:bg-zinc-800 border border-zinc-800/80 rounded cursor-pointer flex items-center justify-between text-zinc-200"
                      >
                        <span className="truncate">{file.path}</span>
                        <span className="text-[10px] text-red-400 uppercase shrink-0 ml-1 font-bold">{file.language}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeLeftTool === 'git' && (
              <div className="flex flex-col h-full bg-[#09090b] border-r border-zinc-800/80 p-3 text-xs font-mono space-y-3">
                <div className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider border-b border-zinc-800/80 pb-1 flex items-center justify-between">
                  <span>{isTr ? 'Kaynak Denetimi (Git)' : 'Source Control'}</span>
                  <button onClick={() => setIsLeftSidebarOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer" title="Kapat">
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-[#111115] border border-zinc-800/80 rounded p-2 text-zinc-300 text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold">✓ Working Tree Clean</div>
                  <div className="text-zinc-500 text-[10px]">branch: main (synchronized)</div>
                </div>
              </div>
            )}

            {activeLeftTool === 'plugins' && (
              <PluginsPanel
                plugins={plugins}
                onPluginsChange={handlePluginsChange}
                onOpenPlugin={(pluginId) => {
                  setActiveLeftTool(`plugin:${pluginId}`);
                  setIsLeftSidebarOpen(true);
                }}
                onCollapse={() => setIsLeftSidebarOpen(false)}
              />
            )}

            {typeof activeLeftTool === 'string' && activeLeftTool.startsWith('plugin:') && (() => {
              const pluginId = activeLeftTool.replace('plugin:', '');
              const plugin = plugins.find((p) => p.id === pluginId);
              if (!plugin) {
                return (
                  <div className="p-3 text-xs font-mono text-zinc-400">
                    {isTr ? 'Eklenti bulunamadı.' : 'Plugin not found.'}
                  </div>
                );
              }
              return (
                <div className="flex flex-col h-full bg-[#09090b] overflow-hidden">
                  <div className="px-2.5 py-2 bg-[#111115] border-b border-zinc-800/80 flex items-center justify-between shrink-0 font-mono text-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      {renderPluginIcon(plugin.icon, 'w-3.5 h-3.5')}
                      <span className="font-bold text-zinc-100 truncate">{plugin.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveLeftTool('plugins')}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer"
                        title={isTr ? 'Eklentiler Listesine Dön' : 'Back to Plugins'}
                        aria-label="Back to Plugins"
                      >
                        <Puzzle className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                      {plugin.isPinned && (
                        <button
                          type="button"
                          onClick={() => {
                            handlePluginsChange(
                              plugins.map((p) => (p.id === plugin.id ? { ...p, isPinned: false } : p))
                            );
                            setActiveLeftTool('plugins');
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded cursor-pointer"
                          title={isTr ? 'Sol kenar çubuğundan sabitlemeyi kaldır' : 'Unpin from left bar'}
                          aria-label="Unpin Plugin"
                        >
                          <PinOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsLeftSidebarOpen(false)}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded cursor-pointer"
                        title={isTr ? 'Kapat' : 'Close'}
                        aria-label="Close"
                      >
                        <PanelLeftClose className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {plugin.id === 'system-monitor' && <SystemMonitorView />}
                    {plugin.id === 'math-programming' && <MathProgrammingView />}
                    {plugin.id === 'advanced-terminal' && (
                      <AdvancedTerminalView workspace={currentWorkspace} />
                    )}
                    {plugin.id === 'database-editor' && (
                      <div className="p-3 space-y-3 font-mono text-xs text-zinc-300">
                        <p className="text-[11px] text-zinc-400">{plugin.description}</p>
                        <button
                          type="button"
                          onClick={() => setCenterMode('database')}
                          className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded flex items-center justify-center space-x-1.5 cursor-pointer font-bold"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Veritabanı Merkezini Aç' : 'Open Database Center'}</span>
                        </button>
                      </div>
                    )}
                    {!['system-monitor', 'math-programming', 'advanced-terminal', 'database-editor'].includes(
                      plugin.id
                    ) && (
                      <div className="h-full overflow-y-auto p-3 space-y-3 font-mono text-xs text-zinc-300">
                        <div className="bg-[#111115] p-3 border border-zinc-800 rounded space-y-2">
                          <div className="flex items-center space-x-2">
                            {renderPluginIcon(plugin.icon, 'w-4 h-4')}
                            <span className="font-bold text-white text-xs">{plugin.name}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{plugin.description}</p>
                          <div className="text-[10px] text-zinc-500">
                            v{plugin.version} • {plugin.author} • {plugin.category}
                          </div>
                          <div className="pt-2 border-t border-zinc-800 text-emerald-400 font-bold text-[11px]">
                            ✓ {isTr ? 'Etkin & Sol Menüye Hazır' : 'Enabled & Ready'}
                          </div>
                        </div>

                        {plugin.customScript && (
                          <div className="bg-[#111115] p-3 border border-zinc-800 rounded space-y-2">
                            <div className="text-[10px] text-zinc-400 uppercase font-bold">
                              {isTr ? 'Eklenti Betiği' : 'Plugin Script'}
                            </div>
                            <pre className="p-2 bg-black/70 border border-zinc-800 rounded text-[10px] text-purple-300 overflow-x-auto">
                              {plugin.customScript}
                            </pre>
                            <button
                              type="button"
                              onClick={() => {
                                setTerminalLogs((prev) => [
                                  ...prev,
                                  `🔌 [${plugin.name}] ${plugin.customScript}`,
                                ]);
                                setIsBottomDockOpen(true);
                              }}
                              className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded flex items-center justify-center space-x-1.5 cursor-pointer font-bold text-[11px]"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{isTr ? 'Betiği Çalıştır' : 'Run Script'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Draggable Vertical Resize Divider Handle (Left) */}
            <div
              onMouseDown={() => setIsDraggingLeft(true)}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-red-500 active:bg-red-500 transition-colors z-30 group flex items-center justify-center bg-transparent"
              title={isTr ? 'Sol paneli yeniden boyutlandır' : 'Drag to resize left panel'}
            >
              <div className="w-0.5 h-8 bg-zinc-700 group-hover:bg-red-500 rounded-full" />
            </div>
          </aside>
        )}

        {/* Center Stage: Document Tabs + Main Editor / Centered Tool + Bottom Output Dock */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#09090b] min-w-0">
          {/* Document Tabs Bar (Multi-file code tabs + Database/Quantum tabs + New File Tab button) */}
          <div className="bg-[#111115] border-b border-zinc-800/80 flex items-center justify-between overflow-x-auto no-scrollbar shrink-0 select-none">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              {openFiles
                .filter((file): file is VirtualFile => Boolean(file && file.path))
                .map((file) => {
                  const isActive = centerMode === 'editor' && activeFile?.path === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => {
                      const latestFile = currentWorkspace.files.find((f) => f.path === file.path) || file;
                      setActiveFile(latestFile);
                      setCenterMode('editor');
                    }}
                    className={`group flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono border-r border-zinc-800/80 cursor-pointer transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#18181b] text-white border-t-2 border-t-red-500 font-bold'
                        : 'bg-[#0d0d10] text-zinc-400 hover:bg-[#141418] hover:text-zinc-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCloseTab(file.path, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                      title={isTr ? 'Sekmeyi kapat' : 'Close tab'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {/* Add New File Tab Inline */}
              {isAddingTabFile ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newTabFileName.trim()) {
                      handleCreateCustomFile(newTabFileName.trim());
                    }
                    setIsAddingTabFile(false);
                    setNewTabFileName('');
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#18181b] border-r border-zinc-800/80"
                >
                  <input
                    type="text"
                    autoFocus
                    value={newTabFileName}
                    onChange={(e) => setNewTabFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsAddingTabFile(false);
                        setNewTabFileName('');
                      }
                    }}
                    onBlur={() => {
                      setIsAddingTabFile(false);
                      setNewTabFileName('');
                    }}
                    placeholder={isTr ? 'dosya.ts' : 'file.ts'}
                    className="bg-black border border-red-500 text-white text-[11px] font-mono px-1.5 py-0.5 rounded outline-none w-24"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNewTabFileName('');
                    setIsAddingTabFile(true);
                  }}
                  className="p-1.5 mx-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer shrink-0"
                  title={isTr ? 'Yeni kod sekmesi aç' : 'Open new code tab'}
                  aria-label="New Code Tab"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Home Centered Tab */}
              {centerMode === 'home' && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-[#18181b] text-red-300 border-r border-zinc-800/80 border-t-2 border-t-red-500 font-bold shrink-0">
                  <Home className="w-3.5 h-3.5 text-red-400" />
                  <span>{isTr ? 'Ana Sayfa' : 'Home'}</span>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="p-0.5 hover:bg-zinc-700 rounded text-red-400 hover:text-white cursor-pointer"
                    title={isTr ? 'Editöre dön' : 'Close and return to editor'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Copyrights Centered Tab */}
              {centerMode === 'copyrights' && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-[#18181b] text-red-300 border-r border-zinc-800/80 border-t-2 border-t-red-500 font-bold shrink-0">
                  <Copyright className="w-3.5 h-3.5 text-red-400" />
                  <span>Copyrights</span>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="p-0.5 hover:bg-zinc-700 rounded text-red-400 hover:text-white cursor-pointer"
                    title={isTr ? 'Editöre dön' : 'Close and return to editor'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* VBP DevFeed Centered Tab */}
              {centerMode === 'devfeed' && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-[#18181b] text-red-300 border-r border-zinc-800/80 border-t-2 border-t-red-500 font-bold shrink-0">
                  <LayoutGrid className="w-3.5 h-3.5 text-red-400" />
                  <span>VBP DevFeed</span>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="p-0.5 hover:bg-zinc-700 rounded text-red-400 hover:text-white cursor-pointer"
                    title={isTr ? 'Editöre dön' : 'Close and return to editor'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Quantum Centered Tab */}
              {centerMode === 'quantum' && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-[#18181b] text-cyan-300 border-r border-zinc-800/80 border-t-2 border-t-cyan-500 font-bold shrink-0">
                  <span>⚛️ {isTr ? 'Kuantum QPU' : 'Quantum QPU'}</span>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="p-0.5 hover:bg-zinc-700 rounded text-cyan-400 hover:text-white cursor-pointer"
                    title={isTr ? 'Editöre dön' : 'Close and return to editor'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Database Centered Tab */}
              {centerMode === 'database' && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono bg-[#18181b] text-red-300 border-r border-zinc-800/80 border-t-2 border-t-red-500 font-bold shrink-0">
                  <span>🗄️ {isTr ? 'Veritabanı Merkezi' : 'Database Center'}</span>
                  <button
                    type="button"
                    onClick={handleReturnToEditor}
                    className="p-0.5 hover:bg-zinc-700 rounded text-red-400 hover:text-white cursor-pointer"
                    title={isTr ? 'Editöre dön' : 'Close and return to editor'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Return Button when Center is Not Editor */}
            {centerMode !== 'editor' && (
              <button
                type="button"
                onClick={handleReturnToEditor}
                className="p-1 mr-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center justify-center cursor-pointer transition-colors shadow-xs shrink-0"
                title={isTr ? 'Kod Editörüne Geri Dön' : 'Return to Code Editor'}
                aria-label="Return to Code Editor"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Center Stage Content Body */}
          <div className="flex-1 overflow-hidden">
            {centerMode === 'editor' && (
              activeFile && openFiles.length > 0 ? (
                <CodeEditor
                  file={activeFile}
                  sastIssues={currentWorkspace.sastIssues}
                  perfMetrics={currentWorkspace.perfMetrics}
                  onUpdateContent={handleUpdateFileContent}
                  onApplyPatch={() => {}}
                  onOpenViraBot={() => setIsViraBotOpen(true)}
                  onSelectASTNode={() => {}}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-[#09090b] p-6 select-none">
                  <div className="max-w-md w-full bg-[#111115] border border-zinc-800/90 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
                    <div className="flex flex-col items-center space-y-2">
                      <ViraCodeLogo size="lg" glow />
                      <h2 className="text-sm font-mono font-black tracking-wider text-white">
                        VIRACODE IDE <span className="text-red-400">v5.0.0</span>
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        {currentWorkspace.name} — {isTr ? 'Açık kod sekmesi yok' : 'No code tabs open'}
                      </p>
                    </div>

                    {isCreatingEmptyFile ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const targetName = emptyNewFileName.trim() || 'main.ts';
                          handleCreateCustomFile(targetName);
                          setIsCreatingEmptyFile(false);
                          setEmptyNewFileName('');
                        }}
                        className="flex items-center space-x-2 bg-[#09090b] border border-red-500/70 rounded-xl p-2"
                      >
                        <FileCode className="w-4 h-4 text-red-400 shrink-0 ml-1" />
                        <input
                          type="text"
                          autoFocus
                          value={emptyNewFileName}
                          onChange={(e) => setEmptyNewFileName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsCreatingEmptyFile(false);
                              setEmptyNewFileName('');
                            }
                          }}
                          placeholder={isTr ? 'dosya_adi.ts (örn: main.rs)' : 'filename.ts (e.g. main.rs)'}
                          className="bg-transparent border-none outline-none text-xs font-mono text-white flex-1"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer"
                        >
                          {isTr ? 'Oluştur' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingEmptyFile(false);
                            setEmptyNewFileName('');
                          }}
                          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEmptyNewFileName('');
                            setIsCreatingEmptyFile(true);
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-red-950/50 active:scale-95"
                        >
                          <FilePlus className="w-4 h-4" />
                          <span>{isTr ? 'Yeni Dosya' : 'New File'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsHelpOpen(true)}
                          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                        >
                          <HelpCircle className="w-4 h-4 text-red-400" />
                          <span>{isTr ? 'Yardım Merkezi' : 'Help Center'}</span>
                        </button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-center space-x-4 text-[11px] font-mono text-zinc-500">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRightTool('timeline');
                          setIsRightSidebarOpen(true);
                        }}
                        className="flex items-center space-x-1 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>{isTr ? 'Release Timeline (v5.0.0)' : 'Release Timeline (v5.0.0)'}</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleOpenLocalFolder}
                        className="flex items-center space-x-1 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{isTr ? 'Klasör Bağla' : 'Open Folder'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {centerMode === 'home' && (
              <LeftHomePanel
                workspace={currentWorkspace}
                openFilesCount={openFiles.length}
                onReturnToEditor={handleReturnToEditor}
                onGoToExplorer={() => {
                  setActiveLeftTool('explorer');
                  setIsLeftSidebarOpen(true);
                  if (preHomeSidebarsRef.current) {
                    setIsRightSidebarOpen(preHomeSidebarsRef.current.right);
                    setIsBottomDockOpen(preHomeSidebarsRef.current.bottom);
                    preHomeSidebarsRef.current = null;
                  }
                  setCenterMode('editor');
                }}
                onOpenHelp={() => setIsHelpOpen(true)}
                onOpenReleaseNotes={() => setIsReleaseNotesOpen(true)}
                onOpenTimeline={() => {
                  setActiveRightTool('timeline');
                  setIsRightSidebarOpen(true);
                }}
                onOpenDatabaseCenter={() => {
                  preHomeSidebarsRef.current = null;
                  setCenterMode('database');
                }}
                onOpenQuantumCenter={() => {
                  preHomeSidebarsRef.current = null;
                  setCenterMode('quantum');
                }}
                onOpenLocalFolder={handleOpenLocalFolder}
                onOpenCopyrights={handleOpenCopyrights}
                onOpenDevFeed={handleOpenDevFeed}
              />
            )}

            {centerMode === 'copyrights' && (
              <CopyrightsPage
                onReturnToEditor={handleReturnToEditor}
                onOpenHome={handleOpenHome}
              />
            )}

            {centerMode === 'devfeed' && (
              <VbpDevFeedWorkspace
                activeFile={activeFile}
                initialTab={devFeedInitialTab}
                onReturnToEditor={handleReturnToEditor}
                onOpenFileInEditor={(f) => {
                  handleCreateCustomFile(f.name, '', f.content);
                }}
              />
            )}

            {centerMode === 'quantum' && (
              <QuantumWorkspace
                workspace={currentWorkspace}
                onOpenInEditor={(f) => {
                  handleCreateCustomFile(f.name, '', f.content);
                }}
              />
            )}

            {centerMode === 'database' && (
              <DatabaseEditor
                workspace={currentWorkspace}
                onOpenInEditor={(f) => {
                  handleCreateCustomFile(f.name, '', f.content);
                }}
              />
            )}
          </div>

          {/* Bottom Dock: Output / Terminal */}
          {isBottomDockOpen && centerMode !== 'home' && centerMode !== 'copyrights' && centerMode !== 'devfeed' && (
            <div
              style={{ height: `${terminalHeight}px` }}
              className="shrink-0 flex flex-col overflow-hidden border-t border-zinc-800/80 bg-[#08080a] relative"
            >
              {/* Draggable Horizontal Resize Divider Handle */}
              <div
                onMouseDown={() => setIsDraggingTerminal(true)}
                className="h-1.5 w-full cursor-row-resize hover:bg-red-500 active:bg-red-500 transition-colors z-20 group relative shrink-0 flex items-center justify-center bg-[#08080a]"
                title={isTr ? 'Terminal yüksekliğini ayarla' : 'Drag to resize terminal height'}
              >
                <div className="h-0.5 w-10 bg-zinc-700 group-hover:bg-red-500 rounded-full" />
              </div>

              <div className="flex-1 overflow-hidden">
                <VirtualDebugger
                  workspace={currentWorkspace}
                  onExecuteCommand={(cmd) => {
                    const clean = cmd.trim().toLowerCase();
                    setTerminalLogs((prev) => [...prev, `> ${cmd}`]);
                    if (clean === 'run' || clean === 'start') {
                      handleRunCode();
                    } else if (clean === 'clear' || clean === 'cls') {
                      setTerminalLogs([]);
                    } else if (clean === 'quantum center' || clean === 'kuantum orta') {
                      setCenterMode('quantum');
                    } else if (clean === 'db center' || clean === 'veritabanı orta') {
                      setCenterMode('database');
                    } else if (clean === 'editor' || clean === 'kod') {
                      handleReturnToEditor();
                    } else if (clean === 'home' || clean === 'anasayfa' || clean === 'ana sayfa') {
                      handleOpenHome();
                    } else if (clean === 'copyrights' || clean === 'telif') {
                      handleOpenCopyrights();
                    } else if (clean === 'devfeed' || clean === 'vbp devfeed') {
                      handleOpenDevFeed('overview');
                    } else if (clean === 'bot' || clean === 'assistant') {
                      setIsViraBotOpen(true);
                    } else if (clean === 'duck' || clean === 'ördek') {
                      setIsDuckStationOpen(true);
                    } else if (clean === 'help' || clean === 'yardım') {
                      setIsHelpOpen(true);
                    }
                  }}
                  terminalLogs={terminalLogs}
                  onClearLogs={() => setTerminalLogs([])}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Tool Window: Quantum / Database / SysMonitor / GitBox II / Plugins / Properties) */}
        {isRightSidebarOpen && (
          <aside
            style={{ width: `${rightSidebarWidth}px` }}
            className="shrink-0 flex flex-col h-full bg-[#09090b] border-l border-zinc-800/80 overflow-hidden relative select-none"
          >
            {/* Draggable Vertical Resize Divider Handle (Right) */}
            <div
              onMouseDown={() => setIsDraggingRight(true)}
              className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-red-500 active:bg-red-500 transition-colors z-30 group flex items-center justify-center bg-transparent"
              title={isTr ? 'Sağ paneli yeniden boyutlandır' : 'Drag to resize right panel'}
            >
              <div className="w-0.5 h-8 bg-zinc-700 group-hover:bg-red-500 rounded-full" />
            </div>

            <RightSidebar
              activeTool={activeRightTool}
              centerMode={centerMode}
              onSelectTool={(tool) => setActiveRightTool(tool)}
              workspace={currentWorkspace}
              activeFile={activeFile}
              onMaximizeToCenter={(tool) => setCenterMode(tool)}
              onClose={() => setIsRightSidebarOpen(false)}
              onOpenReleaseNotes={() => setIsReleaseNotesOpen(true)}
              onOpenFileInEditor={(f) => {
                handleCreateCustomFile(f.name, '', f.content);
              }}
              onForkWorkspace={handleForkGitBoxRepo}
            />
          </aside>
        )}
      </div>

      {/* ViraCode Bottom Status Bar in Sleek Dark Theme */}
      <footer className="h-6 shrink-0 bg-[#111115] text-zinc-300 flex items-center justify-between px-2 text-[11px] font-mono select-none z-30 border-t border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <span className="font-semibold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>{isTr ? 'ViraCode v5.0.0 Hazır' : 'ViraCode v5.0.0 Ready'}</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="truncate">{currentWorkspace.name}</span>
          {activeFile && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="hidden sm:inline text-zinc-400">{activeFile.path}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="uppercase font-bold text-red-400">{activeFile ? activeFile.language : 'IDLE'}</span>
          <span className="text-zinc-400">UTF-8</span>
          <span className="hidden sm:inline text-zinc-400">AVX-512</span>
          <span>{isTr ? 'Satır' : 'Ln'} {activeFile ? activeFile.content.split('\n').length : 0}</span>
        </div>
      </footer>

      {/* Assistant, Duck, Release Notes and Help Modals */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenViraBot={() => setIsViraBotOpen(true)}
      />

      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenViraBot={() => setIsViraBotOpen(true)}
      />

      <RubberDuckStation
        isOpen={isDuckStationOpen}
        onClose={() => setIsDuckStationOpen(false)}
        activeFileContent={activeFile?.content}
        onApplyCodeToEditor={(code) => {
          if (activeFile) {
            handleUpdateFileContent(code);
            setTerminalLogs((prev) => [
              ...prev,
              `🦆 [Çeviri Aracı] Çevrilmiş kod ${activeFile.name} dosyasına uygulandı.`,
            ]);
          }
        }}
      />

      {isViraBotOpen && (
        <ViraBotPanel
          workspace={currentWorkspace}
          activeFile={activeFile}
          isOpen={isViraBotOpen}
          onClose={() => setIsViraBotOpen(false)}
          onApplyCodeToEditor={(code) => {
            if (activeFile) {
              handleUpdateFileContent(code);
              setTerminalLogs((prev) => [
                ...prev,
                `🤖 [ViraBot] Sentezlenen kod ${activeFile.path} dosyasına eklendi.`,
              ]);
            } else {
              handleCreateCustomFile('generated.ts', '', code);
            }
          }}
        />
      )}
    </div>
  );
}
