"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LIST = new Set([
    "assert",
    "buffer",
    "child_process",
    "crypto",
    "events",
    "fs",
    "http",
    "https",
    "module",
    "net",
    "os",
    "path",
    "process",
    "querystring",
    "stream",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "zlib"
]);
function isPolyfilledByFuseBox(name) {
    return LIST.has(name);
}
exports.isPolyfilledByFuseBox = isPolyfilledByFuseBox;

//# sourceMappingURL=ServerPolyfillList.js.map
