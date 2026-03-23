// ===== 시간 설정 =====
const timeCount = 8;   // 표시할 시간대 개수
const interval = 30;    // 간격 (분)


// 현재 시간을 30분 단위로 내림
function getCurrentTime30Min() {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMin = minutes >= 30 ? 30 : 0;
    return {
        hour: now.getHours(),
        min: roundedMin
    };
}

// 시간 라벨 자동 생성 (과거 시간부터)
function generateTimeLabels(count, step) {
    const current = getCurrentTime30Min();
    const labels = [];
    let currentHour = current.hour;
    let currentMin = current.min;

    // 현재 시간부터 과거로 count개 생성
    for (let i = 0; i < count; i++) {
        const hourStr = String(currentHour).padStart(2, '0');
        const minStr = String(currentMin).padStart(2, '0');
        labels.unshift(`${hourStr}:${minStr}`); // 앞에 추가 (과거부터 표시)

        currentMin -= step;
        if (currentMin < 0) {
            currentMin = 30;
            currentHour--;
            if (currentHour < 0) {
                currentHour = 23;
            }
        }
    }
    return labels;
}

const timeLabels = generateTimeLabels(timeCount, interval);

// 순간 일사량 데이터
const momentData = [
    [0, 100, 140, 200, 170, 150, 130, 110, 90, 70],
    [260, 200, 140, 120, 90, 80, 70, 60, 50, 40],
    [120, 200, 130, 70, 160, 140, 120, 100, 80, 60],
    [100, 80, 100, 130, 50, 60, 70, 80, 90, 100],
    [180, 130, 120, 260, 220, 200, 180, 160, 140, 120]
];

// chart1
const ctx1 = document.getElementById('chart1').getContext('2d');
const chart1 = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [
            {
                label: '1구역',
                data: momentData[0],
                borderColor: '#FF6B5A',
                backgroundColor: '#FF6B5A',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '2구역',
                data: momentData[1],
                borderColor: '#4EA8FF',
                backgroundColor: '#4EA8FF',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '3구역',
                data: momentData[2],
                borderColor: '#FFC845',
                backgroundColor: '#FFC845',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '4구역',
                data: momentData[3],
                borderColor: '#8B6BFF',
                backgroundColor: '#8B6BFF',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '5구역',
                data: momentData[4],
                borderColor: '#2EC9A8',
                backgroundColor: '#2EC9A8',
                tension: 0,
                borderWidth: 3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.55,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: false,
                    boxWidth: 15,
                    boxHeight: 15,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'nearest',
                intersect: true,
                displayColors: false,
                callbacks: {
                    title: function () {
                        return '';
                    },
                    label: function (context) {
                        return context.parsed.y + 'W/m²';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 300,
                ticks: {
                    stepSize: 50,
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                    display: true,
                    text: 'W/m²',
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    }
});

// 각 구역별 누적 합계 계산
const cumulativeData = momentData.map(regionData => {
    let sum = 0;
    return regionData.map(value => {
        sum += value;
        return sum;
    });
});

// chart2
const ctx2 = document.getElementById('chart2').getContext('2d');
const chart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [
            {
                label: '1구역',
                data: cumulativeData[0],
                borderColor: '#FF6B5A',
                backgroundColor: '#FF6B5A',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '2구역',
                data: cumulativeData[1],
                borderColor: '#4EA8FF',
                backgroundColor: '#4EA8FF',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '3구역',
                data: cumulativeData[2],
                borderColor: '#FFC845',
                backgroundColor: '#FFC845',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '4구역',
                data: cumulativeData[3],
                borderColor: '#8B6BFF',
                backgroundColor: '#8B6BFF',
                tension: 0,
                borderWidth: 3
            },
            {
                label: '5구역',
                data: cumulativeData[4],
                borderColor: '#2EC9A8',
                backgroundColor: '#2EC9A8',
                tension: 0,
                borderWidth: 3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.55,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: false,
                    boxWidth: 15,
                    boxHeight: 15,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'nearest',
                intersect: true,
                displayColors: false,
                callbacks: {
                    title: function () {
                        return '';
                    },
                    label: function (context) {
                        return context.parsed.y + 'W/m²';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 200,
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                    display: true,
                    text: 'W/m²',
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    }
});



// 희원 12099
function updateChartLayout() {
    const width = window.innerWidth;

    const canvas1 = chart1.canvas;
    const canvas2 = chart2.canvas;

    if (width < 768) {
        // 모바일: 정사각형 비율 + 너비 100%
        canvas1.style.width = '100%';
        canvas2.style.width = '100%';

        chart1.options.aspectRatio = 1.4;    // 1:1
        chart2.options.aspectRatio = 1.4;
    } else if (width < 1050) {
        // 태블릿/중간 화면: 납작한 와이드 + 너비 100%
        canvas1.style.width = '100%';
        canvas2.style.width = '100%';

        chart1.options.aspectRatio = 2;    // 2:1 (width/height)
        chart2.options.aspectRatio = 2;
    } else {
        // 데스크탑: 기본 비율, 너비는 부모/CSS에 맡김
        canvas1.style.width = '';
        canvas2.style.width = '';

        chart1.options.aspectRatio = 1.55;
        chart2.options.aspectRatio = 1.55;
    }

    chart1.resize();
    chart2.resize();
}

// 최초 1번 호출
updateChartLayout();

// 윈도우 리사이즈될 때마다 레이아웃 재계산
window.addEventListener('resize', updateChartLayout);