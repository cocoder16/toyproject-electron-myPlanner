//////////dev tool///////////
const dev = (function (){
    let s = { time : 0 };
    let start= function (){
        s.time = new Date().getTime();
    };
    let end = function (){
        console.log('총 실행시간 : ' + (new Date().getTime() - s.time));
    };
    return {
        start : start, end : end
    };
})();
/////////////////////////

////선언 및 초기화 부분
const todolist = new FileController(JSON.parse(fs.readFileSync(path.join(getDirname, './todolist.json'), 'utf8')));

const yyyymmddConverter = (year, month, date) => {
    if (month < 10){
        month = '0' + month;
    }
    if (date < 10){
        date = '0' + date;
    }
    return year + month + date;
}

//달력에 각 날짜마다 성취도별 alpha값 다르게 출력하는 함수 정의
const viewRate = () => { 
    document.querySelectorAll('.calbody td').forEach(x => { //달력 내 모든 셀 색칠 초기화
        x.style.backgroundColor = 'initial';
    });
    for (let i = 0; i < myCalendar.viewDay.maxdate; i++){ //색칠
        const date = i+1;
        const targetdate = document.querySelector(`.date_${date}`);
        const _date = yyyymmddConverter(myCalendar.viewDay.year, myCalendar.viewDay.month, date);
        if (todolist.data[`${_date}`]){
            const percentV = Math.round(todolist.data[`${_date}`].checkCount*10000 / (Object.keys(todolist.data[`${_date}`]).length - 2))/100;
            const alpha = percentV * 0.5 / 100 + 0.2;
            targetdate.style.backgroundColor = `rgba(${colorSet.checkRGB},${alpha})`;
        }
    }
}

//캐시 객체이용해서 성능 높이기. 왜냐면 new Date()가 좀 무거워보임.
const cache = {monthArr : new Array(30), weekArr : new Array(7)};

const cacheUpdate = d => {
    for (let i = 0; i < 30; i++){
        const tmpDate = new Date();
        tmpDate.setTime(d.getTime() - (i * 24 * 60 * 60 * 1000));
        cache.monthArr[i] = yyyymmddConverter(tmpDate.getFullYear(), tmpDate.getMonth()+1, tmpDate.getDate());
    }
    cache.weekArr = cache.monthArr.slice(0,7);
};

//세 개의 달성률 html에 넣는 함수
const innerAndOpa = (_check, _total, _target) => {
    const percent = Math.round(_check*10000/_total)/100;
    const target = document.querySelector(_target);
    target.innerHTML = percent + ' %';
    const alpha = percent * 0.8 / 100 + 0.2;
    target.style.opacity = alpha;
};

//성취율 출력 함수 정의
const achievementRate = () => {
    viewRate();
    //최근30일 배열, 최근 7일 배열 선언 => 캐시이용
    const d = new Date();
    const today = yyyymmddConverter(d.getFullYear(), d.getMonth()+1, d.getDate());
    if (cache.monthArr[0] !== today) cacheUpdate(d);

    //계산을 위한 변수 선언
    let totalweek = 0;
    let checkweek = 0;
    let totalmonth = 0;
    let checkmonth = 0;
    let total = 0;
    let check = 0;

    //최근 7일 < 최근 30일 < 전체 부분집합관계 이용해서 for문 효율적으로 돌려서 빨리 끝내기
    for (let i in todolist.data){
        if (i > today) {
            continue;
        } else if (i <= today){
            total += Object.keys(todolist.data[i]).length - 2;
            check += todolist.data[i].checkCount;
            if (!cache.monthArr.includes(i)){
                continue;
            } else {
                totalmonth += Object.keys(todolist.data[i]).length - 2;
                checkmonth += todolist.data[i].checkCount;
                if (cache.weekArr.includes(i)){
                    totalweek += Object.keys(todolist.data[i]).length - 2;
                    checkweek += todolist.data[i].checkCount;
                }
            }
        }
    }

    //세 개의 달성률 html에 넣기
    innerAndOpa(check, total, '#percent');
    innerAndOpa(checkmonth, totalmonth, '#percentM');
    innerAndOpa(checkweek, totalweek, '#percentW');
}

//CRUD
//read
const listtab = document.querySelector('#list');
const planinput = document.querySelector('#plan');

const getSelectedDay8 = () => {
    return yyyymmddConverter(myCalendar.selectedDay.year, myCalendar.selectedDay.month, myCalendar.selectedDay.date);
};

const createTr = (plan, checked, num) => {
    return `
        <tr class='${num}' onmouseover='showdel(this)' onmouseout='unshowdel(this)'>
            <td><input type='text' maxlength=70 value='${plan}' onchange='save(this)' onkeyup='enterUpdate(this)'></td>
            <td class='delete'><input type='button' value='X' onclick='delPost(this)'></td>
            <td class='checkbox'><input type='checkbox' id='check_${num}' onchange='savecheck(this)' ${checked}>
                <label for='check_${num}'></label></td>
        </tr>
    `;
};

const reader = () => {
    const dateName = getSelectedDay8();
    if (!todolist.data[`${dateName}`]) { //날짜데이터생성
        todolist.data[`${dateName}`] = { checkCount : 0, idNum : 0 };
        todolist.dataToJSON();
    }
    const tar = todolist.data[`${dateName}`];
    let template = '';
    let i = 0;
    let _checked;
    while (i < tar.idNum){
        if (tar[`${i}`]){
            if (tar[`${i}`].check) _checked = 'checked';
            else _checked = '';
            template += createTr(tar[`${i}`].plan, _checked, i)  
        }
        i++;
    }
    listtab.innerHTML = template;
    achievementRate();
};

//create
const create = () => {
    todolist.planCreate(getSelectedDay8(), planinput.value);
    planinput.value = '';
    reader();
};

const enterCreate = () => {
    if (event.keyCode == 13) create();
}

//update & delete
const gettrNum = (tar) => {
    return tar.closest('tr').className; //가까운 조상의 class명
}
const save = (tar) => {
    const num = gettrNum(tar);
    todolist.planUpdate(getSelectedDay8(), num, tar.value);
};

const enterUpdate = (tar) => {
    if (event.keyCode == 13) tar.blur();
};

const savecheck = (tar) => {
    const num = gettrNum(tar);
    todolist.check(getSelectedDay8(), num, tar.checked);
    achievementRate();
};

const showdel = (tar) => {
    const delBtn = tar.getElementsByTagName('input')[1];
    delBtn.style.visibility = 'visible';
};

const unshowdel = (tar) => {
    const delBtn = tar.getElementsByTagName('input')[1];
    delBtn.style.visibility = 'hidden';
}

const delPost = (tar) => {
    const num = gettrNum(tar);
    todolist.delete(getSelectedDay8(), num);
    reader();
};

////실행부분
(() => {
    const d = new Date();
    cacheUpdate(d);
})();
reader();