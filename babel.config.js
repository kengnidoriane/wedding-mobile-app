module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Supprimer les console.log en production (garde error et warn)
      ['transform-remove-console', { 
        exclude: ['error', 'warn'] 
      }]
    ]
  };
};
