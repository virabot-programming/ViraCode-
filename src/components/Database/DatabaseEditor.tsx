/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Play, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  FileCode, 
  Key, 
  Check, 
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';
import { ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';

interface TableColumn {
  name: string;
  type: string;
  isPk?: boolean;
  nullable?: boolean;
}

interface TableSchema {
  id: string;
  name: string;
  rowCount: number;
  columns: TableColumn[];
  rows: Record<string, any>[];
}

interface DatabaseEditorProps {
  workspace: ProjectWorkspace;
  onOpenInEditor?: (file: { name: string; content: string }) => void;
}

const INITIAL_TABLES: TableSchema[] = [
  {
    id: 'users',
    name: 'users',
    rowCount: 4,
    columns: [
      { name: 'id', type: 'INTEGER', isPk: true, nullable: false },
      { name: 'username', type: 'VARCHAR(64)', nullable: false },
      { name: 'email', type: 'VARCHAR(128)', nullable: false },
      { name: 'role', type: 'VARCHAR(32)', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
    ],
    rows: [
      { id: 1, username: 'admin_root', email: 'admin@viracode.dev', role: 'SUPER_ADMIN', created_at: '2026-10-01 10:00:00' },
      { id: 2, username: 'dev_lead', email: 'lead@viracode.dev', role: 'ENGINEER', created_at: '2026-10-02 11:30:00' },
      { id: 3, username: 'agent_sast', email: 'sast@viracode.ai', role: 'BOT_AGENT', created_at: '2026-10-03 14:15:00' },
      { id: 4, username: 'guest_user', email: 'guest@viracode.dev', role: 'GUEST', created_at: '2026-10-04 16:45:00' },
    ],
  },
  {
    id: 'projects',
    name: 'projects',
    rowCount: 3,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPk: true, nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'arch', type: 'VARCHAR(32)', nullable: false },
      { name: 'stars', type: 'INTEGER', nullable: true },
    ],
    rows: [
      { id: 'hyper-kv', title: 'HyperKV Engine', arch: 'x86_64-avx512', stars: 1240 },
      { id: 'quantum-sim', title: 'Quantum QPU Simulator', arch: 'wasm64', stars: 890 },
      { id: 'vira-db', title: 'ViraCode Embedded DB', arch: 'native-c', stars: 2100 },
    ],
  },
  {
    id: 'app_settings',
    name: 'app_settings',
    rowCount: 3,
    columns: [
      { name: 'key', type: 'VARCHAR(128)', isPk: true, nullable: false },
      { name: 'value', type: 'TEXT', nullable: false },
      { name: 'is_secret', type: 'BOOLEAN', nullable: false },
    ],
    rows: [
      { key: 'theme.primary', value: 'dark-slate', is_secret: false },
      { key: 'engine.threads', value: '16', is_secret: false },
      { key: 'avx512.enabled', value: 'true', is_secret: false },
    ],
  },
];

export const DatabaseEditor: React.FC<DatabaseEditorProps> = ({
  workspace,
  onOpenInEditor,
}) => {
  const { language } = useI18n();
  const isTr = language === 'tr';

  const [tables, setTables] = useState<TableSchema[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string>('users');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM users ORDER BY id ASC;');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'data' | 'schema' | 'query'>('data');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  // Run Custom SQL Query
  const handleRunSqlQuery = () => {
    const trimmed = sqlQuery.trim().toLowerCase();
    if (trimmed.startsWith('select')) {
      setQueryResult(isTr ? `✅ Sorgu Başarılı: ${selectedTable.rows.length} satır döndürüldü (0.42 ms)` : `✅ Query Execution Succeeded: ${selectedTable.rows.length} rows returned (0.42 ms)`);
      setActiveTab('data');
    } else if (trimmed.startsWith('insert') || trimmed.startsWith('update') || trimmed.startsWith('delete')) {
      setQueryResult(isTr ? '✅ DML İşlemi Tamamlandı: 1 satır etkilendi.' : '✅ DML Executed: 1 row affected.');
    } else {
      setQueryResult(isTr ? '✅ SQL Komutu sanal VT üzerinde yürütüldü.' : '✅ SQL executed on virtual database.');
    }
  };

  // Add New Row to Current Table
  const handleAddRow = () => {
    const newId = selectedTable.rows.length + 1;
    const newRow: Record<string, any> = {};
    selectedTable.columns.forEach((col) => {
      if (col.name === 'id') newRow[col.name] = newId;
      else if (col.type.includes('INT')) newRow[col.name] = 0;
      else if (col.type.includes('BOOL')) newRow[col.name] = false;
      else newRow[col.name] = `new_${col.name}_${newId}`;
    });

    const updatedTables = tables.map((t) => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          rowCount: t.rowCount + 1,
          rows: [...t.rows, newRow],
        };
      }
      return t;
    });

    setTables(updatedTables);
    setToastMessage(isTr ? '➕ Yeni satır eklendi' : '➕ New row inserted');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Delete Row
  const handleDeleteRow = (rowIndex: number) => {
    const updatedTables = tables.map((t) => {
      if (t.id === selectedTable.id) {
        const updatedRows = t.rows.filter((_, idx) => idx !== rowIndex);
        return {
          ...t,
          rowCount: updatedRows.length,
          rows: updatedRows,
        };
      }
      return t;
    });
    setTables(updatedTables);
    setToastMessage(isTr ? '🗑️ Satır silindi' : '🗑️ Row deleted');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Export Schema / DDL to Code Editor
  const handleExportToEditor = () => {
    let sqlContent = `-- ViraCode Database Export: ${workspace.name}\n-- Generated at: ${new Date().toLocaleString()}\n\n`;
    tables.forEach((t) => {
      sqlContent += `CREATE TABLE ${t.name} (\n`;
      const colDefs = t.columns.map(
        (c) => `  ${c.name} ${c.type}${c.isPk ? ' PRIMARY KEY' : ''}${!c.nullable ? ' NOT NULL' : ''}`
      );
      sqlContent += colDefs.join(',\n') + '\n);\n\n';

      t.rows.forEach((r) => {
        const keys = Object.keys(r).join(', ');
        const vals = Object.values(r)
          .map((v) => (typeof v === 'string' ? `'${v}'` : v))
          .join(', ');
        sqlContent += `INSERT INTO ${t.name} (${keys}) VALUES (${vals});\n`;
      });
      sqlContent += '\n';
    });

    if (onOpenInEditor) {
      onOpenInEditor({
        name: 'schema.sql',
        content: sqlContent,
      });
    }
  };

  // Filtered Rows
  const filteredRows = selectedTable.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchFilter.toLowerCase())
    )
  );

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-zinc-200 font-sans select-none overflow-hidden text-xs">
      {/* Database Top Bar */}
      <div className="px-2.5 py-1.5 bg-[#111115] border-b border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-red-400" />
          <span className="font-bold text-white text-[11px]">{isTr ? 'Veritabanı Düzenleyici' : 'Database Editor'}</span>
          <span className="text-[9px] px-1 bg-zinc-800 text-zinc-400 rounded">SQLite / SQL</span>
        </div>

        {/* Action Buttons: Export SQL to Editor */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleExportToEditor}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded transition-colors cursor-pointer flex items-center justify-center"
            title={isTr ? 'Editörde DDL / SQL Olarak Aç' : 'Export SQL to Code Editor'}
            aria-label="Export SQL"
          >
            <FileCode className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Container: Left Tables List + Right Data Grid / Schema */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table Selector Panel */}
        <aside className="w-36 shrink-0 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col p-1.5 space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 font-mono">
            {isTr ? 'Tablolar' : 'Tables'} ({tables.length})
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 font-mono">
            {tables.map((t) => {
              const isSelected = t.id === selectedTableId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTableId(t.id);
                    setSqlQuery(`SELECT * FROM ${t.name};`);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/40 text-red-300 font-bold border border-red-900/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                  title={`${t.name} (${t.rowCount} satır)`}
                >
                  <span className="truncate flex items-center space-x-1">
                    <Table className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 font-normal">{t.rowCount}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
          {/* Tabs: Data | Schema | SQL Query */}
          <div className="px-2 py-1 bg-[#0d0d10] border-b border-zinc-800/80 flex items-center justify-between text-[10px] font-mono shrink-0">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isTr ? 'Veri Satırları' : 'Data Rows'} ({selectedTable.rows.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'schema'
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isTr ? 'Şema (Kolonlar)' : 'Schema (Columns)'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('query')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeTab === 'query'
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                SQL Exec
              </button>
            </div>

            {/* Quick Actions (Add Row & Search) */}
            {activeTab === 'data' && (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  placeholder={isTr ? 'Satır ara...' : 'Filter...'}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-black/60 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-200 outline-none w-24 focus:border-zinc-600"
                />

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="p-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded cursor-pointer transition-colors"
                  title={isTr ? 'Yeni Satır Ekle' : 'Add New Row'}
                  aria-label="Add Row"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="bg-zinc-800 border-b border-zinc-700 px-2 py-1 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 overflow-auto p-2 font-mono">
            {/* TAB 1: DATA ROWS GRID */}
            {activeTab === 'data' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[10px]">
                      {selectedTable.columns.map((col) => (
                        <th key={col.name} className="p-1.5 bg-black/40 font-bold">
                          <span className="flex items-center space-x-1">
                            {col.isPk && <Key className="w-2.5 h-2.5 text-amber-400" />}
                            <span>{col.name}</span>
                          </span>
                        </th>
                      ))}
                      <th className="p-1.5 bg-black/40 text-right">{isTr ? 'İşlem' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                        {selectedTable.columns.map((col) => (
                          <td key={col.name} className="p-1.5 text-zinc-300 font-mono truncate max-w-[140px]">
                            {String(row[col.name] ?? 'NULL')}
                          </td>
                        ))}
                        <td className="p-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-0.5 hover:bg-red-900/60 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title={isTr ? 'Satırı Sil' : 'Delete Row'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: SCHEMA COLUMNS */}
            {activeTab === 'schema' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-300 border-b border-zinc-800 pb-1">
                  {selectedTable.name} {isTr ? 'Kolon Yapısı' : 'Column Definitions'}
                </div>
                <div className="space-y-1">
                  {selectedTable.columns.map((col) => (
                    <div
                      key={col.name}
                      className="p-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center space-x-1.5">
                        {col.isPk ? <Key className="w-3 h-3 text-amber-400" /> : <Table className="w-3 h-3 text-zinc-500" />}
                        <span className="font-bold text-white">{col.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px]">
                        <span className="text-red-400 font-mono font-bold uppercase">{col.type}</span>
                        <span className="text-zinc-500">{col.nullable ? 'NULLABLE' : 'NOT NULL'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SQL EXECUTION */}
            {activeTab === 'query' && (
              <div className="flex flex-col h-full space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{isTr ? 'SQL Çalıştırıcı (Sanal VT)' : 'SQL Query Terminal'}</span>
                  <button
                    type="button"
                    onClick={handleRunSqlQuery}
                    className="p-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    title={isTr ? 'SQL Çalıştır (Ctrl+Enter)' : 'Execute SQL (Ctrl+Enter)'}
                    aria-label="Execute SQL"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>

                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-24 bg-black/80 border border-zinc-800 rounded p-2 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-600 resize-none"
                  placeholder="SELECT * FROM users;"
                />

                {queryResult && (
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-emerald-400">
                    {queryResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
