import { app as p, BrowserWindow as f, nativeImage as E } from "electron";
import d from "path";
import * as l from "fs";
import u from "os";
async function v() {
  const o = d.join(
    u.homedir(),
    "Saved Games",
    "Frontier Developments",
    "Elite Dangerous"
  );
  try {
    await l.promises.access(o);
    const t = (await l.promises.readdir(o)).filter((r) => r.endsWith(".log"));
    if (t.length === 0) {
      console.log("Keine .log Dateien gefunden.");
      return;
    }
    let e = [], c = /* @__PURE__ */ new Set();
    await (async () => {
      for (const r of t) {
        const n = d.join(o, r), g = (await l.promises.readFile(n, "utf8")).split(`
`);
        for (const w of g)
          try {
            const a = JSON.parse(w.trim());
            a.timestamp && !c.has(a.timestamp) && (c.add(a.timestamp), e.push(a));
          } catch {
            continue;
          }
      }
      e.length > 0 && (console.log(e), console.log("Logs verarbeitet"));
    })(), l.watch(o, (r, n) => {
      r === "change" && n && n.endsWith(".log") && (console.log(`Datei geändert: ${n}`), R(o, n, c));
    });
  } catch (s) {
    console.error("Fehler beim Lesen der .log-Dateien:", s);
  }
}
async function R(o, s, t) {
  try {
    const e = d.join(o, s), c = await l.promises.readFile(e, "utf8");
    let h = [];
    const r = c.split(`
`);
    for (const n of r)
      try {
        const i = JSON.parse(n.trim());
        i.timestamp && !t.has(i.timestamp) && (t.add(i.timestamp), h.push(i));
      } catch (i) {
        console.error("Fehler beim Parsen der Zeile:", i);
        continue;
      }
    h && (console.log(h), console.log(`Logs aktualisiert mit Änderungen von: ${s}`));
  } catch (e) {
    console.error("Fehler beim Verarbeiten der Dateiänderung:", e);
  }
}
function m() {
  const o = d.join(p.getAppPath(), "public/favicon.ico"), s = E.createFromPath(o), t = new f({
    width: 1600,
    height: 900,
    icon: s,
    title: "Ruehrstaat Services",
    webPreferences: {
      nodeIntegration: !0
    }
  });
  if (process.env.NODE_ENV === "development") {
    const e = process.env.DEV_SERVER_URL || "http://localhost:3000";
    t.loadURL(e);
  } else if (process.env.NODE_ENV === "production") {
    const e = process.env.SERVER_URL || "";
    if (t.loadURL(e), !e)
      throw new Error("SERVER_URL is not set in .env");
  } else
    throw t.loadURL("http://localhost:3000"), new Error("Unknown NODE_ENV " + process.env.NODE_ENV);
}
p.whenReady().then(() => {
  m(), p.on("activate", () => {
    f.getAllWindows().length === 0 && m();
  });
});
p.on("window-all-closed", () => {
  process.platform !== "darwin" && p.quit();
});
console.log("Main process started on " + process.env.NODE_ENV);
v().catch((o) => console.error(o));
