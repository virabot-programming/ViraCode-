import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  createGitboxRepo,
  forkGitboxRepo,
  getGitboxRepoById,
  listGitboxRepos,
} from './src/db/gitbox.ts';
import { getUsers } from './src/db/users.ts';

dotenv.config();

function getCliArg(name: string): string | undefined {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === `--${name}` && args[i + 1]) {
      return args[i + 1];
    }
    if (arg.startsWith(`--${name}=`)) {
      return arg.slice(`--${name}=`.length);
    }
  }
  return undefined;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const isProduction = process.env.NODE_ENV === 'production';
  const cliPort = Number(getCliArg('port'));
  const PORT =
    Number.isFinite(cliPort) && cliPort > 0
      ? cliPort
      : isProduction
        ? Number(process.env.PORT) || 3000
        : 3000;
  const HOST = getCliArg('host') || '0.0.0.0';

  // API Route: Gemini Server-side Generation
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-2.5-flash' } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      res.json({ text: response.text || '' });
    } catch (err: any) {
      console.error('Gemini API Server Error:', err);
      res.status(500).json({ error: err.message || 'Gemini API call failed' });
    }
  });

  // API Route: Authenticated User Profile Sync Verification
  app.get('/api/users', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const users = await getUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  // API Routes: GitBox by VBP (Cloud SQL PostgreSQL + Firebase Auth)
  app.get('/api/gitbox', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const repos = await listGitboxRepos();
      res.json(repos);
    } catch (err: any) {
      console.error('Failed to load GitBox repositories:', err);
      res.status(500).json({ error: err.message || 'Failed to load repositories' });
    }
  });

  app.post('/api/gitbox', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUserId) {
        return res.status(401).json({ error: 'Unauthorized: User account missing' });
      }
      const { name, description, author, primaryLanguage, files } = req.body;
      const newRepo = await createGitboxRepo({
        userId: req.dbUserId,
        name: name || 'Untitled Repository',
        description: description || 'Created via GitBox by VBP',
        author: author || req.user?.name || req.user?.email || 'Anonymous Developer',
        primaryLanguage: primaryLanguage || 'typescript',
        files: Array.isArray(files) ? files : [],
      });
      res.json(newRepo);
    } catch (err: any) {
      console.error('Failed to create GitBox repository:', err);
      res.status(500).json({ error: err.message || 'Failed to create repository' });
    }
  });

  app.get('/api/gitbox/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const repo = await getGitboxRepoById(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: 'GitBox repository not found' });
      }
      res.json(repo);
    } catch (err: any) {
      console.error('Failed to get GitBox repository:', err);
      res.status(500).json({ error: err.message || 'Failed to load repository' });
    }
  });

  app.post('/api/gitbox/:id/fork', requireAuth, async (req: AuthRequest, res) => {
    try {
      const repo = await forkGitboxRepo(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: 'GitBox repository not found' });
      }
      res.json(repo);
    } catch (err: any) {
      console.error('Failed to fork GitBox repository:', err);
      res.status(500).json({ error: err.message || 'Failed to fork repository' });
    }
  });

  // History deletion is permanently disabled on server
  app.delete('/api/gitbox', (_req, res) => {
    res.status(403).json({ error: 'GitBox history deletion is disabled.' });
  });

  // Setup Vite middleware in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 ViraCode IDE Server running on http://${HOST}:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
