const http = require('http');
const fs = require('fs');
const path = require('path');

const demoMangas = [
  { id: 1, title: 'One Piece', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg', unreadCount: 5, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Eiichiro Oda', author: 'Eiichiro Oda', description: 'Follows the adventures of Monkey D. Luffy and his pirate crew.', genre: ['Action', 'Adventure', 'Comedy', 'Fantasy'], status: 'ONGOING', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
  { id: 2, title: 'Jujutsu Kaisen', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg', unreadCount: 3, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Gege Akutami', author: 'Gege Akutami', description: 'A boy swallows a cursed talisman and enters a world of sorcerers.', genre: ['Action', 'Supernatural', 'Horror'], status: 'COMPLETED', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
  { id: 3, title: 'Chainsaw Man', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Chainsaw_Man_volume_1.jpg', unreadCount: 0, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Tatsuki Fujimoto', author: 'Tatsuki Fujimoto', description: 'A young man merges with his pet devil to become Chainsaw Man.', genre: ['Action', 'Horror', 'Supernatural'], status: 'ONGOING', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
  { id: 4, title: 'Spy x Family', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Spy_%C3%97_Family_volume_1.jpg', unreadCount: 2, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Tatsuya Endo', author: 'Tatsuya Endo', description: 'A spy must build a fake family for his mission.', genre: ['Action', 'Comedy', 'Slice of Life'], status: 'ONGOING', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
  { id: 5, title: 'Demon Slayer', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg', unreadCount: 0, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Koyoharu Gotouge', author: 'Koyoharu Gotouge', description: 'A boy becomes a demon slayer to save his sister.', genre: ['Action', 'Supernatural', 'Historical'], status: 'COMPLETED', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
  { id: 6, title: 'My Hero Academia', thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5a/My_Hero_Academia_volume_1.jpg', unreadCount: 8, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist: 'Kohei Horikoshi', author: 'Kohei Horikoshi', description: 'In a world of superpowers, one boy dreams of becoming a hero.', genre: ['Action', 'Superhero', 'Comedy'], status: 'COMPLETED', lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now() },
];

const demoChapters = [
  { id: 1, name: 'Chapter 1: The Beginning', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 7, isRead: true, isBookmarked: false, isDownloaded: false, pageCount: 24, lastPageRead: 24, mangaId: 1 },
  { id: 2, name: 'Chapter 2: New World', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 6, isRead: true, isBookmarked: false, isDownloaded: false, pageCount: 22, lastPageRead: 22, mangaId: 1 },
  { id: 3, name: 'Chapter 3: The Crew', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 5, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 26, lastPageRead: 0, mangaId: 1 },
  { id: 4, name: 'Chapter 4: Adventure Begins', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 4, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 20, lastPageRead: 0, mangaId: 1 },
  { id: 5, name: 'Chapter 5: The Enemy', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 3, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 28, lastPageRead: 0, mangaId: 1 },
];

function handleGraphQL(query, variables) {
  // Extract operation name
  const opMatch = query.match(/(query|mutation)\s+(\w+)/);
  const opName = opMatch ? opMatch[2] : '';
  
  // Map operation names to responses
  const responses = {
    GET_CATEGORIES_LIBRARY: {
      categories: {
        nodes: [
          { id: 1, name: 'Reading', order: 0, default: false, mangas: { nodes: demoMangas.slice(0, 3), totalCount: 3, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
          { id: 2, name: 'Completed', order: 1, default: false, mangas: { nodes: demoMangas.slice(3, 5), totalCount: 2, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
          { id: 3, name: 'Plan to Read', order: 2, default: false, mangas: { nodes: [demoMangas[5]], totalCount: 1, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
        ],
        totalCount: 3,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_CATEGORY_MANGAS: {
      category: {
        id: variables?.id || 1,
        mangas: {
          nodes: demoMangas,
          totalCount: demoMangas.length,
          pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
        }
      }
    },
    GET_MANGA: {
      manga: {
        ...demoMangas[0],
        chapters: { nodes: demoChapters, totalCount: demoChapters.length, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } }
      }
    },
    GET_MANGA_SCREEN: {
      manga: {
        ...demoMangas[0],
        chapters: { nodes: demoChapters, totalCount: demoChapters.length, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } }
      }
    },
    GET_CHAPTERS_MANGA: {
      chapters: {
        nodes: demoChapters,
        totalCount: demoChapters.length,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_CHAPTER: {
      chapter: demoChapters[0]
    },
    GET_SOURCES: {
      sources: {
        nodes: [{ id: '1', name: 'MangaDex', lang: 'en', iconUrl: '', supportsLatest: true, isNsfw: false, displayName: 'MangaDex' }],
        totalCount: 1,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_EXTENSIONS: {
      extensions: {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_DOWNLOAD_STATUS: {
      downloadStatus: { queue: [] }
    },
    GET_SERVER_SETTINGS: {
      settings: {
        autoDownloadNewChapters: false, autoDownloadNewChaptersLimit: 0, backupInterval: 1, backupPath: '', backupTTL: 14, backupTime: '00:00',
        basicAuthEnabled: false, basicAuthPassword: '', basicAuthUsername: '', debugLogsEnabled: false, downloadAsCbz: false, downloadsPath: '',
        electronPath: '', excludeCompletedEntriesFromDownload: false, excludeNotStartedEntriesFromDownload: false, extensionRepos: [],
        flareSolverrEnabled: false, flareSolverrSessionName: '', flareSolverrSessionTtl: 15, flareSolverrTimeout: 60, flareSolverrUrl: '',
        gqlDebugLogsEnabled: false, initialOpenInBrowserEnabled: false, ip: '0.0.0.0', localSourcePath: '', maxSourcesInParallel: 6, port: 4567,
        socksProxyEnabled: false, socksProxyHost: '', socksProxyPassword: '', socksProxyPort: '', socksProxyUsername: '', systemTrayEnabled: false,
        updateMangas: false, webUIChannel: 'STABLE', webUIEnabled: true, webUIFlavor: 'WEBUI', webUIInterface: 'BROWSER', webUIUpdateCheckInterval: 0
      }
    },
    GET_ABOUT: {
      about: {
        aboutServer: { version: '1.0.0', revision: 'abc123', buildType: 'Stable' },
        aboutWebUI: { channel: 'STABLE', tag: 'r1', updateTimestamp: Date.now() }
      }
    },
    GET_GLOBAL_METADATAS: {
      globalMeta: []
    },
    GET_MANGAS: {
      mangas: {
        nodes: demoMangas,
        totalCount: demoMangas.length,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_CATEGORIES_BASE: {
      categories: {
        nodes: [
          { id: 1, name: 'Reading', order: 0, default: false },
          { id: 2, name: 'Completed', order: 1, default: false },
          { id: 3, name: 'Plan to Read', order: 2, default: false },
        ],
        totalCount: 3,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_CATEGORIES_SETTINGS: {
      categories: {
        nodes: [
          { id: 1, name: 'Reading', order: 0, default: false },
          { id: 2, name: 'Completed', order: 1, default: false },
          { id: 3, name: 'Plan to Read', order: 2, default: false },
        ],
        totalCount: 3,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
  };
  
  if (responses[opName]) {
    return responses[opName];
  }
  
  // Fallback: try to extract root field
  const fieldMatch = query.match(/\{\s*(\w+)/);
  const rootField = fieldMatch ? fieldMatch[1] : '';
  
  switch(rootField) {
    case 'categories': return responses.GET_CATEGORIES_LIBRARY;
    case 'mangas': return responses.GET_MANGAS;
    case 'manga': return responses.GET_MANGA;
    case 'chapters': return responses.GET_CHAPTERS_MANGA;
    case 'chapter': return responses.GET_CHAPTER;
    case 'sources': return responses.GET_SOURCES;
    case 'extensions': return responses.GET_EXTENSIONS;
    case 'downloadStatus': return responses.GET_DOWNLOAD_STATUS;
    case 'settings': return responses.GET_SERVER_SETTINGS;
    case 'about': return responses.GET_ABOUT;
    case 'globalMeta': return responses.GET_GLOBAL_METADATAS;
    default: return { [rootField]: null };
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/graphql' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { query, variables } = JSON.parse(body);
        const data = handleGraphQL(query, variables);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: e.message }] }));
      }
    });
    return;
  }

  // Serve static files from build directory
  let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // Fallback to index.html for SPA routing
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'build', 'index.html')));
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Kotatsu server running on http://0.0.0.0:${PORT}`);
});
