// src/shared/utils/cookieOptions.js

const isProd = process.env.NODE_ENV?.trim() === "production";
const isLocalDev = process.env.IS_LOCAL_NETWORK === "true";
const httpsEnabled = process.env.HTTPS_ENABLED === "true";

const defaultMaxAgeDays = parseInt(process.env.COOKIE_MAXAGE_DAY || "7");
const rememberMeMaxAgeDays = parseInt(process.env.COOKIE_REMEMBERME_DAY || "30");

export function getCookieOptions(rememberMe = false) {
  const baseMaxAge = defaultMaxAgeDays * 24 * 60 * 60 * 1000;
  const rememberMeMaxAge = rememberMeMaxAgeDays * 24 * 60 * 60 * 1000;

  // For local network, minimal restrictions for debugging
  const options = {
    httpOnly: false, // Allow JS access for debugging
    secure: false, // HTTP only
    maxAge: rememberMe ? rememberMeMaxAge : baseMaxAge,
    path: "/",
    sameSite: "lax", // Allow cross-port
    // No domain restriction for local network
  };

  return options;
}

// Export specific configs for different scenarios
export const accessTokenOptions = (rememberMe = false) => ({
  ...getCookieOptions(rememberMe),
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
});

export const refreshTokenOptions = (rememberMe = false) => ({
  ...getCookieOptions(rememberMe), // Full maxAge for refresh token
});
