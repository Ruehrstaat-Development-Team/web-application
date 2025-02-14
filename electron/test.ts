import * as fs from "fs";
import path from "path";
import os from "os";


async function parseTxtFiles() {
  const dirPath = path.join(
    os.homedir(),
    "Saved Games",
    "Frontier Developments",
    "Elite Dangerous"
  );

  try {
    await fs.promises.access(dirPath);

    const files = await fs.promises.readdir(dirPath);
    const logFiles = files.filter((file) => file.endsWith(".log"));

    if (logFiles.length === 0) {
      console.log("Keine .log Dateien gefunden.");
      return;
    }

    let entries: any[] = [];

    let allTimestamps: Set<string> = new Set();

    const processLogFiles = async () => {
      for (const file of logFiles) {
        const filePath = path.join(dirPath, file);
        const content = await fs.promises.readFile(filePath, "utf8");
        const lines = content.split("\n");

        for (const line of lines) {
          try {
            const jsonEntry = JSON.parse(line.trim());
            if (
              jsonEntry.timestamp && !allTimestamps.has(jsonEntry.timestamp)) {
                allTimestamps.add(jsonEntry.timestamp);
                entries.push(jsonEntry);
            }
          } catch (error) {
            continue;
          }
        }
      }

      if(entries.length > 0) {
        console.log(entries); //TODO: Send event to main process
        console.log("Logs verarbeitet");
      }
    };

    await processLogFiles();

    fs.watch(dirPath, (eventType, filename) => {
      if (eventType === "change" && filename && filename.endsWith(".log")) {
        console.log(`Datei geändert: ${filename}`);
        handleFileChange(dirPath, filename, allTimestamps);
      }
    });
  } catch (error) {
    console.error("Fehler beim Lesen der .log-Dateien:", error);
  }
}

async function handleFileChange(
  dirPath: string,
  filename: string,
  allTimestamps: Set<string>
) {
  try {
    const latestFilePath = path.join(dirPath, filename);
    const content = await fs.promises.readFile(latestFilePath, "utf8");
    let updatedEntry: any[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      try {
        const jsonEntry = JSON.parse(line.trim());
        if (jsonEntry.timestamp && !allTimestamps.has(jsonEntry.timestamp)) {
          allTimestamps.add(jsonEntry.timestamp);
          updatedEntry.push(jsonEntry);
        }
      } catch (error) {
        console.error("Fehler beim Parsen der Zeile:", error);
        continue;
      }
    }

    if (updatedEntry) {
      console.log(updatedEntry); //TODO: Send event to main process
      console.log(`Logs aktualisiert mit Änderungen von: ${filename}`);
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Dateiänderung:", error);
  }
}

export default parseTxtFiles;
