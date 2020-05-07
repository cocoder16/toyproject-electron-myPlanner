const {app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require('fs');
const path = require('path');

let win;

const createWindow = () => {
    win = new BrowserWindow({
        width: 1200, height: 800, x: 0, y: 0, minWidth: 940,
        webPreferences: {
            nodeIntegration: true
        },
        icon: './assets/icons/myPlannerIcon.png',
        frame: false
    });

    // win.webContents.openDevTools();
    //브라우저창이 읽어올 파일 위치
    win.loadFile("./index.html");
};

const delAll = () => {
    const getDirname = (() => {
        if (path.dirname(process.execPath).split('\\').reverse()[0] === "dist"){
            return __dirname;
        } else {
            return path.join(path.dirname(process.execPath), '/resources/app');
        }
    })();
    let postdata = { };
    postdata = JSON.stringify(postdata);
    fs.writeFileSync(path.join(getDirname, './todolist.json'), postdata, 'utf8');
    win.reload();
    dialog.showMessageBox(null, {type: 'info', title: 'Ok', message: 'All data is initialized.'});
};

app.on("ready", createWindow);

// ipcMain.on('toggle-debug', () => {
//     win.webContents.toggleDevTools();
// });
ipcMain.on('refresh', () => {
    win.reload();
});

ipcMain.on('delAll', () => {
    dialog.showMessageBox(null, { 
        type: "question",
        buttons: [ "OK", "Cancel" ],
        title: "데이터 삭제",
        message: "모든 데이터를 삭제하시겠습니까?", 
        noLink: false 
    }).then((res) => {
        if(res.response == 0){    //button 배열 인덱스
            delAll(); 
        }
    });
});