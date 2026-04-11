/**
 * `expo.extra.eas.projectId` (from `eas init` / app.json) is enough for getExpoPushTokenAsync.
 * Optional: set EXPO_PUBLIC_EAS_PROJECT_ID in .env to override (e.g. CI without editing app.json).
 */
module.exports = ({ config }) => {
  const override = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        ...(override ? { projectId: override } : {}),
      },
    },
  };
};
