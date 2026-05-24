import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.toinavi.app",
  appName: "ToiNavi",
  webDir: "out",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0f172a",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK"
    }
  }
};

export default config;
