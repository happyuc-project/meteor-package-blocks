Package.describe({
  name: "happyuc:blocks",
  summary: "Provides informations about the current and last 50 blocks",
  version: "1.0.10",
  git: "http://github.com/happyuc-project/meteor-package-blocks"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0");
  api.use("underscore", ["client", "server"]);
  api.use("mongo", ["client", "server"]);

  // api.use('frozeman:persistent-minimongo@0.1.3', 'client');
  api.use("happyuc:webu@1.0.0", ["client", "server"]);
  api.export(["HucBlocks"], ["client", "server"]);
  api.addFiles("blocks.js", ["client", "server"]);
});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('happyuc:blocks');
//   api.addFiles('blocks-tests.js');
// });
