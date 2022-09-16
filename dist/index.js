var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => VitePluginPreloadAll
});

// src/options.ts
var defaultOptions = {
  includeJs: true,
  includeCss: true
};

// src/index.ts
var import_pluginutils = require("@rollup/pluginutils");

// src/dom-utils.ts
var import_jsdom = require("jsdom");
var createDom = (source) => new import_jsdom.JSDOM(source);
var createModulePreloadLinkElement = (dom, path) => {
  const link = dom.window.document.createElement("link");
  link.rel = "modulepreload";
  link.href = path;
  return link;
};
var createStylesheetLinkElement = (dom, path) => {
  const link = dom.window.document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  return link;
};
var getExistingLinks = (dom) => {
  const existingLinks = [];
  dom.window.document.querySelectorAll("script").forEach((s) => {
    if (!s.src) {
      return;
    }
    existingLinks.push(s.src);
  });
  dom.window.document.querySelectorAll("link").forEach((l) => existingLinks.push(l.href));
  return existingLinks;
};
var appendToDom = (dom, link) => dom.window.document.head.appendChild(link);

// src/index.ts
var import_prettier = __toESM(require("prettier"));
var jsFilter = (0, import_pluginutils.createFilter)(["**/*.*.js"]);
var cssFilter = (0, import_pluginutils.createFilter)(["**/*.*.css"]);
function VitePluginPreloadAll(options) {
  let viteConfig;
  const mergedOptions = __spreadValues(__spreadValues({}, defaultOptions), options);
  return {
    name: "vite:vite-plugin-preload",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      viteConfig = config;
    },
    transformIndexHtml: {
      enforce: "post",
      transform: (html, ctx) => {
        var _a;
        if (!ctx.bundle) {
          return html;
        }
        const dom = createDom(html);
        const existingLinks = getExistingLinks(dom);
        let additionalModules = [];
        let additionalStylesheets = [];
        for (const bundle of Object.values(ctx.bundle)) {
          const path = `${(_a = viteConfig.server.base) != null ? _a : ""}/${bundle.fileName}`;
          if (existingLinks.includes(path)) {
            continue;
          }
          if (mergedOptions.includeJs && bundle.type === "chunk" && jsFilter(bundle.fileName)) {
            additionalModules.push(path);
          }
          if (mergedOptions.includeCss && bundle.type === "asset" && cssFilter(bundle.fileName)) {
            additionalStylesheets.push(path);
          }
        }
        additionalModules = additionalModules.sort((a, z) => a.localeCompare(z));
        additionalStylesheets = additionalStylesheets.sort((a, z) => a.localeCompare(z));
        for (const additionalModule of additionalModules) {
          const element = createModulePreloadLinkElement(dom, additionalModule);
          appendToDom(dom, element);
        }
        for (const additionalStylesheet of additionalStylesheets) {
          const element = createStylesheetLinkElement(dom, additionalStylesheet);
          appendToDom(dom, element);
        }
        return import_prettier.default.format(dom.serialize(), { parser: "html" });
      }
    }
  };
}
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
