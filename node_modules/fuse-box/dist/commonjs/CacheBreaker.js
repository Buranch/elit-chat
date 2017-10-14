"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
const path = require("path");
const Utils_1 = require("./Utils");
const fs = require("fs");
const log = require("fliplog");
function breakCache() {
    const mainFile = require.main.filename;
    const fileKey = Utils_1.fastHash(mainFile);
    const currentStat = fs.statSync(mainFile);
    const fileModificationTime = currentStat.mtime.getTime();
    const bustingCacheFolder = path.join(Config_1.Config.NODE_MODULES_DIR, "fuse-box/.cache-busting");
    Utils_1.ensureDir(bustingCacheFolder);
    const infoFile = path.join(bustingCacheFolder, fileKey);
    if (fs.existsSync(infoFile)) {
        const lastModifiedStored = fs.readFileSync(infoFile).toString();
        if (fileModificationTime.toString() !== lastModifiedStored) {
            log.white(``).echo();
            log.white(`-- cache cleared ---`).echo();
            Utils_1.removeFolder(Config_1.Config.TEMP_FOLDER);
            fs.writeFileSync(infoFile, fileModificationTime.toString());
        }
    }
    else {
        fs.writeFileSync(infoFile, fileModificationTime.toString());
    }
}
exports.breakCache = breakCache;

//# sourceMappingURL=CacheBreaker.js.map
