class FileController {
    constructor (_data = {}) {
        this.data = _data;
        this.memento = new Memento();
    }
    dataToJSON (){
        fs.writeFileSync(path.join(getDirname, './todolist.json'), JSON.stringify(this.data), 'utf8');
    }
    planUpdater (_date, _num, _plan) {
        console.log(this.data);
        const prePlan = this.data[`${_date}`][`${_num}`].plan;
        const preCheck = this.data[`${_date}`][`${_num}`].check;
        this.data[`${_date}`][`${_num}`].plan = _plan;
        this.data[`${_date}`][`${_num}`].check = preCheck;
        return prePlan;
    }
    checkUpdater (_date, _num, _check) {
        const prePlan = this.data[`${_date}`][`${_num}`].plan;
        this.data[`${_date}`][`${_num}`].plan = prePlan;
        this.data[`${_date}`][`${_num}`].check = _check;
    }
    checkCounter (_date, _check) {
        if (_check) this.data[`${_date}`].checkCount++;
        else this.data[`${_date}`].checkCount--;
    }
    remover (_date, _num) {
        const date = this.data[`${_date}`];
        const prePlan = date[`${_num}`].plan;
        const preCheck = date[`${_num}`].check;
        delete date[`${_num}`];
        return { prePlan: prePlan, preCheck: preCheck };
    }
    planUpdate (_date, _num, _plan, isSet=true){
        const prePlan = this.planUpdater(_date, _num, _plan);
        if (isSet) this.set('save', [_date, _num, prePlan, _plan, this.data[`${_date}`][`${_num}`].check]);
        this.dataToJSON();
    }
    check (_date, _num, _check, isSet=true){ 
        if (isSet) this.set('savecheck', [_date, _num, this.data[`${_date}`][`${_num}`].plan, this.data[`${_date}`][`${_num}`].plan, !_check]);
        this.checkUpdater(_date, _num, _check);
        this.checkCounter(_date, _check);
        this.dataToJSON();
    }
    planCreate (_date, _plan, isSet=true){ 
        let date = this.data[`${_date}`];
        const space = this.data[`${_date}`].idNum;
        if (isSet) this.set('create', [_date, `${space}`, null, _plan, false]);
        date[`${space}`] = { plan: _plan, check: false };
        this.data[`${_date}`].idNum++;
        this.dataToJSON();
    }
    delete (_date, _num, isSet=true){
        const deletedData = this.remover(_date, _num);
        if (isSet) this.set('delPost', [_date, _num, deletedData.prePlan, null, deletedData.preCheck]);
        if (deletedData.preCheck) this.data[`${_date}`].checkCount--;
        this.dataToJSON();
    }
    planReCreate (_date, _num, _plan, _check){
        const date = this.data[`${_date}`];
        date[`${_num}`] = { plan: _plan, check: _check };
        if (_check) this.data[`${_date}`].checkCount++;
        this.dataToJSON();
    }
    //originator
    set (method, stateArr) {  //stateArr [date, num, preplan, postplan, precheck]
        this.addUndoMemento(method, stateArr);
        this.memento.redoStack = [];
    }
    addUndoMemento (_method, _stateArr) { 
        const data = {method: _method, stateArr: _stateArr};
        this.memento.lastUndo = data;
        console.log(this.memento);
    }
    addRedoMemento (_method, _stateArr) { 
        const data = {method: _method, stateArr: _stateArr};
        this.memento.lastRedo = data;
        console.log(this.memento);
    }
    adjustCalendar (_date){
        const year = _date.slice(0,4);
        let month = _date.slice(4,6);
        let date = _date.slice(6,8);
        if (month < 10) month = month[1];
        if (date < 10) date = date[1];
        myCalendar.viewDay.year = year*1;
        myCalendar.viewDay.month = month*1;
        myCalendar.selectedDay.year = year*1;
        myCalendar.selectedDay.month = month*1;
        myCalendar.selectedDay.date = date*1;
        myCalendar.showCalendar();
    }
    restoreUndoMemento () { 
        if (this.memento.undoStack.length > 0) {
            const gotUndoData = this.memento.lastUndo;
            this.addRedoMemento(gotUndoData.method, gotUndoData.stateArr);
            switch (gotUndoData.method) {
                case 'create' :
                    this.delete(gotUndoData.stateArr[0], gotUndoData.stateArr[1], false);
                    break;
                case 'save' :
                    this.planUpdate(gotUndoData.stateArr[0], gotUndoData.stateArr[1], gotUndoData.stateArr[2], false);
                    break;
                case 'savecheck' :
                    this.check(gotUndoData.stateArr[0], gotUndoData.stateArr[1], gotUndoData.stateArr[4], false);
                    break;
                case 'delPost' :
                    this.planReCreate(gotUndoData.stateArr[0], gotUndoData.stateArr[1], gotUndoData.stateArr[2], 
                        gotUndoData.stateArr[4]);
                    break;
            }

            this.adjustCalendar(gotUndoData.stateArr[0]);
            reader(); //호이스팅
            console.log(this.memento);
        }
    }
    restoreRedoMemento () {
        if (this.memento.redoStack.length > 0) {
            const gotRedoData = this.memento.lastRedo;
            this.addUndoMemento(gotRedoData.method, gotRedoData.stateArr);
            switch (gotRedoData.method) {
                case 'create' :
                    this.planReCreate(gotRedoData.stateArr[0], gotRedoData.stateArr[1], gotRedoData.stateArr[3], 
                        gotRedoData.stateArr[4]);
                    break;
                case 'save' :
                    this.planUpdate(gotRedoData.stateArr[0], gotRedoData.stateArr[1], gotRedoData.stateArr[3], false);
                    break;
                case 'savecheck' :
                    this.check(gotRedoData.stateArr[0], gotRedoData.stateArr[1], !gotRedoData.stateArr[4], false);
                    break;
                case 'delPost' :
                    this.delete(gotRedoData.stateArr[0], gotRedoData.stateArr[1], false);
                    break;
            }

            this.adjustCalendar(gotRedoData.stateArr[0]);
            reader();
            console.log(this.memento);
        }
    }
}