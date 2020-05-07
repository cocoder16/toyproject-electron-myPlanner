class Memento {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    get lastUndo() {
        return this.undoStack.pop();
    }
    set lastUndo(did) {
        this.undoStack.push(did);
    }
    get lastRedo() {
        return this.redoStack.pop();
    }
    set lastRedo(did) {
        this.redoStack.push(did);
    }
}