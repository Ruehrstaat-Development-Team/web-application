import { app as m, BrowserWindow as f, nativeImage as g } from "electron";
import o from "path";
import * as s from "fs";
import w from "os";
import { execSync as D } from "child_process";
async function E() {
  try {
    const e = D("echo %USERPROFILE%").toString().trim(), i = o.join(e, "Documents"), t = o.join(e, "Dokumente"), n = [
      i,
      t,
      o.join("E:", "Dokumente"),
      o.join("F:", "Dokumente"),
      o.join("G:", "Dokumente"),
      o.join("H:", "Dokumente"),
      o.join("I:", "Dokumente"),
      o.join("J:", "Dokumente"),
      o.join("E:", "Documents"),
      o.join("F:", "Documents"),
      o.join("G:", "Documents"),
      o.join("H:", "Documents"),
      o.join("I:", "Documents"),
      o.join("J:", "Documents")
    ];
    for (const a of n)
      try {
        return await s.promises.access(a), a;
      } catch {
        continue;
      }
    return console.error("No valid 'Documents' or 'Dokumente' path found."), "";
  } catch (e) {
    return console.error("Error getting Documents path:", e), "";
  }
}
async function v() {
  const e = o.join(w.homedir(), "Saved Games", "Frontier Developments", "Elite Dangerous");
  try {
    await s.promises.access(e);
    const t = (await s.promises.readdir(e)).filter((r) => r.endsWith(".log"));
    if (t.length === 0) {
      console.log("No .log files found.");
      return;
    }
    let n = "", a = t[0], u = (await s.promises.stat(o.join(e, a))).mtimeMs;
    for (const r of t) {
      const c = o.join(e, r), h = await s.promises.stat(c);
      h.mtimeMs > u && (a = r, u = h.mtimeMs);
    }
    for (const r of t) {
      const c = o.join(e, r), h = await s.promises.readFile(c, "utf8");
      n += `
=== ${r} ===
${h}
`;
    }
    const l = await E();
    if (!l) {
      console.error("Invalid Documents path. Exiting.");
      return;
    }
    await s.promises.mkdir(o.join(l, "Ruehrstaat Services"), { recursive: !0 });
    const p = o.join(l, "Ruehrstaat Services", "combined_logs.txt");
    await s.promises.writeFile(p, n, "utf8"), console.log(`✅ Logs combined and saved in: ${p}`), s.watch(e, (r, c) => {
      r === "change" && c && c.endsWith(".log") && (console.log(`File changed: ${c}`), j(e, c, p));
    });
  } catch (i) {
    console.error("Error reading .log files:", i);
  }
}
async function j(e, i, t) {
  try {
    const n = o.join(e, i), a = await s.promises.readFile(n, "utf8");
    let u = `
=== ${i} ===
${a}
`, l = await s.promises.readFile(t, "utf8");
    l += u, await s.promises.writeFile(t, l, "utf8"), console.log(`✅ Logs updated with changes from: ${i}`);
  } catch (n) {
    console.error("Error handling file change:", n);
  }
}
function d() {
  const e = o.join(m.getAppPath(), "public/favicon.ico"), i = g.createFromPath(e), t = new f({
    width: 1600,
    height: 900,
    icon: i,
    title: "Ruehrstaat Services",
    webPreferences: {
      nodeIntegration: !0
    }
  });
  if (process.env.NODE_ENV === "development") {
    const n = process.env.DEV_SERVER_URL || "http://localhost:3000";
    t.loadURL(n);
  } else if (process.env.NODE_ENV === "production") {
    const n = process.env.SERVER_URL || "";
    if (t.loadURL(n), !n)
      throw new Error("SERVER_URL is not set in .env");
  } else
    throw t.loadURL("http://localhost:3000"), new Error("Unknown NODE_ENV " + process.env.NODE_ENV);
}
m.whenReady().then(() => {
  d(), m.on("activate", () => {
    f.getAllWindows().length === 0 && d();
  });
});
m.on("window-all-closed", () => {
  process.platform !== "darwin" && m.quit();
});
console.log("Main process started on " + process.env.NODE_ENV);
v().catch((e) => console.error(e));
