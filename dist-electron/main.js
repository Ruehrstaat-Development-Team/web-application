import { app as e, BrowserWindow as r, nativeImage as c } from "electron";
import a from "path";
function t() {
  const s = a.join(e.getAppPath(), "public/favicon.ico"), i = c.createFromPath(s), n = new r({
    width: 1600,
    height: 900,
    icon: i,
    title: "Ruehrstaat Services",
    webPreferences: {
      nodeIntegration: !0
    }
  });
  if (process.env.NODE_ENV === "development") {
    const o = process.env.DEV_SERVER_URL || "http://localhost:3000";
    n.loadURL(o);
  } else if (process.env.NODE_ENV === "production") {
    const o = process.env.SERVER_URL || "";
    if (n.loadURL(o), !o)
      throw new Error("SERVER_URL is not set in .env");
  } else
    throw n.loadURL("http://localhost:3000"), new Error("Unknown NODE_ENV " + process.env.NODE_ENV);
}
e.whenReady().then(() => {
  t(), e.on("activate", () => {
    r.getAllWindows().length === 0 && t();
  });
});
e.on("window-all-closed", () => {
  process.platform !== "darwin" && e.quit();
});
console.log("Main process started on " + process.env.NODE_ENV);
