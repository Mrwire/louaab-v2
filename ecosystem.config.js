module.exports = {
  apps : [{
    name   : "louaab-frontend",
    script : "npm",
    args   : "run start",
    cwd    : "/root/louaab-project",
    env: {
      NODE_ENV: "production",
    }
  }, {
    name   : "louaab-backend",
    script : "node",
    args   : "dist/backend/main.js",
    cwd    : "/root/louaab-project",
    env: {
      NODE_ENV: "production",
    }
  }]
}
