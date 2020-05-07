# toyproject-electron-myPlanner
This is a common todolist toy-project with calendar and undo-redo pattern. 
## Install
1. Clone this repo
2. Run command   
```
npm install
```
## Test
```
npm start
```
## Build
This support only windows x32 or x64. But a little adjustment in package.json would make it work on other OS.

For preventing text encoding error, 1 file NsisTarget.js should be changed by new one.
```
move ./error/NsisTarget.js ./node_modules/app-builder-lib/out/targets/nsis/NsisTarget.js
```

Build on windows x32, x64.
```
yarn dist
```
