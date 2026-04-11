import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** GitHub project pages use /repo-name/; user/org pages (username.github.io) use /. */
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrgSite = Boolean(repo?.endsWith(".github.io"));
const base =
  process.env.GITHUB_ACTIONS && repo && !isUserOrOrgSite ? `/${repo}/` : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
  },
});
