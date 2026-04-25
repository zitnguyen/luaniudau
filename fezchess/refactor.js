const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Import Suspense and lazy
if (!content.includes('Suspense, lazy')) {
  content = content.replace(
    'import { useEffect } from "react";',
    'import { useEffect, Suspense, lazy } from "react";'
  );
}

// 2. Replace page imports with lazy imports
content = content.replace(/^import\s+([A-Za-z0-9_]+)\s+from\s+["'](\.\/pages\/[^"']+)["'];$/gm, 'const $1 = lazy(() => import("$2"));');

// 3. Wrap <Routes> with Suspense
if (!content.includes('<Suspense fallback=')) {
  content = content.replace(
    '<Routes>',
    '<Suspense fallback={<div className="flex h-screen items-center justify-center">Đang tải trang...</div>}>\n            <Routes>'
  );

  content = content.replace(
    '</Routes>',
    '</Routes>\n            </Suspense>'
  );
}

fs.writeFileSync(appPath, content);
console.log("Refactoring App.jsx done!");
