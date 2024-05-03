const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', 
    createProxyMiddleware({
      target: 'https://budget-application-zbnmx.ondigitalocean.app/', 
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', 
      },
      secure: false,
    })
  );
};

