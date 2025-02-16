module.exports = {
  apps: [
    {
      name: "watsapp-broadcast",
      script: "./index.js",
      env: {
        NODE_ENV: "development",
        PORT: 2010,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 2010,
      },
    },
  ],
};
