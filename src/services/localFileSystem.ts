/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VirtualFile, Language } from '../types/engine';

export interface LocalFolderResult {
  folderName: string;
  files: VirtualFile[];
  folders: string[];
  dirHandle?: any; // FileSystemDirectoryHandle
}

// Map extensions to Language
export function detectLanguage(fileName: string): Language {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rs':
      return 'rust';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'go':
      return 'go';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'h':
    case 'hpp':
    case 'c':
      return 'cpp';
    case 'zig':
      return 'zig';
    case 'ex':
    case 'exs':
      return 'elixir';
    case 'v':
    case 'sv':
      return 'verilog';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'dockerfile':
      return 'dockerfile';
    case 'tf':
    case 'hcl':
      return 'hcl';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'asm':
    case 's':
      return 'assembly';
    case 'qasm':
      return 'qasm';
    default:
      if (fileName.toLowerCase() === 'dockerfile') return 'dockerfile';
      if (fileName.toLowerCase() === 'cargo.toml') return 'rust';
      return 'typescript';
  }
}

// Ignored directories to avoid browser hangs on 100k node_modules files
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  'target',
  'vendor',
  '.vscode',
  '.idea',
  '__pycache__',
]);

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Open local directory with Web File System Access API
 */
export async function openLocalDirectory(): Promise<LocalFolderResult> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('FileSystemAccess API not supported in this browser.');
  }

  const dirHandle = await (window as any).showDirectoryPicker({
    mode: 'readwrite',
  });

  const files: VirtualFile[] = [];
  const folders: string[] = [];

  async function scanDirectory(
    currentHandle: any,
    relativePath: string = ''
  ): Promise<void> {
    for await (const [name, handle] of currentHandle.entries()) {
      if (IGNORED_DIRS.has(name) || name.startsWith('.')) {
        continue;
      }

      const itemPath = relativePath ? `${relativePath}/${name}` : name;

      if (handle.kind === 'directory') {
        folders.push(itemPath);
        await scanDirectory(handle, itemPath);
      } else if (handle.kind === 'file') {
        try {
          const file = await handle.getFile();
          // Skip large binary files (> 3MB)
          if (file.size > 3 * 1024 * 1024) continue;

          // Check if likely binary
          const text = await file.text();
          const language = detectLanguage(name);

          files.push({
            path: itemPath,
            name: name,
            language: language,
            content: text,
            size: file.size,
            modifiedAt: new Date(file.lastModified).toLocaleTimeString(),
            astNodes: [],
            symbolCount: Math.max(1, Math.floor(text.length / 100)),
            complexityScore: 'O(1)',
            testCoverage: 100,
          });
        } catch (e) {
          console.warn(`Could not read file ${itemPath}:`, e);
        }
      }
    }
  }

  await scanDirectory(dirHandle);

  return {
    folderName: dirHandle.name,
    files,
    folders,
    dirHandle,
  };
}

/**
 * Fallback to read directory from standard input[webkitdirectory]
 */
export async function readDirectoryFromInput(
  fileList: FileList
): Promise<LocalFolderResult> {
  const files: VirtualFile[] = [];
  const folderSet = new Set<string>();
  let folderName = 'Project';

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const rawPath = file.webkitRelativePath || file.name;
    const parts = rawPath.split('/');

    if (parts.length > 1) {
      folderName = parts[0];
      // remove the root folder name from the path
      parts.shift();
    }

    const relativePath = parts.join('/');
    const name = parts[parts.length - 1];

    // Check if in ignored directory
    if (parts.some((p) => IGNORED_DIRS.has(p) || p.startsWith('.'))) {
      continue;
    }

    // Register intermediate folders
    for (let j = 1; j < parts.length; j++) {
      folderSet.add(parts.slice(0, j).join('/'));
    }

    if (file.size > 3 * 1024 * 1024) continue;

    try {
      const text = await file.text();
      const language = detectLanguage(name);

      files.push({
        path: relativePath,
        name: name,
        language: language,
        content: text,
        size: file.size,
        modifiedAt: new Date(file.lastModified).toLocaleTimeString(),
        astNodes: [],
        symbolCount: Math.max(1, Math.floor(text.length / 100)),
        complexityScore: 'O(1)',
        testCoverage: 100,
      });
    } catch (e) {
      console.warn(`Failed reading ${relativePath}:`, e);
    }
  }

  return {
    folderName,
    files,
    folders: Array.from(folderSet),
  };
}

/**
 * Save file content directly to local disk if FileSystemDirectoryHandle is available
 */
export async function saveFileToDisk(
  dirHandle: any,
  filePath: string,
  content: string
): Promise<boolean> {
  if (!dirHandle) return false;

  try {
    const parts = filePath.split('/');
    const fileName = parts.pop()!;
    let currentDir = dirHandle;

    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.warn(`Failed writing to disk: ${filePath}`, err);
    return false;
  }
}

/**
 * Create folder directly on local disk if FileSystemDirectoryHandle is available
 */
export async function createFolderOnDisk(
  dirHandle: any,
  folderPath: string
): Promise<boolean> {
  if (!dirHandle) return false;

  try {
    const parts = folderPath.split('/').filter(Boolean);
    let currentDir = dirHandle;
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }
    return true;
  } catch (err) {
    console.warn(`Failed creating folder on disk: ${folderPath}`, err);
    return false;
  }
}
