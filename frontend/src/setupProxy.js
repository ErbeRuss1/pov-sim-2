const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/faro',
    createProxyMiddleware({
      target: 'https://faro-collector-prod-us-west-0.grafana.net',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/faro': '', // remove /faro prefix when forwarding
      },
      headers: {
        'Connection': 'keep-alive',
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Request:', req.method, req.url, '-> https://faro-collector-prod-us-west-0.grafana.net' + req.url.replace('/faro', ''));
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[Proxy] Response:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('[Proxy] Error:', err.message);
      },
      logLevel: 'debug',
    })
  );
};
