import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://honestafblog.com",
  base: "/Portfolio/",
  output: "static",
  integrations: [react()],
});
