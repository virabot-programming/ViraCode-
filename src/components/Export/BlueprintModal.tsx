import React, { useState } from 'react';
import { ProjectWorkspace } from '../../types/engine';
import { useI18n } from '../../i18n/LanguageContext';
import { Download, Copy, Check, X, FileText } from 'lucide-react';

interface BlueprintModalProps {
  workspace: ProjectWorkspace;
  onClose: () => void;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({ workspace, onClose }) => {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState<boolean>(false);

  const generateFullDeliveryBlueprint = (): string => {
    const filesSection = workspace.files.map(f => `### File: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');

    return `================================================================================
[VIRACODE IDE BLUEPRINT - PROJECT ROOT]: ${workspace.rootPath}
================================================================================

### 1. VIRTUAL FILE TREE & DEPENDENCY MAP
${workspace.files.map(f => `├── ${f.path.replace(/^\//, '')} [${f.language.toUpperCase()} | ${f.size} B]`).join('\n')}

#### Manifest & Dependencies (${workspace.manifestFile}):
${Object.entries(workspace.dependencies).map(([k, v]) => `  - ${k}: ${v}`).join('\n')}

### 2. ARCHITECTURAL BLUEPRINT & DATA FLOW
${workspace.architecture.description}

\`\`\`mermaid
${workspace.architecture.mermaidDiagram}
\`\`\`

### 3. COMPLETE, UNTRUNCATED SOURCE CODE
${filesSection}

### 4. COMPREHENSIVE TEST SUITES
${workspace.testSuites.map(ts => `#### Suite: ${ts.suiteName} (${ts.file})
Coverage: ${ts.coveragePct}% | Total: ${ts.totalTests} | Passed: ${ts.passed}
${ts.tests.map(t => `- [x] ${t.name} (${t.type}): ${t.edgeCaseCovered}`).join('\n')}
`).join('\n')}

### 5. EXTENSION, CONTAINERS & DEPLOYMENT SPECS
#### Dockerfile (Multi-Stage Production Build)
\`\`\`dockerfile
${workspace.deployment.dockerfile}
\`\`\`

#### Kubernetes Manifests
\`\`\`yaml
${workspace.deployment.kubernetesYaml}
\`\`\`

#### Terraform HCL Provisioner
\`\`\`hcl
${workspace.deployment.terraformHcl}
\`\`\`

#### GitHub Actions CI/CD Gate
\`\`\`yaml
${workspace.deployment.githubActionsYaml}
\`\`\`
`;
  };

  const fullBlueprint = generateFullDeliveryBlueprint();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullBlueprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullBlueprint], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspace.id}-viracode-blueprint.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#0b0e14] border border-zinc-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-sm font-bold text-zinc-100 font-mono">
                {language === 'tr' ? 'VIRACODE IDE 5-BÖLÜMLÜ ÜRETİM TESLİMAT PLANI' : 'VIRACODE IDE 5-SECTION PRODUCTION DELIVERY BLUEPRINT'}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                {t.blueprintModalSubtitle}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors border border-zinc-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'tr' ? 'Panoya Kopyalandı' : 'Copied') : t.copyBlueprintBtn}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors shadow-lg shadow-cyan-950/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadBlueprintBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors ml-2"
              title={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blueprint Content Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-[#06080c] font-mono text-xs text-zinc-300 select-text leading-relaxed">
          <pre className="whitespace-pre-wrap">{fullBlueprint}</pre>
        </div>
      </div>
    </div>
  );
};
