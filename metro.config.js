const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for web platform resolution
config.resolver.platforms = ['ios', 'android', 'web'];

// Add resolver to handle Platform module for web
const { resolver } = config;
resolver.sourceExts = [...resolver.sourceExts, 'cjs'];

// Add resolver to provide fallback for missing internal react-native modules
const { resolve } = resolver;
resolver.resolve = async (context, moduleName, platform) => {
  try {
    return await resolve(context, moduleName, platform);
  } catch (error) {
    // If module is in react-native/Libraries and doesn't exist, provide a fallback
    if (moduleName.includes('react-native/Libraries')) {
      const fallbackPath = path.resolve(__dirname, 'node_modules/react-native/Libraries/__web_polyfills__.js');
      return {
        type: 'sourceFile',
        filePath: fallbackPath,
      };
    }
    throw error;
  }
};

module.exports = config;
