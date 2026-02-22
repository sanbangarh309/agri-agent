import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "agri-agent.aryaorganicfarm.com",
      "api.agri-agent.aryaorganicfarm.com",
    ],
  },
});
