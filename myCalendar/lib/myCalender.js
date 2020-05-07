const myCalendarCustom = {
    postTreat : function(){},
    selectPostTreat : function(){},
    goTodayPostTreat : function(){},
    movePostTreat : function(){}
};

const myCalendar = (function (){
    //myCalendar public method
    //myCalendar.createCalendar()
    //myCalendar.showCalendar(selectPostTreat)

    //기본 데이터
    let dateCountArr = [31,28,31,30,31,30,31,31,30,31,30,31];
    //현재 날짜 받아오기
    let viewDay = {};
    let d;
    //달력테이블셀
    let tdArr = []; //자바스크립트는 다차원배열을 지원하지 않고 배열 안에 배열을 넣어서 구현해야함.

    //뷰 날짜 초기화 함수
    const initialday = function(){
        d = new Date();
        viewDay.year = d.getFullYear();
        viewDay.month = (d.getMonth() + 1);
        viewDay.date = d.getDate();
        viewDay.maxdate = 30;
    };

    //뷰 날짜 초기화
    initialday();

    //선택 날짜 초기화
    let selectedDay = {
        year : d.getFullYear(),
        month : (d.getMonth() + 1),
        date : d.getDate()
    };

    //달력 본체 만들기
    const generateTemplate = function (goTodayPostTreat, movePostTreat){
        const template = `
            <div id='myCalendar' class='a'>
                <div class='controlWrap'>
                    <div class='btnCell'>
                        <input type="button" class="prev year"  onclick='myCalendar.prevYear(${movePostTreat})'>
                    </div>
                    <div class='output year'><span></span></div>
                    <div class='btnCell'>
                        <input type="button" class="next year" onclick='myCalendar.nextYear(${movePostTreat})'>
                    </div>
                    <div></div>
                    <div class='btnCell'>
                        <input type="button" class="prev month" onclick='myCalendar.prevMonth(${movePostTreat})'>
                    </div>
                    <div class='output month'><span></span></div>
                    <div class='btnCell'>
                        <input type="button" class="next month" onclick='myCalendar.nextMonth(${movePostTreat})'>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>일</th>
                            <th>월</th>
                            <th>화</th>
                            <th>수</th>
                            <th>목</th>
                            <th>금</th>
                            <th>토</th>
                        </tr>
                    </thead>
                    <tbody class='calbody'>
                    </tbody>
                </table>
                <input type="button" class="todayBtn" value="오늘" onclick="myCalendar.goToday(${goTodayPostTreat})">
            </div>
        `;
        document.write(template);
    };

    //달력 만들기 함수
    const createCalendar = function(goTodayPostTreat=true, movePostTreat=true){
        generateTemplate(goTodayPostTreat, movePostTreat);
        const calbody = document.querySelector("#myCalendar .calbody");
        //달력 테이블 만들기
        for (let i = 0; i < 6; i++){
            tdArr[i] = new Array(7);
        }
        for (let i = 0; i < 6; i++){
            let tr = document.createElement('tr');
            for (let j = 0; j < 7; j++){
                let td = document.createElement('td');
                tr.appendChild(td);
                tdArr[i][j] = td;
            }
            calbody.appendChild(tr);
        }
    };

    //달력 출력 함수
    const showCalendar = function(postTreat=true, selectPostTreat=true){
        //컨트롤바 연월 바꾸기 viewDay의 프로퍼티값을 동적으로 바꾸는 것이고 다른 코드에 영향을 미치기 때문에 맨 위에 올림.
        const output_year = document.querySelector("#myCalendar .output.year span");
        const output_month = document.querySelector("#myCalendar .output.month span");
        const prev_year = document.querySelector("#myCalendar .prev.year");
        if (viewDay.year === 1){
            prev_year.setAttribute('disabled');
        } else {
            prev_year.removeAttribute('disabled');
        }
        if (viewDay.month === 0){
            viewDay.year -= 1;
            viewDay.month = 12;
        } else if (viewDay.month === 13){
            viewDay.year += 1;
            viewDay.month = 1;
        }

        output_year.innerHTML = viewDay.year + ' 년';
        if (viewDay.month < 10) {
            output_month.innerHTML = '0' + viewDay.month + ' 월';
        } else {
            output_month.innerHTML = viewDay.month + ' 월';
        }

        //선택되어있는 날짜 받아와서 윤년인지 계산
        if ((viewDay.year % 4 === 0 && viewDay.year % 100 !== 0) || 
            viewDay.year % 400 === 0){ //윤년이면
            //윤년
            dateCountArr[1] = 29;
        } else { //윤년이 아니면
            //평년
            dateCountArr[1] = 28;
        }

        viewDay.maxdate = dateCountArr[viewDay.month-1];

        //요일계산
        let leapCount = parseInt((viewDay.year - 1) / 4) - parseInt((viewDay.year - 1) / 100) + parseInt((viewDay.year - 1) / 400); //작년까지 윤년의 개수를 셈
        let firstDay = (viewDay.year + leapCount) % 7; //1월1일의 요일
        let sumDate = 0;
        for (let i = 0; i < (viewDay.month - 1); i++){
            sumDate += dateCountArr[i];
        }
        let firstMonthDay = (firstDay + sumDate) % 7; //viewMonth 1일의 요일

        //달력 출력
        let dateCount = 1;
        for (let i = 0; i < 6; i++){
            for (let j = 0; j < 7; j++){
                if ((i === 0 && j < firstMonthDay) || 
                    dateCount > dateCountArr[viewDay.month-1]){
                    tdArr[i][j].textContent = "";
                    tdArr[i][j].removeAttribute('class');
                    tdArr[i][j].removeAttribute('onclick');
                    tdArr[i][j].classList.remove('selected');
                } else {
                    tdArr[i][j].textContent = dateCount;
                    tdArr[i][j].setAttribute('class', `date_${dateCount}`)
                    tdArr[i][j].setAttribute('onclick', `myCalendar.selectDay(this, ${selectPostTreat})`);
                    if (dateCount === selectedDay.date && viewDay.month === selectedDay.month && viewDay.year === selectedDay.year){
                        tdArr[i][j].classList.add('selected');
                    } else {
                        tdArr[i][j].classList.remove('selected');
                    }
                    dateCount++;
                }
            }
        }
        if(postTreat) myCalendarCustom.postTreat();
    };

    //연도 이동 함수
    const prevYear = function(movePostTreat=true){
        viewDay.year -= 1;
        showCalendar();
        if (movePostTreat) myCalendarCustom.movePostTreat();
    };
    const nextYear = function(movePostTreat=true){
        viewDay.year += 1;
        showCalendar();
        if (movePostTreat) myCalendarCustom.movePostTreat();
    };

    //월 이동 함수
    const prevMonth = function(movePostTreat=true){
        viewDay.month -= 1;
        showCalendar();
        if (movePostTreat) myCalendarCustom.movePostTreat();
    };
    const nextMonth = function(movePostTreat=true){
        viewDay.month += 1;
        showCalendar();
        if (movePostTreat) myCalendarCustom.movePostTreat();
    };

    //날짜 클릭하면 선택되는 함수
    const selectDay = function(tar, selectPostTreat=true){
        selectedDay.year = viewDay.year;
        selectedDay.month = viewDay.month;
        selectedDay.date = tar.textContent;
        let selected = document.querySelector('.selected');
        if (selected) {selected.classList.remove('selected');}
        tar.classList.add('selected');
        if (selectPostTreat) myCalendarCustom.selectPostTreat();
    };

    //오늘 클릭하면
    const goToday = function(goTodayPostTreat=true){
        initialday();
        selectedDay.year = d.getFullYear();
        selectedDay.month = (d.getMonth() + 1);
        selectedDay.date = d.getDate();
        showCalendar();
        if (goTodayPostTreat) myCalendarCustom.goTodayPostTreat();
    };

    return {
        createCalendar : createCalendar,
        showCalendar : showCalendar,
        prevYear : prevYear,
        nextYear : nextYear,
        prevMonth : prevMonth,
        nextMonth : nextMonth,
        selectDay : selectDay,
        goToday : goToday,
        selectedDay : selectedDay,
        viewDay : viewDay
    };
}());