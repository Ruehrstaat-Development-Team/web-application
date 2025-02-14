import * as fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

async function getDocumentsPath(): Promise<string> {
    try {
        const userProfile = execSync('echo %USERPROFILE%').toString().trim();
        const documentsPath = path.join(userProfile, 'Documents');
        const dokumentePath = path.join(userProfile, 'Dokumente');

        const possibleLocations = [
            documentsPath,
            dokumentePath,
            path.join('D:', 'Dokumente'),
            path.join('E:', 'Dokumente'),
            path.join('F:', 'Dokumente'),
            path.join('G:', 'Dokumente'),
            path.join('H:', 'Dokumente'),
            path.join('I:', 'Dokumente'),
            path.join('J:', 'Dokumente'),
            path.join('D:', 'Documents'),
            path.join('E:', 'Documents'),
            path.join('F:', 'Documents'),
            path.join('G:', 'Documents'),
            path.join('H:', 'Documents'),
            path.join('I:', 'Documents'),
            path.join('J:', 'Documents')
        ];

        for (const location of possibleLocations) {
            try {
                await fs.promises.access(location);
                return location;
            } catch {
                continue;
            }
        }

        console.error("No valid 'Documents' or 'Dokumente' path found.");
        return '';
    } catch (error) {
        console.error("Error getting Documents path:", error);
        return '';
    }
}

async function parseTxtFiles() {
    const dirPath = path.join(os.homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous');
    
    try {
        await fs.promises.access(dirPath);

        const files = await fs.promises.readdir(dirPath);
        const logFiles = files.filter(file => file.endsWith('.log'));

        if (logFiles.length === 0) {
            console.log("No .log files found.");
            return;
        }

        let combinedContent = '';

        let latestFile = logFiles[0];
        let latestFileTime = (await fs.promises.stat(path.join(dirPath, latestFile))).mtimeMs;

        for (const file of logFiles) {
            const filePath = path.join(dirPath, file);
            const fileStats = await fs.promises.stat(filePath);
            if (fileStats.mtimeMs > latestFileTime) {
                latestFile = file;
                latestFileTime = fileStats.mtimeMs;
            }
        }

        for (const file of logFiles) {
            const filePath = path.join(dirPath, file);
            const content = await fs.promises.readFile(filePath, 'utf8');
            combinedContent += `\n=== ${file} ===\n${content}\n`;
        }

        const outputDir = await getDocumentsPath();
        if (!outputDir) {
            console.error("Invalid Documents path. Exiting.");
            return;
        }

        await fs.promises.mkdir(path.join(outputDir, 'Ruehrstaat Services'), { recursive: true });
        const outputFilePath = path.join(outputDir, 'Ruehrstaat Services', 'combined_logs.txt');
        await fs.promises.writeFile(outputFilePath, combinedContent, 'utf8');

        console.log(`Logs combined and saved in: ${outputFilePath}`);

        fs.watch(dirPath, (eventType, filename) => {
            if (eventType === 'change' && filename && filename.endsWith('.log')) {
                console.log(`File changed: ${filename}`);
                handleFileChange(dirPath, filename, outputFilePath);
            }
        });

    } catch (error) {
        console.error("Error reading .log files:", error);
    }
}

async function handleFileChange(dirPath: string, filename: string, outputFilePath: string) {
    try {
        const latestFilePath = path.join(dirPath, filename);
        const content = await fs.promises.readFile(latestFilePath, 'utf8');
        let updatedContent = `\n=== ${filename} ===\n${content}\n`;
        let existingContent = await fs.promises.readFile(outputFilePath, 'utf8');
        existingContent += updatedContent;
        await fs.promises.writeFile(outputFilePath, existingContent, 'utf8');

        console.log(`Logs updated with changes from: ${filename}`);
    } catch (error) {
        console.error("Error handling file change:", error);
    }
}

export default parseTxtFiles;
