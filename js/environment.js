const {remote} = require('electron');
const fs = require('fs');
const path = require('path');

//앱 설치경로 받아오기
const getDirname = (() => {
    if (path.dirname(remote.process.execPath).split('\\').reverse()[0] === "dist"){
        return __dirname;
    } else {
        return path.join(path.dirname(remote.process.execPath), '/resources/app');
    }
})();