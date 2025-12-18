module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ...cualquier otro plugin que uses
      'react-native-reanimated/plugin', // ← debe ir al final
    ],
  };
};