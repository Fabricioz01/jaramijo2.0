const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 4200;
const STATIC_PATH = path.join(
  __dirname,
  "dist",
  "municipio-jaramijo",
  "browser"
);

console.log(`📁 Static path: ${STATIC_PATH}`);

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Función para hacer proxy a la API
function proxyToAPI(req, res) {
  console.log(
    `🔄 Proxy request: ${req.method} ${req.url} -> http://localhost:3000${req.url}`
  );

  const options = {
    hostname: "localhost",
    port: 3000,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: "localhost:3000",
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`✅ Proxy response: ${proxyRes.statusCode} for ${req.url}`);

    // Configurar CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    // Copiar headers de respuesta
    Object.keys(proxyRes.headers).forEach((key) => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    res.statusCode = proxyRes.statusCode;
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.log(`❌ Proxy error: ${err.message}`);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Proxy error", message: err.message }));
  });

  // Pipe the request
  req.pipe(proxyReq);
}

// Función para servir archivos estáticos
function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(`❌ Error reading file: ${filePath}`);
      res.statusCode = 404;
      res.end("File not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    console.log(`📄 Serving static file: ${filePath}`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(content);
  });
}

// Crear el servidor
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.statusCode = 200;
    res.end();
    return;
  }

  // Si es una llamada a la API, hacer proxy
  if (pathname.startsWith("/api")) {
    proxyToAPI(req, res);
    return;
  }

  // Determinar qué archivo servir
  let filePath;
  if (pathname === "/") {
    filePath = path.join(STATIC_PATH, "index.html");
  } else {
    filePath = path.join(STATIC_PATH, pathname);
  }

  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si no existe, servir index.html para SPA routing
      console.log(
        `📄 File not found, serving index.html for SPA route: ${pathname}`
      );
      filePath = path.join(STATIC_PATH, "index.html");
    }

    serveStatic(req, res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${STATIC_PATH}`);
  console.log(`🔄 API proxy configured for /api/* -> http://localhost:3000`);
});
