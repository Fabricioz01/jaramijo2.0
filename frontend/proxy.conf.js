const PROXY_CONFIG = {
  "/api/**": {
    target: "http://localhost:3000",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: function (proxyReq, req, res) {
      console.log(
        "📡 [PROXY] Redirecting:",
        req.method,
        req.url,
        "-> http://localhost:3000" + req.url
      );
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log("✅ [PROXY] Response:", proxyRes.statusCode, "for", req.url);
    },
    onError: function (err, req, res) {
      console.error("❌ [PROXY] Error:", err.message, "for", req.url);
    },
  },
};

module.exports = PROXY_CONFIG;
