const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

function ensureDrawableFile(projectRoot) {
  const drawableDir = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'res',
    'drawable'
  );
  if (!fs.existsSync(drawableDir)) {
    fs.mkdirSync(drawableDir, { recursive: true });
  }
  const filePath = path.join(drawableDir, 'launch_screen_full.xml');
  const content = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap
      android:src="@drawable/splash"
      android:gravity="fill"/>
  </item>
</layer-list>`;
  fs.writeFileSync(filePath, content);
}

// Create styles.xml with our custom SplashTheme if it doesn't exist
function ensureStylesFile(projectRoot) {
  const stylesDir = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'res',
    'values'
  );
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }
  const filePath = path.join(stylesDir, 'styles.xml');
  const content = `<resources>
  <style name="SplashTheme" parent="Theme.AppCompat.NoActionBar">
    <item name="android:windowBackground">@drawable/launch_screen_full</item>
  </style>
</resources>`;
  fs.writeFileSync(filePath, content);
}

module.exports = function withFullSplashTheme(config) {
  return withDangerousMod(
    config,
    ['android', async projectRootConfig => {
      const projectRoot = projectRootConfig.modRequest.platformProjectRoot;
      ensureDrawableFile(projectRoot);
      ensureStylesFile(projectRoot);
      return projectRootConfig;
    }]
  );
};
