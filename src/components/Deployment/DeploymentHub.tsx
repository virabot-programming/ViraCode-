import React, { useState } from 'react';
import { DeploymentIaC } from '../../types/engine';
import { SyntaxHighlighter } from '../Editor/SyntaxHighlighter';
import { useI18n } from '../../i18n/LanguageContext';
import { Box, Copy, Check } from 'lucide-react';

interface DeploymentHubProps {
  deployment: DeploymentIaC;
}

export const DeploymentHub: React.FC<DeploymentHubProps> = ({ deployment }) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'docker' | 'k8s' | 'helm' | 'terraform' | 'ci' | 'lsp'>('docker');
  const [copied, setCopied] = useState<boolean>(false);

  const getCode = () => {
    switch (activeTab) {
      case 'docker': return { code: deployment.dockerfile, lang: 'dockerfile' as const };
      case 'k8s': return { code: deployment.kubernetesYaml, lang: 'yaml' as const };
      case 'helm': return { code: deployment.helmValues, lang: 'yaml' as const };
      case 'terraform': return { code: deployment.terraformHcl, lang: 'hcl' as const };
      case 'ci': return { code: deployment.githubActionsYaml, lang: 'yaml' as const };
      case 'lsp': return { code: deployment.lspManifestJson, lang: 'json' as const };
    }
  };

  const current = getCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#080a0e] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">{t.deploymentTitle}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-mono">
            {language === 'tr' ? 'ZERO-TRUST ÜRETİME HAZIR' : 'ZERO-TRUST PRODUCTION READY'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-zinc-900 p-0.5 rounded border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('docker')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'docker' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-400'}`}
            >
              Dockerfile
            </button>
            <button
              onClick={() => setActiveTab('k8s')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'k8s' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-zinc-400'}`}
            >
              Kubernetes
            </button>
            <button
              onClick={() => setActiveTab('helm')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'helm' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-zinc-400'}`}
            >
              Helm Chart
            </button>
            <button
              onClick={() => setActiveTab('terraform')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'terraform' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400'}`}
            >
              Terraform HCL
            </button>
            <button
              onClick={() => setActiveTab('ci')}
              className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'ci' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400'}`}
            >
              CI/CD Pipeline
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{t.copyManifestBtn}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto p-3 bg-[#06080c]">
        <SyntaxHighlighter code={current.code} language={current.lang} />
      </div>
    </div>
  );
};
