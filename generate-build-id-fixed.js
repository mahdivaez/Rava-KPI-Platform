"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "generateBuildId", {
    enumerable: true,
    get: function() {
        return generateBuildId;
    }
});
async function generateBuildId(generate, fallback) {
    try {
        let buildId = await generate();
        // If there's no buildId defined we'll fall back
        if (buildId === null) {
            // We also create a new buildId if it contains the word `ad` to avoid false
            // positives with ad blockers
            while(!buildId || /ad/i.test(buildId)){
                buildId = fallback();
            }
        }
        return buildId;
    } catch (error) {
        console.warn('Error generating build ID, using fallback:', error);
        return fallback();
    }
}