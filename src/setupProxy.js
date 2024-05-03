const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', 
    createProxyMiddleware({
      target: 'https://budget-app-j98yq.ondigitalocean.app/', 
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', 
      },
      secure: true,  
    })
  );
};

