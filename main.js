const { app, BrowserWindow } = require('electron');

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile('build/index.html')
}

app.on('ready', createWindow);
// app.importCertificate({certificate :'loanbook_localhost.pfx', password: 'test1234!'}, function () {});
