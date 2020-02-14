const { app, Menu, BrowserWindow, Tray, nativeImage } = require('electron');

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const isMac = process.platform === 'darwin';

let mainWindow;

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startspeaking' },
                        { role: 'stopspeaking' }
                    ]
                }
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ] : [
                { role: 'close' }
            ])
        ]
    },
    {
        label: 'Settings',
        submenu: [
            {
                label: 'Privacy policy',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://www.jisort.com/platform-privacypolicy/')
                }
            }, {
                label: 'Terms of service',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://www.jisort.com/platform-terms-service/')
                }
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Privacy policy',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://www.jisort.com/platform-privacypolicy/')
                }
            }, {
                label: 'Terms of service',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://www.jisort.com/platform-terms-service/')
                }
            }, {
                label: 'Open help center',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://jisort.atlassian.net/servicedesk/customer/portal/3')
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow() {
    // const iconPath = path.join(__dirname, '../assets/icon.png');
    mainWindow = new BrowserWindow({width: 900, height: 680});
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    // mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    // mainWindow.setIcon(path.join(__dirname, '../assets/icon.png'));
    mainWindow.on('closed', () => mainWindow = null);
    // mainWindow.tray = new Tray(nativeImage.createFromPath(iconPath));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
