const container = document.querySelector('.toggle_container');
const buttons = document.querySelectorAll('.toggle_btn');
const slider = document.querySelector('.toggle_slider');
const tableContent = document.querySelector('.main_content.table');
const chartContent = document.querySelector('.main_content.chart');

// 슬라이더 위치 업데이트 함수
function updateSlider(button) {
    const rect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    slider.style.width = rect.width + 'px';
    slider.style.height = rect.height + 'px';
    slider.style.left = (rect.left - containerRect.left) + 'px';
    slider.style.top = (rect.top - containerRect.top) + 'px';
}

// 컨텐츠 전환 함수
function switchContent(value) {
    if (value === '표') {
        tableContent.style.display = 'flex';
        chartContent.style.display = 'none';
    } else {
        tableContent.style.display = 'none';
        chartContent.style.display = 'flex';
    }
}

// 초기 슬라이더 위치 설정
const activeBtn = document.querySelector('.toggle_btn.active');
updateSlider(activeBtn);

// 버튼 클릭 이벤트
buttons.forEach(button => {
    button.addEventListener('click', function () {
        // active 클래스 전환
        buttons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // 슬라이더 및 컨텐츠 업데이트
        updateSlider(this);
        switchContent(this.dataset.value);

    });
});