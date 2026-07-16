const fs = require('fs');
const path = require('path');

/**
 * `expo.extra.eas.projectId` (from `eas init` / app.json) is enough for getExpoPushTokenAsync.
 * Optional: set EXPO_PUBLIC_EAS_PROJECT_ID in .env to override (e.g. CI without editing app.json).
 *
 * Google service files stay gitignored. Local `expo run` / prebuild uses the paths on disk.
 * EAS cloud builds must not reference those paths (triggers the "not checked in" warning);
 * set GOOGLE_SERVICES_JSON / GOOGLE_SERVICES_PLIST as EAS file secrets if you need FCM there.
 */
const isEasBuildContext =
  process.env.EAS_BUILD === 'true' ||
  process.env.EAS_BUILD_PROFILE != null ||
  process.env.EAS_BUILD_WORKINGDIR != null ||
  process.argv.some((arg) => /eas-cli|(^|[\\/])eas$/.test(arg));

function resolveGoogleServicesFile(easEnvValue, localRelativePath) {
  if (easEnvValue) return easEnvValue;
  if (isEasBuildContext) return undefined;
  const absolute = path.resolve(__dirname, localRelativePath);
  return fs.existsSync(absolute) ? localRelativePath : undefined;
}

module.exports = ({ config }) => {
  const override = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  const iosGoogleServicesFile = resolveGoogleServicesFile(
    process.env.GOOGLE_SERVICES_PLIST,
    './GoogleService-Info.plist'
  );
  const androidGoogleServicesFile = resolveGoogleServicesFile(
    process.env.GOOGLE_SERVICES_JSON,
    './google-services.json'
  );

  return {
    ...config,
    ios: {
      ...config.ios,
      ...(iosGoogleServicesFile
        ? { googleServicesFile: iosGoogleServicesFile }
        : {}),
    },
    android: {
      ...config.android,
      ...(androidGoogleServicesFile
        ? { googleServicesFile: androidGoogleServicesFile }
        : {}),
    },
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        ...(override ? { projectId: override } : {}),
      },
    },
  };
};
