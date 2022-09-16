var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/options.ts
var defaultOptions = {
  includeJs: true,
  includeCss: true
};

// src/index.ts
import { createFilter } from "@rollup/pluginutils";

// src/dom-utils.ts
import { JSDOM } from "jsdom";
var createDom = (source) => new JSDOM(source);
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
import prettier from "prettier";
var jsFilter = createFilter(["**/*.*.js"]);
var cssFilter = createFilter(["**/*.*.css"]);
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
        return prettier.format(dom.serialize(), { parser: "html" });
      }
    }
  };
}
export {
  VitePluginPreloadAll as default
};
