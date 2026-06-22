const http = require('http');
const fs = require('fs');
const path = require('path');

const errorLog = [];

function addTypename(obj, type, parentKey) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    // Determine item type based on parent context
    let itemType = type;
    if (parentKey === 'nodes') {
      // nodes array - determine type from grandparent or context
      if (type === 'CategoryNodeList') itemType = 'CategoryType';
      else if (type === 'MangaNodeList') itemType = 'MangaType';
      else if (type === 'ChapterNodeList') itemType = 'ChapterType';
      else if (type === 'SourceNodeList') itemType = 'SourceType';
      else if (type === 'ExtensionNodeList') itemType = 'ExtensionType';
      else if (type === 'TrackRecordNodeList') itemType = 'TrackRecordType';
      else if (type === 'MetaTypeNodeList') itemType = 'MetaType';
      else itemType = 'MangaType'; // default
    }
    return obj.map(item => addTypename(item, itemType, parentKey));
  }
  
  // Clone to avoid mutating original
  const result = { ...obj };
  if (type && !result.__typename) {
    result.__typename = type;
  }
  
  Object.keys(result).forEach(key => {
    const val = result[key];
    if (val && typeof val === 'object') {
      // Determine typename based on key name and parent context
      let childType = key;
      
      // For list wrapper objects (have nodes + pageInfo + totalCount)
      if (key === 'mangas') childType = 'MangaNodeList';
      else if (key === 'categories') childType = 'CategoryNodeList';
      else if (key === 'chapters') childType = 'ChapterNodeList';
      else if (key === 'sources') childType = 'SourceNodeList';
      else if (key === 'extensions') childType = 'ExtensionNodeList';
      else if (key === 'trackRecords') childType = 'TrackRecordNodeList';
      else if (key === 'metas') childType = 'MetaTypeNodeList';
      // For nodes arrays, pass through the parent type so array items get correct typename
      else if (key === 'nodes') childType = type;
      // For single objects
      else if (key === 'pageInfo') childType = 'PageInfo';
      else if (key === 'meta') childType = 'MangaMetaType';
      else if (key === 'source') childType = 'SourceType';
      else if (key === 'firstUnreadChapter') childType = 'ChapterType';
      else if (key === 'lastReadChapter') childType = 'ChapterType';
      else if (key === 'latestReadChapter') childType = 'ChapterType';
      else if (key === 'latestFetchedChapter') childType = 'ChapterType';
      else if (key === 'latestUploadedChapter') childType = 'ChapterType';
      else if (key === 'highestNumberedChapter') childType = 'ChapterType';
      else if (key === 'settings') childType = 'ServerSettingsType';
      else if (key === 'aboutServer') childType = 'AboutServerPayload';
      else if (key === 'aboutWebUI') childType = 'AboutWebUIPayload';
      else if (key === 'downloadStatus') childType = 'DownloadStatus';
      else if (key === 'info') childType = 'WebUIUpdateInfo';
      else if (key === 'checkForServerUpdates') childType = 'CheckForServerUpdatesPayload';
      else if (key === 'checkForWebUIUpdate') childType = 'CheckForWebUIUpdatePayload';
      else if (key === 'getWebUIUpdateStatus') childType = 'WebUIUpdateStatus';
      else if (key === 'category') childType = 'CategoryType';
      else if (key === 'manga') childType = 'MangaType';
      else if (key === 'chapter') childType = 'ChapterType';
      
      result[key] = addTypename(val, childType, key);
    }
  });
  
  return result;
}

function createManga(id, title, thumbnailUrl, unreadCount, artist, author, description, genre, status) {
  return {
    __typename: 'MangaType',
    id, title, thumbnailUrl, unreadCount, downloadCount: 0, inLibrary: true, sourceId: '1', url: '', artist, author, description, genre, status,
    lastReadAt: Date.now(), lastFetchedAt: Date.now(), inLibraryAt: Date.now(),
    thumbnailUrlLastFetched: Date.now(), initialized: true,
    bookmarkCount: 0, hasDuplicateChapters: false,
    chapters: { __typename: 'ChapterNodeList', totalCount: 5 },
    firstUnreadChapter: { __typename: 'ChapterType', id: 3, sourceOrder: 3, isRead: false, mangaId: id, chapterNumber: '3', name: 'Chapter 3', scanlator: 'MangaPlus' },
    lastReadChapter: { __typename: 'ChapterType', id: 2, sourceOrder: 2, lastReadAt: Date.now() - 86400000 },
    latestReadChapter: { __typename: 'ChapterType', id: 2, sourceOrder: 2, lastReadAt: Date.now() - 86400000 },
    latestFetchedChapter: { __typename: 'ChapterType', id: 5, fetchedAt: Date.now() },
    latestUploadedChapter: { __typename: 'ChapterType', id: 5, uploadDate: Date.now() },
    highestNumberedChapter: { __typename: 'ChapterType', id: 5, chapterNumber: '5' },
    source: { __typename: 'SourceType', id: '1', name: 'MangaDex', lang: 'en', iconUrl: '', supportsLatest: true, isNsfw: false, displayName: 'MangaDex' },
    trackRecords: { __typename: 'TrackRecordNodeList', totalCount: 0, nodes: [] },
    meta: [],
    realUrl: '',
  };
}

const demoMangas = [
  createManga(1, 'One Piece', 'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg', 5, 'Eiichiro Oda', 'Eiichiro Oda', 'Follows the adventures of Monkey D. Luffy and his pirate crew.', ['Action', 'Adventure', 'Comedy', 'Fantasy'], 'ONGOING'),
  createManga(2, 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg', 3, 'Gege Akutami', 'Gege Akutami', 'A boy swallows a cursed talisman and enters a world of sorcerers.', ['Action', 'Supernatural', 'Horror'], 'COMPLETED'),
  createManga(3, 'Chainsaw Man', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Chainsaw_Man_volume_1.jpg', 0, 'Tatsuki Fujimoto', 'Tatsuki Fujimoto', 'A young man merges with his pet devil to become Chainsaw Man.', ['Action', 'Horror', 'Supernatural'], 'ONGOING'),
  createManga(4, 'Spy x Family', 'https://upload.wikimedia.org/wikipedia/en/5/53/Spy_%C3%97_Family_volume_1.jpg', 2, 'Tatsuya Endo', 'Tatsuya Endo', 'A spy must build a fake family for his mission.', ['Action', 'Comedy', 'Slice of Life'], 'ONGOING'),
  createManga(5, 'Demon Slayer', 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg', 0, 'Koyoharu Gotouge', 'Koyoharu Gotouge', 'A boy becomes a demon slayer to save his sister.', ['Action', 'Supernatural', 'Historical'], 'COMPLETED'),
  createManga(6, 'My Hero Academia', 'https://upload.wikimedia.org/wikipedia/en/5/5a/My_Hero_Academia_volume_1.jpg', 8, 'Kohei Horikoshi', 'Kohei Horikoshi', 'In a world of superpowers, one boy dreams of becoming a hero.', ['Action', 'Superhero', 'Comedy'], 'COMPLETED'),
];

const demoChapters = [
  { __typename: 'ChapterType', id: 1, name: 'Chapter 1: The Beginning', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 7, isRead: true, isBookmarked: false, isDownloaded: false, pageCount: 24, lastPageRead: 24, mangaId: 1 },
  { __typename: 'ChapterType', id: 2, name: 'Chapter 2: New World', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 6, isRead: true, isBookmarked: false, isDownloaded: false, pageCount: 22, lastPageRead: 22, mangaId: 1 },
  { __typename: 'ChapterType', id: 3, name: 'Chapter 3: The Crew', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 5, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 26, lastPageRead: 0, mangaId: 1 },
  { __typename: 'ChapterType', id: 4, name: 'Chapter 4: Adventure Begins', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 4, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 20, lastPageRead: 0, mangaId: 1 },
  { __typename: 'ChapterType', id: 5, name: 'Chapter 5: The Enemy', scanlator: 'MangaPlus', uploadDate: Date.now() - 86400000 * 3, isRead: false, isBookmarked: false, isDownloaded: false, pageCount: 28, lastPageRead: 0, mangaId: 1 },
];

function handleGraphQL(query, variables) {
  const opMatch = query.match(/(query|mutation)\s+(\w+)/);
  const opName = opMatch ? opMatch[2] : '';
  
  const responses = {
    GET_CATEGORIES_LIBRARY: {
      __typename: 'Query',
      categories: {
        __typename: 'CategoryNodeList',
        nodes: [
          { __typename: 'CategoryType', id: 1, name: 'Reading', order: 0, default: false, mangas: { __typename: 'MangaNodeList', nodes: demoMangas.slice(0, 3), totalCount: 3, pageInfo: { __typename: 'PageInfo', hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
          { __typename: 'CategoryType', id: 2, name: 'Completed', order: 1, default: false, mangas: { __typename: 'MangaNodeList', nodes: demoMangas.slice(3, 5), totalCount: 2, pageInfo: { __typename: 'PageInfo', hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
          { __typename: 'CategoryType', id: 3, name: 'Plan to Read', order: 2, default: false, mangas: { __typename: 'MangaNodeList', nodes: [demoMangas[5]], totalCount: 1, pageInfo: { __typename: 'PageInfo', hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
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
      aboutServer: { version: '1.0.0', buildType: 'Stable', buildTime: Date.now(), discord: '', github: '', name: 'Kotatsu Server' },
      aboutWebUI: { channel: 'STABLE', tag: 'r1', updateTimestamp: Date.now() }
    },
    GET_GLOBAL_METADATAS: {
      metas: {
        nodes: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_MANGAS: {
      mangas: {
        nodes: demoMangas,
        totalCount: demoMangas.length,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' }
      }
    },
    GET_MANGAS_LIBRARY: {
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
    CHECK_FOR_SERVER_UPDATES: {
      checkForServerUpdates: { channel: 'STABLE', tag: 'v1.0.0', url: '' }
    },
    CHECK_FOR_WEBUI_UPDATE: {
      checkForWebUIUpdate: { channel: 'STABLE', tag: 'r1', updateAvailable: false }
    },
    GET_WEBUI_UPDATE_STATUS: {
      getWebUIUpdateStatus: { info: { channel: 'STABLE', tag: 'r1' }, progress: 0, state: 'STOPPED' }
    },
    GET_EXTENSIONS_FETCH: {
      fetchExtensions: { __typename: 'FetchExtensionsPayload', extensions: [] }
    },
    UPDATE_GLOBAL_METADATA: {
      preUpdateDeletedMeta: { metas: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
      updatedMeta: { metas: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
      postUpdateDeletedMeta: { metas: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
      migratedMeta: { metas: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: '', endCursor: '' } } },
    },
  };
  
  if (responses[opName]) {
    return addTypename(responses[opName], 'Query');
  }
  
  // Fallback: try to extract root field
  const fieldMatch = query.match(/\{\s*(\w+)/);
  const rootField = fieldMatch ? fieldMatch[1] : '';
  
  switch(rootField) {
    case 'categories': return addTypename(responses.GET_CATEGORIES_LIBRARY, 'Query');
    case 'mangas': return addTypename(responses.GET_MANGAS, 'Query');
    case 'manga': return addTypename(responses.GET_MANGA, 'Query');
    case 'chapters': return addTypename(responses.GET_CHAPTERS_MANGA, 'Query');
    case 'chapter': return addTypename(responses.GET_CHAPTER, 'Query');
    case 'sources': return addTypename(responses.GET_SOURCES, 'Query');
    case 'extensions': return addTypename(responses.GET_EXTENSIONS, 'Query');
    case 'downloadStatus': return addTypename(responses.GET_DOWNLOAD_STATUS, 'Query');
    case 'settings': return addTypename(responses.GET_SERVER_SETTINGS, 'Query');
    case 'about': return addTypename(responses.GET_ABOUT, 'Query');
    case 'globalMeta': return addTypename(responses.GET_GLOBAL_METADATAS, 'Query');
    default: return addTypename({ [rootField]: null }, 'Query');
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

  if (req.url === '/api/errors') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorLog.slice(-50)));
    return;
  }

  if (req.url === '/api/log-error' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const err = JSON.parse(body);
        errorLog.push(err);
        console.log('CLIENT ERROR:', JSON.stringify(err, null, 2));
      } catch(e) {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
    return;
  }

  if (req.url === '/api/graphql' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        console.log('GraphQL request:', body.substring(0, 200));
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
