"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let postcss;
class PostCSSPluginClass {
    constructor(processors = [], options) {
        this.processors = processors;
        this.options = options;
        this.test = /\.css$/;
        this.dependencies = [];
    }
    init(context) {
        context.allowExtension(".css");
    }
    transform(file) {
        file.addStringDependency("fuse-box-css");
        if (file.isCSSCached("postcss")) {
            return;
        }
        file.bustCSSCache = true;
        file.loadContents();
        let paths = this.options && this.options.paths || [];
        paths.push(file.info.absDir);
        const cssDependencies = file.context.extractCSSDependencies(file, {
            paths: this.options && this.options.paths || [file.info.absDir],
            content: file.contents,
            extensions: ["css"]
        });
        if (!postcss) {
            postcss = require("postcss");
        }
        let generateSourceMaps = true;
        let postCSSPlugins = [];
        if (Array.isArray(this.options)) {
            postCSSPlugins = this.options;
        }
        else {
            if (this.options) {
                if (Array.isArray(this.options.plugins)) {
                    postCSSPlugins = this.options.plugins;
                }
                if (this.options.sourceMaps !== undefined) {
                    generateSourceMaps = this.options.sourceMaps;
                }
            }
        }
        return postcss(this.processors)
            .process(file.contents, postCSSPlugins)
            .then(result => {
            file.contents = result.css;
            if (file.context.useCache) {
                file.analysis.dependencies = cssDependencies;
                file.context.cache.writeStaticCache(file, generateSourceMaps && file.sourceMap, "postcss");
                file.analysis.dependencies = [];
            }
            return result.css;
        });
    }
}
exports.PostCSSPluginClass = PostCSSPluginClass;
exports.PostCSS = (processors, opts) => {
    return new PostCSSPluginClass(processors, opts);
};

//# sourceMappingURL=PostCSSPlugin.js.map
