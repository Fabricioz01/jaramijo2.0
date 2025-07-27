const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4200;
const DIST_PATH = path.join(__dirname, "dist", "municipio-jaramijo", "browser");

console.log("📁 Starting development server...");
console.log(`📁 Static files from: ${DIST_PATH}`);

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Configurar CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy para API calls usando http-proxy-middleware
const apiProxy = createProxyMiddleware("/api", {
  target: "http://localhost:3000",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/api", // mantener el prefijo /api
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `🔄 Proxying: ${req.method} ${req.url} -> http://localhost:3000${req.url}`
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Proxy response: ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error("❌ Proxy error:", err.message);
    res.status(500).json({
      error: "Proxy Error",
      message: err.message,
      url: req.url,
      method: req.method,
    });
  },
  logLevel: "debug",
});

app.use("/api", apiProxy);

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(
  express.static(DIST_PATH, {
    setHeaders: (res, path) => {
      console.log(`📄 Serving static: ${path}`);
    },
  })
);

// Catch-all handler para SPA routing
app.get("*", (req, res) => {
  const indexPath = path.join(DIST_PATH, "index.html");

  if (fs.existsSync(indexPath)) {
    console.log(`📄 Serving index.html for SPA route: ${req.url}`);
    res.sendFile(indexPath);
  } else {
    console.error(`❌ index.html not found at: ${indexPath}`);
    res.status(404).send("Application not built. Run npm run build first.");
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(
    `🔄 API Proxy: http://localhost:${PORT}/api/* -> http://localhost:3000/api/*`
  );
  console.log(`📁 Static files: ${DIST_PATH}`);
  console.log("📡 Server ready to handle requests...");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 Shutting down development server...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📴 Shutting down development server...");
  process.exit(0);
});
