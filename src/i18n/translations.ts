export type SupportedLanguage = 'tr' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tagline: string;
  
  // Header & Nav
  editorTab: string;
  serverModelerTab: string;
  quantumTab: string;
  gamesTab: string;
  astTab: string;
  architectureTab: string;
  testsTab: string;
  agentsTab: string;
  deploymentTab: string;
  selfHealBtn: string;
  synthesizingBtn: string;
  exportBlueprintBtn: string;
  toggleTerminalBtn: string;
  runCodeBtn: string;
  runningCodeBtn: string;
  helpBtn: string;
  helpModalTitle: string;
  versionBadge: string;
  whatsNewBtn: string;
  
  // Activity Bar & Collapsible Sidebars
  sidebarCollapse: string;
  sidebarExpand: string;
  activityBarTitle: string;
  explorerTooltip: string;
  editorTooltip: string;
  astTooltip: string;
  architectureTooltip: string;
  testsTooltip: string;
  agentsTooltip: string;
  deploymentTooltip: string;
  devToolsTooltip: string;
  pluginsTooltip: string;
  quantumTooltip: string;
  serverModelerTooltip: string;
  gamesTooltip: string;
  gitboxTooltip: string;
  socialTooltip: string;
  viraBotTooltip: string;
  rubberDuckTooltip: string;
  timelineTooltip: string;
  whatsNewTooltip: string;
  helpTooltip: string;
  exportTooltip: string;
  terminalTooltip: string;
  runTooltip: string;
  selfHealTooltip: string;
  quickActions: string;
  toggleWidgets: string;
  bringToCenter: string;
  dockToSidebar: string;
  returnToEditor: string;
  
  // File Explorer
  projectExplorer: string;
  newModuleBtn: string;
  searchFilesPlaceholder: string;
  memoryFootprint: string;
  heapAlloc: string;
  stackUsage: string;
  gcPause: string;
  symbolsCount: string;
  
  // Prompt Bar
  quickDirectives: string;
  promptPlaceholder: string;
  synthesizeBtn: string;
  preset1: string;
  preset2: string;
  preset3: string;
  preset4: string;
  preset5: string;

  // Code Editor
  sourceCodeTab: string;
  astSymbolsTab: string;
  securitySastTab: string;
  performanceTab: string;
  diffViewTab: string;
  copyCodeBtn: string;
  copiedBtn: string;
  autoFixAvailable: string;
  applyPatchBtn: string;
  patchAppliedSuccess: string;
  openVulnerabilities: string;
  noVulnerabilities: string;
  complexityScore: string;
  memoryImpact: string;
  safetyLevel: string;
  verifiedSafe: string;
  editableCodeNotice: string;
  saveBtn: string;
  savedBtn: string;
  unsavedChanges: string;
  formatBtn: string;
  formattedBtn: string;
  undoBtn: string;
  redoBtn: string;
  searchInCode: string;
  matches: string;
  liveEditor: string;

  // New DevTools, Import/Export, Rename, and AI Bot keys
  devToolsTab: string;
  aiBotTab: string;
  exportFileBtn: string;
  exportProjectBtn: string;
  importFileBtn: string;
  importProjectBtn: string;
  renameFile: string;
  duplicateFile: string;
  deleteFile: string;
  copyFilePath: string;
  fileOptions: string;
  syntaxColorMode: string;
  syntaxHighlightActive: string;
  aiCopilotTitle: string;
  aiCopilotSubtitle: string;
  aiPromptPlaceholder: string;
  applyToEditor: string;
  appliedToEditorSuccess: string;
  askViraBot: string;
  explainCode: string;
  refactorFunction: string;
  fixVulnerabilities: string;
  generateProptests: string;
  devToolsTitle: string;
  devToolsSubtitle: string;
  envEditorTab: string;
  networkProfilerTab: string;
  consoleTab: string;
  codeMetricsTab: string;

  // Plugins Hub & Modules
  pluginsTab: string;
  pluginsTitle: string;
  pluginsSubtitle: string;
  addCustomPlugin: string;
  installedPlugins: string;
  systemMonitorPlugin: string;
  mathProgrammingPlugin: string;
  advancedFileExplorerPlugin: string;
  advancedTerminalPlugin: string;
  multiRunnerPlugin: string;
  runTarget: string;
  executionTime: string;
  mathPlotter: string;
  mathExpression: string;
  evalMath: string;
  matrixOps: string;
  cpuLoad: string;
  memoryAlloc: string;
  threadsActive: string;
  createPluginBtn: string;
  pluginName: string;
  pluginDesc: string;
  pluginCategory: string;
  pluginAuthor: string;
  enabledLabel: string;
  disabledLabel: string;

  // Virtual Debugger & Runtime
  virtualDebuggerTitle: string;
  simulationReady: string;
  runBtn: string;
  stepOverBtn: string;
  resetBtn: string;
  terminalTab: string;
  registersTab: string;
  heapTab: string;
  callStackTab: string;
  terminalPlaceholder: string;
  sendBtn: string;
  clearLogsBtn: string;
  registersTitle: string;
  heapTitle: string;
  stackTitle: string;
  
  // Agents HUD
  agentsTitle: string;
  agentsSubtitle: string;
  consensusScore: string;
  runConsensusBtn: string;
  agentArchitect: string;
  agentSecurity: string;
  agentPerformance: string;
  agentQa: string;
  architectTitle: string;
  securityTitle: string;
  performanceTitle: string;
  qaTitle: string;
  triggerAgentScan: string;
  recentActivity: string;
  checksPassed: string;
  issuesFlagged: string;
  patchesApplied: string;

  // Tests
  qaRunnerTitle: string;
  qaTargetSubtitle: string;
  runAllTestsBtn: string;
  fixFailingTestsBtn: string;
  totalTestsLabel: string;
  passedLabel: string;
  failedLabel: string;
  coverageLabel: string;
  allPassing: string;

  // Architecture & IaC
  architectureTitle: string;
  architectureSubtitle: string;
  stateTransitions: string;
  deploymentTitle: string;
  deploymentSubtitle: string;
  copyManifestBtn: string;

  // Blueprint Export Modal
  blueprintModalTitle: string;
  blueprintModalSubtitle: string;
  copyBlueprintBtn: string;
  downloadBlueprintBtn: string;
  closeBtn: string;

  // Status Bar
  branchLabel: string;
  targetLabel: string;
  astHealthy: string;
  subsystemsActive: string;
  heapLabel: string;
  systemReady: string;
  switchLanguage: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  tr: {
    appName: 'VIRACODE IDE',
    appSubtitle: 'v5.0.0 OTONOM GELİŞTİRME PLATFORMU',
    tagline: 'Çok İş Parçacıklı Sanal Derleyici, AST Çalışma Zamanı ve 4-Ajanlı Yazılım Mühendisliği Ekosistemi',

    // Header & Nav
    editorTab: 'Editör',
    serverModelerTab: 'Sunucu Modelleme',
    quantumTab: 'Kuantum',
    gamesTab: '🎮 Oyun Menüsü',
    astTab: 'Sanal AST',
    architectureTab: 'C4 Mimarisi',
    testsTab: 'QA Testleri',
    agentsTab: '4 Ajan',
    deploymentTab: 'IaC / K8s',
    selfHealBtn: 'Projeyi Otomatik Onar',
    synthesizingBtn: 'Sentezleniyor...',
    exportBlueprintBtn: 'Planı Dışa Aktar',
    toggleTerminalBtn: 'Terminali Aç / Kapat',
    runCodeBtn: 'Çalıştır',
    runningCodeBtn: 'Yürütülüyor...',
    helpBtn: 'Yardım',
    helpModalTitle: 'Yardım & Rehber Merkezi',
    versionBadge: 'v5.0.0',
    whatsNewBtn: 'Yenilikler',

    // Activity Bar & Collapsible Sidebars
    sidebarCollapse: 'Kenar Çubuğunu Daralt',
    sidebarExpand: 'Kenar Çubuğunu Genişlet',
    activityBarTitle: 'Aktivite Çubuğu',
    explorerTooltip: 'Dosya Gezgini (Aç/Kapat)',
    editorTooltip: 'Kod Düzenleyici',
    astTooltip: 'Sanal AST Görselleştirici',
    architectureTooltip: 'Sistem Mimarisi (C4 / DDD)',
    testsTooltip: 'QA ve Fuzzing Testleri',
    agentsTooltip: '4-Ajanlı Otonom Sürü (HUD)',
    deploymentTooltip: 'Bulut ve Dağıtım (IaC/K8s)',
    devToolsTooltip: 'Geliştirici Araçları & Profiler',
    pluginsTooltip: 'Eklentiler & Çoklu Koşucu Merkezi',
    quantumTooltip: 'Kuantum QPU Simülatörü',
    serverModelerTooltip: 'Sunucu Modelleme Stüdyosu',
    gamesTooltip: 'Geliştirici Oyun Salonu (Dev Arcade)',
    gitboxTooltip: 'GitBox Paylaşım & Fork Deposu',
    socialTooltip: 'ViraSocial Geliştirici Ağı',
    viraBotTooltip: 'ViraBot Yapay Zeka Asistanı',
    rubberDuckTooltip: 'Lastik Ördek Hata Ayıklama İstasyonu',
    timelineTooltip: 'Sürüm Zaman Çizelgesi (Timeline)',
    whatsNewTooltip: 'v5.0.0 Sürüm Notları ve Yenilikler',
    helpTooltip: 'Yardım ve Kullanım Rehberi',
    exportTooltip: 'Kurumsal Teslimat Planını İndir',
    terminalTooltip: 'Sanal Terminal & Debugger (Aç/Kapat)',
    runTooltip: 'Kodu Derle ve Çalıştır',
    selfHealTooltip: 'Otonom Onarım & SAST Yamalama',
    quickActions: 'Hızlı Eylemler',
    toggleWidgets: 'Kayan Pencere Öğeleri',
    bringToCenter: 'Ortaya Al (Genişlet)',
    dockToSidebar: 'Kenar Çubuğuna Al',
    returnToEditor: 'Kod Editörüne Dön',

    // File Explorer
    projectExplorer: 'Proje Gezgini',
    newModuleBtn: 'Yeni Modül',
    searchFilesPlaceholder: 'Dosya ara...',
    memoryFootprint: 'Sanal Bellek Ayak İzi',
    heapAlloc: 'Heap Tahsisi:',
    stackUsage: 'Stack Boyutu:',
    gcPause: 'GC Duraklaması:',
    symbolsCount: 'sembol',

    // Prompt Bar
    quickDirectives: 'Hızlı Yönergeler:',
    promptPlaceholder: 'ViraCode IDE için yönerge girin: Örn. "SkipList yapısını lock-free epoch ile yeniden yapılandır", "K8s HPA manifesti oluştur"...',
    synthesizeBtn: 'AST Sentezle',
    preset1: '⚡ 64-byte hizalamalı sıfır-tahsisli SIMD bellek arenası sentezle',
    preset2: '🛡️ Tüm SAST zafiyetlerini otomatik yamala & Zero-Trust SPIFFE sınırlarını uygula',
    preset3: '🧪 100.000 fuzz mutasyonlu otonom property-based test paketi üret',
    preset4: '🏛️ Dağıtık linearizable Raft konsensüs durum makinesine refactor et',
    preset5: '📦 Kesintisiz 5-bölümlü kurumsal üretim teslimat planını dışa aktar',

    // Code Editor
    sourceCodeTab: 'Kaynak Kod',
    astSymbolsTab: 'AST Sembolleri',
    securitySastTab: 'Güvenlik (SAST)',
    performanceTab: 'Performans',
    diffViewTab: 'Fark Görünümü (Diff)',
    copyCodeBtn: 'Kodu Kopyala',
    copiedBtn: 'Kopyalandı!',
    autoFixAvailable: 'Otomatik Düzeltme Mevcut',
    applyPatchBtn: 'Güvenlik Yamasını Uygula',
    patchAppliedSuccess: 'Yama başarıyla uygulandı',
    openVulnerabilities: 'Açık Zafiyet',
    noVulnerabilities: 'Güvenlik açığı tespit edilmedi',
    complexityScore: 'Karmaşıklık:',
    memoryImpact: 'Bellek Etkisi:',
    safetyLevel: 'Güvenlik Düzeyi:',
    verifiedSafe: 'verified_safe',
    editableCodeNotice: 'Kodları doğrudan düzenleyebilirsiniz. Değişiklikler anında işlenir.',
    saveBtn: 'Kaydet',
    savedBtn: 'Kaydedildi',
    unsavedChanges: 'Düzenlendi',
    formatBtn: 'Kodu Biçimlendir',
    formattedBtn: 'Biçimlendirildi',
    undoBtn: 'Geri Al',
    redoBtn: 'Yinele',
    searchInCode: 'Kodda bul...',
    matches: 'eşleşme',
    liveEditor: 'Canlı Kod Editörü',

    // Geliştirici Araçları, Dosya Seçenekleri, AI Bot ve Renkli Sentaks
    devToolsTab: 'DevTools',
    aiBotTab: 'ViraBot AI',
    exportFileBtn: 'Dosyayı İndir',
    exportProjectBtn: 'Tüm Projeyi İndir',
    importFileBtn: 'Dosya İçe Aktar',
    importProjectBtn: 'Proje İçe Aktar',
    renameFile: 'Yeniden Adlandır',
    duplicateFile: 'Çoğalt',
    deleteFile: 'Sil',
    copyFilePath: 'Yolu Kopyala',
    fileOptions: 'Dosya Seçenekleri',
    syntaxColorMode: 'Renkli Sözdizimi',
    syntaxHighlightActive: 'Fonksiyonlar & Sözdizimi Renkli',
    aiCopilotTitle: 'ViraBot AI Geliştirici Asistanı',
    aiCopilotSubtitle: 'Canlı kod analizi, refactoring ve otonom hata düzeltme',
    aiPromptPlaceholder: 'ViraBot\'a kodunuzla ilgili soru sorun, fonksiyon yazdırın veya refactor isteyin...',
    applyToEditor: 'Editöre Aktar',
    appliedToEditorSuccess: 'Kod editöre başarıyla aktarıldı!',
    askViraBot: 'ViraBot\'a Gönder',
    explainCode: 'Kodu Açıkla',
    refactorFunction: 'Fonksiyonu İyileştir',
    fixVulnerabilities: 'Zafiyetleri Düzelt',
    generateProptests: 'Test Üret',
    devToolsTitle: 'YÜKSELTİLMİŞ GELİŞTİRİCİ ARAÇLARI',
    devToolsSubtitle: 'Sanal REPL Konsol, Ağ Gecikme Profili ve Ortam Değişkenleri',
    envEditorTab: 'Ortam (.env)',
    networkProfilerTab: 'Ağ & Gecikme',
    consoleTab: 'Sanal Konsol (REPL)',
    codeMetricsTab: 'Kod Sağlığı & Metrikler',

    // Eklenti Merkezi & Modüller
    pluginsTab: 'Eklentiler',
    pluginsTitle: 'VIRACODE EKLENTİ & ÇALIŞTIRICI MERKEZİ',
    pluginsSubtitle: 'Sistem Monitörü, Matematiksel Programlama, Dosya Gezgini, Terminal ve Çoklu Çalıştırıcılar',
    addCustomPlugin: 'Yeni Eklenti Ekle',
    installedPlugins: 'Yüklü Eklentiler',
    systemMonitorPlugin: 'Gelişmiş Sistem Monitörü',
    mathProgrammingPlugin: 'Matematiksel Programlama & Fonksiyon Çizici',
    advancedFileExplorerPlugin: 'Gelişmiş Dosya Gezgini & Disk Analizörü',
    advancedTerminalPlugin: 'Gelişmiş Sanal Shell Terminal',
    multiRunnerPlugin: 'Çoklu Dil Çalıştırıcı Matrisi',
    runTarget: 'Çalıştırıcı Hedefi',
    executionTime: 'Çalışma Süresi',
    mathPlotter: 'Fonksiyon Grafiği',
    mathExpression: 'Matematiksel İfade',
    evalMath: 'Hesapla & Çiz',
    matrixOps: 'Matris İşlemleri',
    cpuLoad: 'CPU Çekirdek Yükü',
    memoryAlloc: 'Bellek Tahsisi',
    threadsActive: 'Aktif İş Parçacıkları',
    createPluginBtn: 'Eklentiyi Kaydet & Etkinleştir',
    pluginName: 'Eklenti Adı',
    pluginDesc: 'Açıklama',
    pluginCategory: 'Kategori',
    pluginAuthor: 'Geliştirici',
    enabledLabel: 'Etkin',
    disabledLabel: 'Devre Dışı',

    // Virtual Debugger & Runtime
    virtualDebuggerTitle: 'SANAL ÇALIŞMA ZAMANI DERLEYİCİSİ & ADIMLI HATA AYIKLAYICI',
    simulationReady: 'SİMÜLASYON HAZIR',
    runBtn: 'Çalıştır',
    stepOverBtn: 'Adım Atla (Step Over)',
    resetBtn: 'CPU Sıfırla',
    terminalTab: 'Terminal (CLI)',
    registersTab: 'Yazmaçlar (Registers)',
    heapTab: 'Heap Bellek',
    callStackTab: 'Çağrı Yığını (Call Stack)',
    terminalPlaceholder: 'Komut girin: compile, test, audit, profile, heal, ast, deploy, help...',
    sendBtn: 'Gönder',
    clearLogsBtn: 'Günlüğü Temizle',
    registersTitle: 'CPU Donanım Yazmaçları (x86_64 AVX-512)',
    heapTitle: 'Sanal Bellek Heap Tahsis Haritası (Sıfır Sızıntı)',
    stackTitle: 'Aktif Çağrı Yığını Çerçeveleri',

    // Agents HUD
    agentsTitle: '4-AJANLI OTONOM YAZILIM MÜHENDİSLİĞİ',
    agentsSubtitle: 'Mimar, Güvenlik Denetçisi, Performans Motoru ve QA Eşzamanlı İş Parçacıkları',
    consensusScore: 'Konsensüs Skoru',
    runConsensusBtn: 'Otonom Konsensüs Döngüsünü Çalıştır',
    agentArchitect: 'Sistem Mimarı',
    agentSecurity: 'Siber Güvenlik Denetçisi',
    agentPerformance: 'Optimizasyon Motoru',
    agentQa: 'Otonom QA Motoru',
    architectTitle: 'Domain Değişmezleri & C4 Modelleme',
    securityTitle: 'SAST & Zero-Trust Doğrulama',
    performanceTitle: 'Zaman/Alan & Eşzamanlılık Profili',
    qaTitle: 'Property & Fuzzing Test Motoru',
    triggerAgentScan: 'Hedefli Analizi Çalıştır',
    recentActivity: 'Son Ajan Günlüğü',
    checksPassed: 'Geçen Kontroller',
    issuesFlagged: 'İşaretlenen Sorunlar',
    patchesApplied: 'Uygulanan Yamalar',

    // Tests
    qaRunnerTitle: 'OTONOM QA & PROPERTY TEST KOŞUCUSU',
    qaTargetSubtitle: '%100 DEĞİŞMEZLİK KAPSAMA HEDEFİ',
    runAllTestsBtn: 'Tüm Testleri Koş',
    fixFailingTestsBtn: 'Başarısız Testleri Otomatik Onar',
    totalTestsLabel: 'Toplam Test',
    passedLabel: 'Başarılı',
    failedLabel: 'Başarısız',
    coverageLabel: 'Kapsama',
    allPassing: 'Tüm değişmezlik testleri başarıyla tamamlandı',

    // Architecture & IaC
    architectureTitle: 'C4 SİSTEM MİMARİSİ VE BİLEŞEN TOPOLOJİSİ',
    architectureSubtitle: 'Etki Alanı Odaklı Tasarım (DDD) & Dağıtık Durum Makinesi',
    stateTransitions: 'Durum Makinesi Geçişleri',
    deploymentTitle: 'KOD OLARAK ALTYAPI (IaC) & KONTEYNER ORKESTRASYONU',
    deploymentSubtitle: 'Docker, Kubernetes, Helm ve Terraform Üretim Manifestleri',
    copyManifestBtn: 'Manifesti Kopyala',

    // Blueprint Export Modal
    blueprintModalTitle: '5-Bölümlü Kurumsal Teslimat Planı',
    blueprintModalSubtitle: 'Eksiksiz, kesintisiz, üretime hazır yazılım paketi ve mimari blueprint',
    copyBlueprintBtn: 'Planı Kopyala',
    downloadBlueprintBtn: 'Planı İndir (.md)',
    closeBtn: 'Kapat',

    // Status Bar
    branchLabel: 'dal:',
    targetLabel: 'Hedef:',
    astHealthy: 'AST_SAĞLIKLI: 0 HATA',
    subsystemsActive: '4-Ajan Otonom Alt Sistemler Aktif',
    heapLabel: 'Heap:',
    systemReady: 'Sistem Hazır',
    switchLanguage: 'Dili Değiştir',
  },

  en: {
    appName: 'VIRACODE IDE',
    appSubtitle: 'v5.0.0 AUTONOMOUS DEVELOPMENT PLATFORM',
    tagline: 'Multi-threaded Virtual Compiler, AST Runtime, and 4-Agent Software Engineering Ecosystem',

    // Header & Nav
    editorTab: 'Editor',
    serverModelerTab: 'Server Modeler',
    quantumTab: 'Quantum',
    gamesTab: '🎮 Dev Arcade',
    astTab: 'Virtual AST',
    architectureTab: 'C4 Architecture',
    testsTab: 'QA Tests',
    agentsTab: '4 Agents',
    deploymentTab: 'IaC / K8s',
    selfHealBtn: 'Self-Heal Project',
    synthesizingBtn: 'Synthesizing...',
    exportBlueprintBtn: 'Export Blueprint',
    toggleTerminalBtn: 'Toggle Terminal',
    runCodeBtn: 'Run',
    runningCodeBtn: 'Executing...',
    helpBtn: 'Help',
    helpModalTitle: 'Help & Onboarding Center',
    versionBadge: 'v5.0.0',
    whatsNewBtn: "What's New",

    // Activity Bar & Collapsible Sidebars
    sidebarCollapse: 'Collapse Sidebar',
    sidebarExpand: 'Expand Sidebar',
    activityBarTitle: 'Activity Bar',
    explorerTooltip: 'File Explorer (Toggle)',
    editorTooltip: 'Code Editor',
    astTooltip: 'Virtual AST Visualizer',
    architectureTooltip: 'System Architecture (C4 / DDD)',
    testsTooltip: 'QA & Property Fuzzing Tests',
    agentsTooltip: '4-Agent Autonomous Swarm (HUD)',
    deploymentTooltip: 'Cloud & Infrastructure (IaC/K8s)',
    devToolsTooltip: 'Developer Tools & Profiler',
    pluginsTooltip: 'Plugins & Multi-Runner Hub',
    quantumTooltip: 'Quantum QPU Simulator',
    serverModelerTooltip: 'Server Infrastructure Modeler',
    gamesTooltip: 'Developer Arcade (Games)',
    gitboxTooltip: 'GitBox Repository Share & Fork',
    socialTooltip: 'ViraSocial Developer Community',
    viraBotTooltip: 'ViraBot AI Assistant',
    rubberDuckTooltip: 'Rubber Duck Debugging Station',
    timelineTooltip: 'Release Timeline History',
    whatsNewTooltip: "v5.0.0 Release Notes & What's New",
    helpTooltip: 'Help & Onboarding Center',
    exportTooltip: 'Export Enterprise Blueprint',
    terminalTooltip: 'Virtual Terminal & Debugger (Toggle)',
    runTooltip: 'Compile & Run Active Code',
    selfHealTooltip: 'Autonomous Self-Heal & SAST Fix',
    quickActions: 'Quick Actions',
    toggleWidgets: 'Floating Widgets',
    bringToCenter: 'Bring to Center',
    dockToSidebar: 'Dock to Sidebar',
    returnToEditor: 'Return to Code Editor',

    // File Explorer
    projectExplorer: 'Project Explorer',
    newModuleBtn: 'New Module',
    searchFilesPlaceholder: 'Search files...',
    memoryFootprint: 'Virtual Memory Footprint',
    heapAlloc: 'Heap Allocation:',
    stackUsage: 'Stack Footprint:',
    gcPause: 'GC Pause Max:',
    symbolsCount: 'symbols',

    // Prompt Bar
    quickDirectives: 'Quick Directives:',
    promptPlaceholder: 'Instruct ViraCode IDE: E.g., "Refactor SkipList to use epoch-based lock-free reclamation", "Generate K8s HPA manifest"...',
    synthesizeBtn: 'Synthesize AST',
    preset1: '⚡ Synthesize zero-allocation SIMD memory arena with 64-byte alignment',
    preset2: '🛡️ Auto-patch all SAST vulnerabilities & enforce zero-trust SPIFFE bounds',
    preset3: '🧪 Generate autonomous property-based test suite with 100,000 fuzz permutations',
    preset4: '🏛️ Refactor to distributed linearizable Raft consensus state machine',
    preset5: '📦 Export 100% untruncated enterprise production delivery blueprint',

    // Code Editor
    sourceCodeTab: 'Source',
    astSymbolsTab: 'AST Symbols',
    securitySastTab: 'Security (SAST)',
    performanceTab: 'Performance',
    diffViewTab: 'Diff View',
    copyCodeBtn: 'Copy Code',
    copiedBtn: 'Copied!',
    autoFixAvailable: 'Auto-Fix Available',
    applyPatchBtn: 'Apply Security Patch',
    patchAppliedSuccess: 'Patch applied successfully',
    openVulnerabilities: 'Open Vulnerabilities',
    noVulnerabilities: 'No vulnerabilities flagged',
    complexityScore: 'Complexity:',
    memoryImpact: 'Memory Impact:',
    safetyLevel: 'Safety Level:',
    verifiedSafe: 'verified_safe',
    editableCodeNotice: 'You can edit code directly. Changes update instantly.',
    saveBtn: 'Save',
    savedBtn: 'Saved',
    unsavedChanges: 'Modified',
    formatBtn: 'Format Code',
    formattedBtn: 'Formatted',
    undoBtn: 'Undo',
    redoBtn: 'Redo',
    searchInCode: 'Find in code...',
    matches: 'matches',
    liveEditor: 'Live Code Editor',

    // DevTools, File Options, AI Bot and Syntax Colors
    devToolsTab: 'DevTools',
    aiBotTab: 'ViraBot AI',
    exportFileBtn: 'Download File',
    exportProjectBtn: 'Download Full Project',
    importFileBtn: 'Import File',
    importProjectBtn: 'Import Project',
    renameFile: 'Rename',
    duplicateFile: 'Duplicate',
    deleteFile: 'Delete',
    copyFilePath: 'Copy Path',
    fileOptions: 'File Options',
    syntaxColorMode: 'Syntax Colors',
    syntaxHighlightActive: 'Functions & Syntax Colored',
    aiCopilotTitle: 'ViraBot AI Developer Assistant',
    aiCopilotSubtitle: 'Live code analysis, refactoring & autonomous bug fixes',
    aiPromptPlaceholder: 'Ask ViraBot about your code, generate functions, or request refactoring...',
    applyToEditor: 'Apply to Editor',
    appliedToEditorSuccess: 'Code applied to editor successfully!',
    askViraBot: 'Send to ViraBot',
    explainCode: 'Explain Code',
    refactorFunction: 'Refactor Function',
    fixVulnerabilities: 'Fix Vulnerabilities',
    generateProptests: 'Generate Tests',
    devToolsTitle: 'ENHANCED DEVELOPER TOOLS',
    devToolsSubtitle: 'Virtual REPL Console, Network Latency Profiler & Env Variables',
    envEditorTab: 'Environment (.env)',
    networkProfilerTab: 'Network & Latency',
    consoleTab: 'Virtual Console (REPL)',
    codeMetricsTab: 'Code Metrics',

    // Plugins Hub & Modules
    pluginsTab: 'Plugins',
    pluginsTitle: 'VIRACODE PLUGIN & RUNNER HUB',
    pluginsSubtitle: 'System Monitor, Mathematical Programming, File Explorer, Terminal and Multi-Runners',
    addCustomPlugin: 'Add Custom Plugin',
    installedPlugins: 'Installed Plugins',
    systemMonitorPlugin: 'Advanced System Monitor',
    mathProgrammingPlugin: 'Mathematical Programming & Function Plotter',
    advancedFileExplorerPlugin: 'Advanced File Explorer & Disk Analyzer',
    advancedTerminalPlugin: 'Advanced Virtual Shell Terminal',
    multiRunnerPlugin: 'Polyglot Multi-Runner Matrix',
    runTarget: 'Runner Target',
    executionTime: 'Execution Time',
    mathPlotter: 'Function Curve Plotter',
    mathExpression: 'Mathematical Expression',
    evalMath: 'Evaluate & Plot',
    matrixOps: 'Matrix Operations',
    cpuLoad: 'CPU Core Load',
    memoryAlloc: 'Memory Allocation',
    threadsActive: 'Active Worker Threads',
    createPluginBtn: 'Save & Enable Plugin',
    pluginName: 'Plugin Name',
    pluginDesc: 'Description',
    pluginCategory: 'Category',
    pluginAuthor: 'Author',
    enabledLabel: 'Enabled',
    disabledLabel: 'Disabled',

    // Virtual Debugger & Runtime
    virtualDebuggerTitle: 'VIRTUAL RUNTIME COMPILER & STEP DEBUGGER',
    simulationReady: 'SIMULATION READY',
    runBtn: 'Run',
    stepOverBtn: 'Step Over',
    resetBtn: 'Reset CPU',
    terminalTab: 'Terminal (CLI)',
    registersTab: 'Registers',
    heapTab: 'Heap Memory',
    callStackTab: 'Call Stack',
    terminalPlaceholder: 'Type commands: compile, test, audit, profile, heal, ast, deploy, help...',
    sendBtn: 'Send',
    clearLogsBtn: 'Clear Logs',
    registersTitle: 'CPU Machine Registers (x86_64 AVX-512)',
    heapTitle: 'Virtual Memory Heap Allocation Map (Zero Leaks)',
    stackTitle: 'Active Call Stack Frames',

    // Agents HUD
    agentsTitle: '4-AGENT AUTONOMOUS SOFTWARE ENGINEERING',
    agentsSubtitle: 'Architect, Security Auditor, Performance Optimizer & QA Concurrent Threads',
    consensusScore: 'Consensus Score',
    runConsensusBtn: 'Execute Autonomous Consensus Loop',
    agentArchitect: 'System Architect',
    agentSecurity: 'Cyber Security Auditor',
    agentPerformance: 'Optimization Engine',
    agentQa: 'Autonomous QA Engine',
    architectTitle: 'Domain Invariants & C4 Modeling',
    securityTitle: 'SAST & Zero-Trust Verification',
    performanceTitle: 'Space/Time & Concurrency Profiler',
    qaTitle: 'Property & Fuzz Testing Engine',
    triggerAgentScan: 'Run Targeted Analysis',
    recentActivity: 'Recent Agent Logs',
    checksPassed: 'Checks Passed',
    issuesFlagged: 'Issues Flagged',
    patchesApplied: 'Patches Applied',

    // Tests
    qaRunnerTitle: 'AUTONOMOUS QA & PROPERTY TEST RUNNER',
    qaTargetSubtitle: '100% INVARIANT COVERAGE TARGET',
    runAllTestsBtn: 'Execute All Tests',
    fixFailingTestsBtn: 'Self-Heal Failing Tests',
    totalTestsLabel: 'Total Tests',
    passedLabel: 'Passed',
    failedLabel: 'Failed',
    coverageLabel: 'Coverage',
    allPassing: 'All concurrency invariant proptests passed',

    // Architecture & IaC
    architectureTitle: 'C4 SYSTEM ARCHITECTURE & TOPOLOGY',
    architectureSubtitle: 'Domain-Driven Design (DDD) & Distributed State Machine',
    stateTransitions: 'State Machine Transitions',
    deploymentTitle: 'INFRASTRUCTURE AS CODE (IaC) & CONTAINER SPECS',
    deploymentSubtitle: 'Docker, Kubernetes, Helm & Terraform Production Manifests',
    copyManifestBtn: 'Copy Manifest',

    // Blueprint Export Modal
    blueprintModalTitle: '5-Section Enterprise Delivery Blueprint',
    blueprintModalSubtitle: 'Untruncated, production-ready software package and architectural blueprint',
    copyBlueprintBtn: 'Copy Blueprint',
    downloadBlueprintBtn: 'Download Blueprint (.md)',
    closeBtn: 'Close',

    // Status Bar
    branchLabel: 'branch:',
    targetLabel: 'Target:',
    astHealthy: 'AST_HEALTHY: 0 ERR',
    subsystemsActive: '4-Agent Autonomous Subsystems Active',
    heapLabel: 'Heap:',
    systemReady: 'System Ready',
    switchLanguage: 'Switch Language',
  }
};
