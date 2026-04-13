export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "تشخيصي | Tashkheesy";

export const APP_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%232BBDB6'/%3E%3Cstop offset='100%25' style='stop-color:%231E4E8C'/%3E%3C/linearGradient%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' ry='14' fill='url(%23bg)'/%3E%3Cpath d='M 14 18 Q 14 10 22 10 Q 18 14 18 18 Z' fill='%23F4EFE8' opacity='0.45'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Cairo,Arial,sans-serif' font-weight='800' font-size='30' fill='%23FFFFFF'%3E%D8%AA%3C/text%3E%3C/svg%3E";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
