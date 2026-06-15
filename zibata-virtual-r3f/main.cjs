const { app, BrowserWindow } = require('electron');
const path = require('path');

// Asegura que Electron use la gráfica para renderizar mapas 3D
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-webgl');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        // Lo dejamos en false por ahora para que puedas programar a gusto.
        // El día de la junta con los directivos lo cambiamos a true.
        fullscreen: true, 
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Detectamos si estamos desarrollando o si ya es el .exe final
    const isDev = !app.isPackaged;

    if (isDev) {
        // En desarrollo, lee tu servidor de Vite en vivo
        win.loadURL('http://localhost:5173');
    } else {
        // En producción, leerá los archivos estáticos que subiremos al kiosco
        win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});