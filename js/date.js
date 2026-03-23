
const POPUP_ANIM_MS = 330;
const YM_ANIM_MS = 220;

// table/chart 각각 selector 묶음
const DTP = {
  table: {
    startField: '#startDateField',
    startDisp: '#startDateDisplay',
    endField: '#endDateField',
    endDisp: '#endDateDisplay',

    startPopup: '#startPopup',
    endPopup: '#endPopup',

    startMonthYear: '#startMonthYear',
    endMonthYear: '#endMonthYear',

    startYm: '#startYmPicker',
    endYm: '#endYmPicker',

    startDays: '#startDays',
    endDays: '#endDays',

    startHour: '#startHourScroll',
    startMin: '#startMinuteScroll',
    endHour: '#endHourScroll',
    endMin: '#endMinuteScroll'
  },
  chart: {
    startField: '#startDateField_chart',
    startDisp: '#startDateDisplay_chart',
    endField: '#endDateField_chart',
    endDisp: '#endDateDisplay_chart',

    startPopup: '#startPopup_chart',
    endPopup: '#endPopup_chart',

    startMonthYear: '#startMonthYear_chart',
    endMonthYear: '#endMonthYear_chart',

    startYm: '#startYmPicker_chart',
    endYm: '#endYmPicker_chart',

    startDays: '#startDays_chart',
    endDays: '#endDays_chart',

    startHour: '#startHourScroll_chart',
    startMin: '#startMinuteScroll_chart',
    endHour: '#endHourScroll_chart',
    endMin: '#endMinuteScroll_chart'
  }
};

const STATE = { table: null, chart: null };

function makeDefaultState() {
  const now = new Date();
  return {
    startDate: new Date(now),
    endDate: new Date(now),
    startTempDate: new Date(now),
    endTempDate: new Date(now),
    currentStartMonth: new Date(now),
    currentEndMonth: new Date(now),
    startSelectionState: { dateSelected: false, hourSelected: false, minuteSelected: false }
  };
}

$(document).ready(function () {
  initPicker('table');
  initPicker('chart');

  bindEvents('table');
  bindEvents('chart');

  bindToggleReset();

  // YM 바깥 클릭 닫기(표/차트 모두)
  bindGlobalOutsideClickForYm(); // [ADD] 아래 구현 추가
});

// =====================
// 토글 이동 시 기본값 리셋
// =====================
function bindToggleReset() {
  $(document).off('click.dtpToggle').on('click.dtpToggle', '.toggle_btn', function () {
    setTimeout(() => {
      if ($('.main_content.table').is(':visible')) resetPicker('table');
      if ($('.main_content.chart').is(':visible')) resetPicker('chart');

      // 혹시 떠있던 팝업 전부 닫기
      closePopup('table', 'start', true);
      closePopup('table', 'end', true);
      closePopup('chart', 'start', true);
      closePopup('chart', 'end', true);
    }, 0);
  });
}

// =====================
// 초기화/리셋
// =====================
function initPicker(key) {
  // [FIX] 페이지에 해당 DOM이 없으면(별도 페이지) 초기화/바인딩이 꼬이므로 스킵
  if (!$(DTP[key].startField).length && !$(DTP[key].endField).length) return;
  resetPicker(key);
}

function resetPicker(key) {
  if (!$(DTP[key].startField).length && !$(DTP[key].endField).length) return;

  STATE[key] = makeDefaultState();

  updateDateDisplay(key, 'start');
  updateDateDisplay(key, 'end');

  renderCalendar(key, 'start');
  renderCalendar(key, 'end');

  createTimeScrolls(key, 'start');
  createTimeScrolls(key, 'end');

  hideYmPicker(key, 'start', true);
  hideYmPicker(key, 'end', true);
  closePopup(key, 'start', true);
  closePopup(key, 'end', true);
}

// =====================
// display 기반 open/close 유틸
// =====================
function openWithDisplay($el) {
  if (!$el || !$el.length) return; // [FIX]

  const token = Date.now() + Math.random(); // [FIX]
  $el.data('__dtpToken__', token);          // [FIX]

  $el.removeClass('open');
  $el.css('display', 'block');

  requestAnimationFrame(() => {
    if ($el.data('__dtpToken__') !== token) return; // [FIX]
    $el.addClass('open');
  });
}

function closeWithDisplay($el, durationMs, immediate = false) {
  if (!$el || !$el.length) return; // [FIX]

  const token = Date.now() + Math.random(); // [FIX]
  $el.data('__dtpToken__', token);          // [FIX]

  if (immediate) {
    $el.removeClass('open');
    $el.css('display', 'none');
    return;
  }

  $el.removeClass('open');

  setTimeout(() => {
    // [FIX] 닫는 도중 다시 열렸으면 display:none 하지 않음
    if ($el.data('__dtpToken__') !== token) return;
    if ($el.hasClass('open')) return;
    $el.css('display', 'none');
  }, durationMs);
}

// =====================
// 시간/분 스크롤 "보이는 위치" 정렬
// =====================
function centerTimeToSelected($scroll, attempt = 0) {
  if (!$scroll || !$scroll.length) return; // [FIX]

  if ($scroll.height() === 0) {
    if (attempt < 10) setTimeout(() => centerTimeToSelected($scroll, attempt + 1), 30);
    return;
  }

  const $sel = $scroll.find('.time_item.selected').first();
  if (!$sel.length) return;

  const itemH = $sel.outerHeight();
  const contH = $scroll.height();
  const idx = $sel.index();

  const target = (idx * itemH) - (contH / 2) + (itemH / 2);
  $scroll.scrollTop(target);
}

function centerTimeScrolls(key, type) {
  const cfg = DTP[key];
  const $hour = (type === 'start') ? $(cfg.startHour) : $(cfg.endHour);
  const $min = (type === 'start') ? $(cfg.startMin) : $(cfg.endMin);

  centerTimeToSelected($hour);
  centerTimeToSelected($min);
}

// =====================
// 날짜 표시
// =====================
function updateDateDisplay(key, type) {
  const st = STATE[key];
  if (!st) return; // [FIX]
  const cfg = DTP[key];

  const date = (type === 'start') ? st.startDate : st.endDate;
  const $disp = (type === 'start') ? $(cfg.startDisp) : $(cfg.endDisp);
  if (!$disp.length) return; // [FIX]

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  $disp.text(`${year}-${month}-${day} ${hour}:${minute}`);
}

// =====================
// 달력 본문 숨김/표시(연/월 picker 열 때)
// [FIX] origDisplay가 none으로 저장되어 block으로 복구되는 문제 방지(기본값: weekdays=flex, days=grid)
// =====================
function setCalendarBodyVisible(key, type, visible) {
  const cfg = DTP[key];
  const $popup = (type === 'start') ? $(cfg.startPopup) : $(cfg.endPopup);
  if (!$popup.length) return; // [FIX]

  const $weekdays = $popup.find('.calendar .weekdays');
  const $days = $popup.find('.calendar .days');

  function defaultDisplay($el) { 
    if (!$el || !$el.length) return 'block';
    if ($el.hasClass('weekdays')) return 'grid';
    if ($el.hasClass('days')) return 'grid';
    return 'block';
  }

  function saveDisplay($el) {
    if (!$el || !$el.length) return; // [FIX]
    if ($el.data('origDisplay') == null) {
      const d = window.getComputedStyle($el[0]).display;
      // display가 none이면(부모가 숨김) 원래값을 모름 -> 기본값으로 저장
      $el.data('origDisplay', (d && d !== 'none') ? d : defaultDisplay($el)); // [FIX]
    }
  }

  function setDisplay($el, on) {
    if (!$el || !$el.length) return; // [FIX]
    if (on) {
      const d = $el.data('origDisplay') || defaultDisplay($el); // [FIX]
      $el.css('display', d);
    } else {
      saveDisplay($el);
      $el.css('display', 'none');
    }
  }

  setDisplay($weekdays, visible);
  setDisplay($days, visible);
}

// =====================
// 팝업 open/close
// =====================
function openPopup(key, type) {
  const cfg = DTP[key];

  if (type === 'start') closePopup(key, 'end');
  else closePopup(key, 'start');

  // YM은 무조건 닫고 시작
  hideYmPicker(key, 'start', true);
  hideYmPicker(key, 'end', true);

  setCalendarBodyVisible(key, type, true);

  const $popup = (type === 'start') ? $(cfg.startPopup) : $(cfg.endPopup);
  openWithDisplay($popup);

  requestAnimationFrame(() => setTimeout(() => centerTimeScrolls(key, type), 0));
}

function closePopup(key, type, immediate = false) {
  const cfg = DTP[key];

  hideYmPicker(key, type, true);
  setCalendarBodyVisible(key, type, true);

  const $popup = (type === 'start') ? $(cfg.startPopup) : $(cfg.endPopup);
  closeWithDisplay($popup, POPUP_ANIM_MS, immediate);
}

// =====================
// 달력 렌더
// =====================
function renderCalendar(key, type) {
  const st = STATE[key];
  if (!st) return; // [FIX]
  const cfg = DTP[key];

  const currentMonth = (type === 'start') ? st.currentStartMonth : st.currentEndMonth;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const $title = (type === 'start') ? $(cfg.startMonthYear) : $(cfg.endMonthYear);
  if ($title.length) $title.text(`${year}년 ${month + 1}월`); // [FIX]

  const $daysContainer = (type === 'start') ? $(cfg.startDays) : $(cfg.endDays);
  if (!$daysContainer.length) return; // [FIX]
  $daysContainer.empty();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const today = new Date();
  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const selectedDate = (type === 'start') ? st.startTempDate : st.endTempDate;
  const isSelected = (d) =>
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDate - i;
    $daysContainer.append(
      $('<div>').addClass('day other_month').text(day)
        .data('date', new Date(year, month - 1, day))
    );
  }

  for (let day = 1; day <= lastDate; day++) {
    const currentDate = new Date(year, month, day);
    const $d = $('<div>').addClass('day').text(day).data('date', currentDate);

    if (isToday(currentDate)) $d.addClass('today');
    if (isSelected(currentDate)) $d.addClass('selected');

    $daysContainer.append($d);
  }

  const totalCells = $daysContainer.children().length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    $daysContainer.append(
      $('<div>').addClass('day other_month').text(day)
        .data('date', new Date(year, month + 1, day))
    );
  }
}

// =====================
// YM Picker
// =====================
function hideYmPicker(key, type, immediate = false) {
  const cfg = DTP[key];
  const $p = (type === 'start') ? $(cfg.startYm) : $(cfg.endYm);
  if (!$p.length) return; // [FIX]

  if ($p.css('display') === 'none') {
    setCalendarBodyVisible(key, type, true);
    return;
  }

  closeWithDisplay($p, YM_ANIM_MS, immediate);

  if (immediate) {
    setCalendarBodyVisible(key, type, true);
  } else {
    setTimeout(() => setCalendarBodyVisible(key, type, true), YM_ANIM_MS);
  }
}

function openYmPicker(key, type) {
  const cfg = DTP[key];

  if (type === 'start') hideYmPicker(key, 'end', true);
  else hideYmPicker(key, 'start', true);

  // YM 열리면 달력 본문 숨김
  setCalendarBodyVisible(key, type, false);

  createYearMonthPicker(key, type);

  const $p = (type === 'start') ? $(cfg.startYm) : $(cfg.endYm);
  openWithDisplay($p);

  setTimeout(() => {
    const $yearScroll = $p.find('.ym_scroll').first();
    const $monthScroll = $p.find('.ym_scroll').last();
    scrollItemToCenter($yearScroll, $yearScroll.find('.ym_item.selected'));
    scrollItemToCenter($monthScroll, $monthScroll.find('.ym_item.selected'));
  }, 0);
}

function toggleYmPicker(key, type) {
  const cfg = DTP[key];
  const $p = (type === 'start') ? $(cfg.startYm) : $(cfg.endYm);
  if (!$p.length) return; // [FIX]

  if ($p.css('display') !== 'none') hideYmPicker(key, type);
  else openYmPicker(key, type);
}

function createYearMonthPicker(key, type) {
  const st = STATE[key];
  if (!st) return; // [FIX]
  const cfg = DTP[key];

  const $picker = (type === 'start') ? $(cfg.startYm) : $(cfg.endYm);
  if (!$picker.length) return; // [FIX]
  $picker.empty();

  const cur = (type === 'start') ? st.currentStartMonth : st.currentEndMonth;
  const curYear = cur.getFullYear();
  const curMonth = cur.getMonth() + 1;

  $picker.data('selYear', curYear);
  $picker.data('selMonth', curMonth);

  const $cols = $('<div>').addClass('ym_cols');

  const $yearCol = $('<div>').addClass('ym_column');
  const $yearScroll = $('<div>').addClass('ym_scroll');
  $yearCol.append($('<span>').addClass('ym_label').text('년'), $yearScroll);

  for (let y = curYear - 50; y <= curYear + 50; y++) {
    const $it = $('<div>').addClass('ym_item').text(y).data('year', y);
    if (y === curYear) $it.addClass('selected');
    $yearScroll.append($it);
  }

  const $monthCol = $('<div>').addClass('ym_column');
  const $monthScroll = $('<div>').addClass('ym_scroll');
  $monthCol.append($('<span>').addClass('ym_label').text('월'), $monthScroll);

  for (let m = 1; m <= 12; m++) {
    const $it = $('<div>').addClass('ym_item').text(`${m}`).data('month', m);
    if (m === curMonth) $it.addClass('selected');
    $monthScroll.append($it);
  }

  const $actions = $('<div>').addClass('ym_actions');
  const $cancel = $('<button type="button">').addClass('ym_btn cancel').attr('data-action', 'cancel').text('취소');
  const $ok = $('<button type="button">').addClass('ym_btn ok').attr('data-action', 'ok').text('확인');
  $actions.append($cancel, $ok);

  $cols.append($yearCol, $monthCol);
  $picker.append($cols, $actions);
}

// =====================
// 시간/분 스크롤 생성
// =====================
function createTimeScrolls(key, type) {
  const st = STATE[key];
  if (!st) return; // [FIX]
  const cfg = DTP[key];

  const date = (type === 'start') ? st.startTempDate : st.endTempDate;

  const $hour = (type === 'start') ? $(cfg.startHour) : $(cfg.endHour);
  const $min = (type === 'start') ? $(cfg.startMin) : $(cfg.endMin);
  if (!$hour.length || !$min.length) return; // [FIX]

  $hour.empty();
  for (let h = 0; h < 24; h++) {
    const $it = $('<div>').addClass('time_item')
      .text(String(h).padStart(2, '0'))
      .data('hour', h);
    if (h === date.getHours()) $it.addClass('selected');
    $hour.append($it);
  }

  $min.empty();
  for (let m = 0; m < 60; m++) {
    const $it = $('<div>').addClass('time_item')
      .text(String(m).padStart(2, '0'))
      .data('minute', m);
    if (m === date.getMinutes()) $it.addClass('selected');
    $min.append($it);
  }
}

// =====================
// 시작 자동 닫기
// =====================
function checkStartAutoClose(key) {
  const st = STATE[key];
  if (!st) return; // [FIX]
  const s = st.startSelectionState;

  if (s.dateSelected && s.hourSelected && s.minuteSelected) {
    st.startDate = new Date(st.startTempDate);
    updateDateDisplay(key, 'start');
    closePopup(key, 'start');
    st.startSelectionState = { dateSelected: false, hourSelected: false, minuteSelected: false };
  }
}

// =====================
// 이벤트 바인딩(key별)
// [FIX] 페이지에 해당 요소가 없으면 아예 바인딩 스킵(별도 페이지에서 오류 방지)
// =====================
function bindEvents(key) {
  const cfg = DTP[key];
  if (!$(cfg.startField).length && !$(cfg.endField).length) return; // [FIX]

  $(document).off(`.dtp_${key}`);

  $(document).on(`click.dtp_${key}`, cfg.startField, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]

    st.startTempDate = new Date(st.startDate);
    st.currentStartMonth = new Date(st.startDate);
    st.startSelectionState = { dateSelected: false, hourSelected: false, minuteSelected: false };

    renderCalendar(key, 'start');
    createTimeScrolls(key, 'start');
    openPopup(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, cfg.endField, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]

    st.endTempDate = new Date(st.endDate);
    st.currentEndMonth = new Date(st.endDate);

    renderCalendar(key, 'end');
    createTimeScrolls(key, 'end');
    openPopup(key, 'end');
  });

  // 달력 이전/다음 버튼
  $(document).on(`click.dtp_${key}`, `${cfg.startPopup} .calendar_header .calendar_btn`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'start', true);

    const src = $(this).attr('src') || ''; // [FIX]
    const isLeft = src.includes('left');
    st.currentStartMonth.setMonth(st.currentStartMonth.getMonth() + (isLeft ? -1 : 1));
    renderCalendar(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endPopup} .calendar_header .calendar_btn`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'end', true);

    const src = $(this).attr('src') || ''; // [FIX]
    const isLeft = src.includes('left');
    st.currentEndMonth.setMonth(st.currentEndMonth.getMonth() + (isLeft ? -1 : 1));
    renderCalendar(key, 'end');
  });

  // 연/월 타이틀
  $(document).on(`click.dtp_${key}`, cfg.startMonthYear, function (e) {
    e.stopPropagation();
    toggleYmPicker(key, 'start');
  });
  $(document).on(`click.dtp_${key}`, cfg.endMonthYear, function (e) {
    e.stopPropagation();
    toggleYmPicker(key, 'end');
  });

  // YM item
  $(document).on(`click.dtp_${key}`, `${cfg.startYm} .ym_item, ${cfg.endYm} .ym_item`, function (e) {
    e.stopPropagation();
    const $picker = $(this).closest('.ym_picker');
    const year = $(this).data('year');
    const month = $(this).data('month');

    if (year !== undefined) {
      $picker.find('.ym_scroll').first().find('.ym_item').removeClass('selected');
      $(this).addClass('selected');
      $picker.data('selYear', year);
      scrollItemToCenter($(this).closest('.ym_scroll'), $(this));
    }
    if (month !== undefined) {
      $picker.find('.ym_scroll').last().find('.ym_item').removeClass('selected');
      $(this).addClass('selected');
      $picker.data('selMonth', month);
      scrollItemToCenter($(this).closest('.ym_scroll'), $(this));
    }
  });

  // YM 취소/확인
  $(document).on(`click.dtp_${key}`, `${cfg.startYm} .ym_btn, ${cfg.endYm} .ym_btn`, function (e) {
    e.stopPropagation();
    const st = STATE[key];
    if (!st) return; // [FIX]

    const $picker = $(this).closest('.ym_picker');
    const action = $(this).attr('data-action');

    const type = ($picker.attr('id') === cfg.startYm.slice(1)) ? 'start' : 'end';

    if (action === 'cancel') {
      hideYmPicker(key, type);
      return;
    }

    const y = Number($picker.data('selYear'));
    const m = Number($picker.data('selMonth')); // 1~12

    if (type === 'start') {
      st.currentStartMonth.setFullYear(y);
      st.currentStartMonth.setMonth(m - 1);
      renderCalendar(key, 'start');
      hideYmPicker(key, 'start');
    } else {
      st.currentEndMonth.setFullYear(y);
      st.currentEndMonth.setMonth(m - 1);
      renderCalendar(key, 'end');
      hideYmPicker(key, 'end');
    }
  });

  // 날짜 선택
  $(document).on(`click.dtp_${key}`, `${cfg.startDays} .day`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'start', true);

    const h = st.startTempDate.getHours();
    const mi = st.startTempDate.getMinutes();

    const selectedDate = $(this).data('date');
    st.startTempDate = new Date(selectedDate);
    st.startTempDate.setHours(h);
    st.startTempDate.setMinutes(mi);

    st.currentStartMonth = new Date(selectedDate);
    renderCalendar(key, 'start');

    st.startSelectionState.dateSelected = true;
    checkStartAutoClose(key);
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endDays} .day`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'end', true);

    const h = st.endTempDate.getHours();
    const mi = st.endTempDate.getMinutes();

    const selectedDate = $(this).data('date');
    st.endTempDate = new Date(selectedDate);
    st.endTempDate.setHours(h);
    st.endTempDate.setMinutes(mi);

    st.currentEndMonth = new Date(selectedDate);
    renderCalendar(key, 'end');
  });

  // 시간 선택
  $(document).on(`click.dtp_${key}`, `${cfg.startHour} .time_item`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'start', true);

    st.startTempDate.setHours($(this).data('hour'));
    $(`${cfg.startHour} .time_item`).removeClass('selected');
    $(this).addClass('selected');

    st.startSelectionState.hourSelected = true;
    checkStartAutoClose(key);

    centerTimeScrolls(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.startMin} .time_item`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'start', true);

    st.startTempDate.setMinutes($(this).data('minute'));
    $(`${cfg.startMin} .time_item`).removeClass('selected');
    $(this).addClass('selected');

    st.startSelectionState.minuteSelected = true;
    checkStartAutoClose(key);

    centerTimeScrolls(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endHour} .time_item`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'end', true);

    st.endTempDate.setHours($(this).data('hour'));
    $(`${cfg.endHour} .time_item`).removeClass('selected');
    $(this).addClass('selected');

    centerTimeScrolls(key, 'end');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endMin} .time_item`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]
    hideYmPicker(key, 'end', true);

    st.endTempDate.setMinutes($(this).data('minute'));
    $(`${cfg.endMin} .time_item`).removeClass('selected');
    $(this).addClass('selected');

    centerTimeScrolls(key, 'end');
  });

  // 취소/확인
  $(document).on(`click.dtp_${key}`, `${cfg.startPopup} .cancle_btn`, function () {
    if (!STATE[key]) return; // [FIX]
    STATE[key].startSelectionState = { dateSelected: false, hourSelected: false, minuteSelected: false };
    closePopup(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.startPopup} .confirm_btn`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]

    st.startDate = new Date(st.startTempDate);
    updateDateDisplay(key, 'start');
    st.startSelectionState = { dateSelected: false, hourSelected: false, minuteSelected: false };
    closePopup(key, 'start');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endPopup} .cancle_btn`, function () {
    closePopup(key, 'end');
  });

  $(document).on(`click.dtp_${key}`, `${cfg.endPopup} .confirm_btn`, function () {
    const st = STATE[key];
    if (!st) return; // [FIX]

    st.endDate = new Date(st.endTempDate);
    updateDateDisplay(key, 'end');
    closePopup(key, 'end');
  });
}

// =====================
// [ADD] 누락 함수 1) scrollItemToCenter (ReferenceError 방지)
// =====================
function scrollItemToCenter($scroll, $item) {
  if (!$scroll || !$scroll.length || !$item || !$item.length) return;
  const target =
    $item.position().top + $scroll.scrollTop() -
    ($scroll.height() / 2 - $item.outerHeight() / 2);
  $scroll.stop(true).animate({ scrollTop: target }, 120);
}

// =====================
// [ADD] 누락 함수 2) YM 바깥 클릭 닫기 (ReferenceError 방지)
// =====================
function bindGlobalOutsideClickForYm() {
  $(document).off('click.dtpYmOutside').on('click.dtpYmOutside', function (e) {
    ['table', 'chart'].forEach((key) => {
      // 해당 key DOM이 없는 페이지면 스킵
      if (!$(DTP[key].startField).length && !$(DTP[key].endField).length) return;

      const cfg = DTP[key];

      // start YM
      const $sYm = $(cfg.startYm);
      if ($sYm.length && $sYm.css('display') !== 'none') {
        if ($(e.target).closest(cfg.startYm).length === 0 &&
            $(e.target).closest(cfg.startMonthYear).length === 0) {
          hideYmPicker(key, 'start');
        }
      }

      // end YM
      const $eYm = $(cfg.endYm);
      if ($eYm.length && $eYm.css('display') !== 'none') {
        if ($(e.target).closest(cfg.endYm).length === 0 &&
            $(e.target).closest(cfg.endMonthYear).length === 0) {
          hideYmPicker(key, 'end');
        }
      }
    });
  });

  // YM 내부 클릭은 바깥 클릭 닫기 방지
  $(document).off('click.dtpYmInside').on('click.dtpYmInside', '.ym_picker', function (e) {
    e.stopPropagation();
  });
}
