const vueCompiler = require('@vue/component-compiler')

const parseUrl = require('parseurl')
const {
  transformModuleImports
} = require('./transformModuleImports')
const {
  loadPkg
} = require('./loadPkg')
const {
  readSource
} = require('./readSource')
const {
  tryCache,
  cacheData
} = require('../cache')
const {
  readFile
} = require("fs-extra");
const path = require("path");
const vueMiddleware = (ctx) => {
  const {
    root
  } = ctx;
  const compiler = vueCompiler.createDefaultCompiler()

  function send(res, source, mime) {
    res.setHeader('Content-Type', mime)
    res.end(source)
  }

  function injectSourceMapToBlock(block, lang) {
    const map = Base64.toBase64(
      JSON.stringify(block.map)
    )
    let mapInject

    switch (lang) {
      case 'js':
        mapInject = `//# sourceMappingURL=data:application/json;base64,${map}\n`;
        break;
      case 'css':
        mapInject = `/*# sourceMappingURL=data:application/json;base64,${map}*/\n`;
        break;
      default:
        break;
    }

    return {
      ...block,
      code: mapInject + block.code
    }
  }

  function injectSourceMapToScript(script) {
    return injectSourceMapToBlock(script, 'js')
  }

  function injectSourceMapsToStyles(styles) {
    return styles.map(style => injectSourceMapToBlock(style, 'css'))
  }

  async function bundleSFC(req) {
    const {
      filepath,
      source,
      updateTime
    } = await readSource(req)
    const descriptorResult = compiler.compileToDescriptor(filepath, source)
    const assembledResult = vueCompiler.assemble(compiler, filepath, {
      ...descriptorResult,
      script: injectSourceMapToScript(descriptorResult.script),
      styles: injectSourceMapsToStyles(descriptorResult.styles)
    })
    return {
      ...assembledResult,
      updateTime
    }
  }

  return async (req, res, next) => {
    if (req.path.endsWith('.vue')) {
      const key = parseUrl(req).pathname
      let out = await tryCache(key);
      if (!out) {
        // Bundle Single-File Component
        const result = await bundleSFC(req)
        out = result
        cacheData(key, out, result.updateTime)
      }

      send(res, out.code, 'application/javascript')
    } else if (req.path.endsWith('.js')) {
      const key = parseUrl(req).pathname
      let out = await tryCache(key)

      if (!out) {
        // transform import statements
        const result = await readSource(req)
        out = transformModuleImports(result.source)
        cacheData(key, out, result.updateTime)
      }

      send(res, out, 'application/javascript')
    } else if (req.path.startsWith('/__modules/')) {
      const key = parseUrl(req).pathname
      const pkg = req.path.replace(/^\/__modules\//, '')

      let out = await tryCache(key, false) // Do not outdate modules
      if (!out) {
        out = (await loadPkg(pkg)).toString()
        cacheData(key, out, false) // Do not outdate modules
      }

      send(res, out, 'application/javascript')
    } else if (req.path.endsWith('.html')) {
      const html = await readFile(path.join(root, req.path), "utf8");
      res.statusCode = 200;
      console.log(html);
      send(res, html, 'text/html')
    } else {
      next()
    }
  }
}

exports.vueMiddleware = vueMiddleware