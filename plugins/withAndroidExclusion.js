const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidExclusion(config) {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = addExclusionBlock(config.modResults.contents);
        } else {
            throw new Error('Cannot add exclusion block to build.gradle because it is not groovy');
        }
        return config;
    });
};

function addExclusionBlock(buildGradle) {
    const exclusionBlock = `
    configurations.all {
        exclude group: 'com.amazon.device', module: 'amazon-appstore-sdk'
    }
`;

    if (buildGradle.includes("exclude group: 'com.amazon.device', module: 'amazon-appstore-sdk'")) {
        return buildGradle;
    }

    // Add the exclusion block at the end of the android block or at the end of the file
    return buildGradle + exclusionBlock;
}
