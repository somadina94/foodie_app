module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // nativewind/babel (react-native-css-interop) already injects
          // react-native-worklets/plugin; reanimated/plugin is the same module.
          worklets: false,
          reanimated: false,
        },
      ],
      'nativewind/babel',
    ],
  };
};
