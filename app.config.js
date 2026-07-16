/**
 * `expo.extra.eas.projectId` (from `eas init` / app.json) is enough for getExpoPushTokenAsync.
 * Optional: set EXPO_PUBLIC_EAS_PROJECT_ID in .env to override (e.g. CI without editing app.json).
 *
 * Google service files stay gitignored. EAS cloud builds use file env vars
 * (see https://docs.expo.dev/eas/environment-variables/manage/#secrets-and-file-variables).
 */
module.exports = ({ config }) => {
  const override = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    },
    android: {
      ...config.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
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
