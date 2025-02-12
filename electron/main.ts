import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

function createStartupWindow() {
    const iconPath = path.join(app.getAppPath(), 'public/favicon.ico');
    const AppIcon = nativeImage.createFromPath(iconPath);
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: AppIcon,
        title: 'Ruehrstaat Services',
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        const devServerURL = process.env.DEV_SERVER_URL || 'http://localhost:3000'; // default is set to localhost for development maybe change your port or edit in .env
        win.loadURL(devServerURL);
        if (!devServerURL){
            throw new Error('DEV_SERVER_URL is not set in .env');
        }
    }
    else if (process.env.NODE_ENV === 'production') {
        const serverURL = process.env.SERVER_URL || ""; // replace on .env to your server url
        win.loadURL(serverURL);
        if (!serverURL){
            throw new Error('SERVER_URL is not set in .env');
        }
    }
    else
    {
        win.loadURL("http://localhost:3000"); // Fallback to localhost for development builds
        throw new Error('Unknown NODE_ENV ' + process.env.NODE_ENV);
    }
}

app.whenReady().then(() => {
    createStartupWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createStartupWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log('Main process started on ' + process.env.NODE_ENV);


