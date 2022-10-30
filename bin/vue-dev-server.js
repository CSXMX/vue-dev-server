#!/usr/bin/env node

const express = require('express');
const {
  vueMiddleware
} = require('../compiler/middleware');
const {
  hmrMiddleware
} = require('../hmr');

const ctx = {};
const app = express()
const root = process.cwd();
const {
  WebSocketServer,
} = require("ws");
const chokidar = require("chokidar");

const ws = new WebSocketServer({
  port: 23456
});
ws.on("connection", (socket) => {
  socket.send(JSON.stringify({
    type: "connected"
  }));
});
ws.on("error", (e) => {
  if (e.code !== "EADDRINUSE") {
    console.error(red(`WebSocket server error:\n${e.stack || e.message}`));
  }
});

const watcher = chokidar.watch(root, {
  ignored: ["**/node_modules/**", "**/.git/**"],
  ignoreInitial: true,
});
watcher.on("change", async (file) => {
  ws.clients.forEach(async (client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: "update",
        file,
        root: ctx.root
      }));
      console.log('路径：', file, '，文件已改变');
    }
  });
})
ctx.root = root;
ctx.app = app;

app.use(hmrMiddleware(ctx))
app.use(vueMiddleware(ctx))
app.use(express.static(root))


app.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})