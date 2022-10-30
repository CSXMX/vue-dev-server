const path = require("path");
const {
  pathExists,
  readFile
} = require("fs-extra");


const transformIndexHtml = (html) => {
  return html.replace(
    /(<head[^>]*>)/i,
    `$1<script type="module" src="/client/index.js"></script>`
  );

}
const hmrMiddleware = (ctx) => {
  return async (req, res, next) => {
    if (req.url === "/") {
      const {
        root
      } = ctx;
      const indexHtmlPath = path.join(root, "index.html");
      if (await pathExists(indexHtmlPath)) {
        const rawHtml = await readFile(indexHtmlPath, "utf8");
        let html = rawHtml;
        html = await transformIndexHtml(html);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        return res.end(html);
      }
    }
    return next();
  }
}

exports.hmrMiddleware = hmrMiddleware