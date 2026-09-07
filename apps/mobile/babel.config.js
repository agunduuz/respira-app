module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: NativeWind'in className prop'unu JSX'e enjekte etmesi için
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
