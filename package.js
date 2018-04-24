Package.describe({
  name   : 'happyuc:blocks',
  summary: 'Provides informations about the current and last 50 blocks',
  version: '1.1.4',
  git    : 'http://github.com/happyuc-project/meteor-package-blocks',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore', ['client', 'server']);
  api.use('mongo', ['client', 'server']);
  api.use('happyuc:webu@1.0.8', ['client', 'server']);
  api.export(['HucBlocks'], ['client', 'server']);
  api.addFiles('blocks.js', ['client', 'server']);
});

