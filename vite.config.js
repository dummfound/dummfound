import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * - Custom domain: set repo variable SITE_BASE=/ (assets from site root).
 * - Default github.io/project only: leave SITE_BASE unset → /repo-name/ on Actions.
 */
function baseFromExplicit(raw) {
  if (raw === "/") return "/";
  const s = raw.replace(/^\/+|\/+$/g, "");
  return s ? `/${s}/` : "/";
}

const explicitRaw = process.env.SITE_BASE?.trim();
const explicitBase = explicitRaw ? baseFromExplicit(explicitRaw) : null;
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrgSite = Boolean(repo?.endsWith(".github.io"));
const base =
  explicitBase !== null
    ? explicitBase
    : process.env.GITHUB_ACTIONS && repo && !isUserOrOrgSite
      ? `/${repo}/`
      : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
  },
});
