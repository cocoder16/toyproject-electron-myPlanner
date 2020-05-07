const {ipcRenderer} = require('electron');
const {Menu} = remote; //main.js가 아니면 electron 모듈 사용 시 remote가 필요
const customTitlebar = require('custom-electron-titlebar'); //https://github.com/AlexTorresSk/custom-electron-titlebar

////선언 및 초기화 부분
//colorSet 초기화
const colorSet = JSON.parse(fs.readFileSync(path.join(getDirname, './color.json'), 'utf8'));

//rgb값저장 함수
const generator = {
    checkRGB (){
        switch (colorSet.check){
            case 'a' :
                colorSet.checkRGB = '58, 193, 0';
                break;
            case 'b' :
                colorSet.checkRGB = '255, 215, 0';
                break;
            case 'c' :
                colorSet.checkRGB = '0, 0, 255';
                break;
            case 'd' :
                colorSet.checkRGB = '255, 0, 0';
                break;
            default :
                colorSet.checkRGB = '58, 193, 0';
        }
    }
};

//color.json 파일쓰기
const writeColorJson = () => {
    let postdata = JSON.stringify(colorSet);
    fs.writeFileSync(path.join(getDirname, './color.json'), postdata, 'utf8');
};

//JSON 변경
const colorSetting = () => {
    generator.checkRGB();
    writeColorJson();
    reader(); //호이스팅
};

//index.html에 적용
const skinChange = {
    common (selector, property){
        const tar = document.querySelector(selector);
        switch (property){
            case "a" :
                tar.setAttribute('class', 'a');
                break;
            case "b" :
                tar.setAttribute('class', 'b');
                break;
            case "c" :
                tar.setAttribute('class', 'c');
                break;
            case "d" :
                tar.setAttribute('class', 'd');
                break;
            default :
                tar.setAttribute('class', 'a');
        };
    },
    calendar (){
        this.common('#myCalendar', colorSet.calendar);
    },
    check (){
        this.common('#list', colorSet.check);
        const perc = document.querySelectorAll('.achieve');
        for (let i = 0; i < perc.length; i++){
            perc[i].style.color = `rgb(${colorSet.checkRGB})`;
        }
    }
};

// const devTool = () => {
//     ipcRenderer.send('toggle-debug', 'an-argument');
// };

// const refresh = () => {
//     ipcRenderer.send('refresh', 'an-argument');
// };

const delAll = () => {
    ipcRenderer.send('delAll', 'an-argument');
}
 
// define template
const template = [
    {
        label: 'View',
        submenu: [
            {
                label: 'Calendar Color',
                submenu: [ 
                    {
                        label: 'green',
                        type: 'radio',
                        click() { colorSet.calendar = 'a'; colorSetting(); skinChange.calendar(); }
                    },
                    {
                        label: 'yellow',
                        type: 'radio',
                        click() { colorSet.calendar = 'b'; colorSetting(); skinChange.calendar(); }
                    },
                    {
                        label: 'blue',
                        type: 'radio',
                        click() { colorSet.calendar = 'c'; colorSetting(); skinChange.calendar(); }
                    },
                    {
                        label: 'red',
                        type: 'radio',
                        click() { colorSet.calendar = 'd'; colorSetting(); skinChange.calendar(); }
                    }
                ]
            },
            {
                label: 'Point Color',
                submenu: [ 
                    {
                        label: 'green',
                        type: 'radio',
                        click() { colorSet.check = 'a'; colorSetting(); skinChange.check(); }
                    },
                    {
                        label: 'yellow',
                        type: 'radio',
                        click() { colorSet.check = 'b'; colorSetting(); skinChange.check(); }
                    },
                    {
                        label: 'blue',
                        type: 'radio',
                        click() { colorSet.check = 'c'; colorSetting(); skinChange.check(); }
                    },
                    {
                        label: 'red',
                        type: 'radio',
                        click() { colorSet.check = 'd'; colorSetting(); skinChange.check(); }
                    }
                ]
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                click() {
                    todolist.restoreUndoMemento();
                },
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+['
            },
            {
                label: 'Redo',
                click() {
                    todolist.restoreRedoMemento();
                },
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+]'
            }
        ]
    },
    {
        label: 'Data',
        submenu: [
            {
                label: 'Remove all list',
                click() {
                    delAll();
                }
            }
        ]
    }
    // {
    //     label: 'Dev',
    //     submenu: [
    //         {
    //             label: 'Reload',
    //             click () {
    //                 refresh();
    //             },
    //             accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+R'
    //         },
    //         {
    //             label: 'Dev Tool',
    //             click () {
    //                 devTool();
    //             },
    //             accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I'
    //         }
    //     ]
    // }
];

////실행 부분

//메뉴만들기
const menu = Menu.buildFromTemplate(template);
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#787878'),
    menu: menu //Electron.Menu를 가져옴.
});
Menu.setApplicationMenu(menu);
//color변경
skinChange.calendar();
skinChange.check();