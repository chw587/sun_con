// 로그아웃 박스 토글 기능
document.addEventListener('DOMContentLoaded', () => {
  const logBtn = document.querySelector('.sestting .log');
  const bellBtn = document.querySelector('.sestting .bell');
  const logoutBox = document.querySelector('.logout');
  const alarmBox = document.querySelector('.alarm_list');

  if (!logBtn || !bellBtn || !logoutBox || !alarmBox) return;

  const closeAll = () => {
    logoutBox.classList.remove('open');
    alarmBox.classList.remove('open');
  };

  // log 클릭 -> logout 토글 (알람은 닫음)
  logBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !logoutBox.classList.contains('open');
    closeAll();
    if (willOpen) logoutBox.classList.add('open');
  });

  // bell 클릭 -> alarm_list 토글 (로그아웃은 닫음)
  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !alarmBox.classList.contains('open');
    closeAll();
    if (willOpen) alarmBox.classList.add('open');
  });

  // 패널 내부 클릭은 닫힘 방지
  logoutBox.addEventListener('click', (e) => e.stopPropagation());
  alarmBox.addEventListener('click', (e) => e.stopPropagation());

  // 바깥 클릭 -> 전부 닫기
  document.addEventListener('click', () => closeAll());

  // ESC -> 전부 닫기(선택)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
});


// 희원 1223
// -----nav - hover-----
$(document).ready(function () {
  const nav = $('.nav');
  const spans = $('.side_menu span');
  const BREAKPOINT = 786;

  function isMobileWidth() {
    return window.innerWidth <= BREAKPOINT;
  }

  nav.on('mouseenter', function () {
    // 786px 이하에서는 동작 안 함
    if (isMobileWidth()) return;

    $(this).addClass('expanded');

    setTimeout(function () {
      spans.css('display', 'block');
      setTimeout(function () {
        spans.addClass('show');
      }, 5);
    }, 100);
  });

  nav.on('mouseleave', function () {
    // 786px 이하에서는 동작 안 함
    if (isMobileWidth()) return;

    spans.removeClass('show');

    setTimeout(function () {
      spans.css('display', 'none');
      nav.removeClass('expanded');
    }, 100);
  });

  // (선택) 786px 이하로 줄어들었을 때 열려있던 상태 강제 해제
  $(window).on('resize', function () {
    if (isMobileWidth()) {
      spans.removeClass('show').css('display', 'none');
      nav.removeClass('expanded');
    }
  });
});


// 희원 0105
// 모달 열고닫기
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.querySelector('.add');
  const modalBg = document.querySelector('.modal_bg');
  const closeBtn = document.querySelector('.modal_bg .close');
  const cancleBtn = document.querySelector('.modal_button .cancle_btn')

  if (!addBtn || !modalBg) return;

   // modal 열기
  addBtn.addEventListener('click', () => {
    modalBg.style.display = 'block'; 
  });

  // modal 닫기
  if(closeBtn) {
    closeBtn.addEventListener('click', ()=> {
      modalBg.style.display = 'none'
    })
  }

  if(cancleBtn) {
    cancleBtn.addEventListener('click', ()=> {
      modalBg.style.display = 'none'
    })
  }
})

// 비밀번호 일치여부
$(function () {
  function validate() {
    const pw = $('#pw').val().trim();
    const pw2 = $('#pwConfirm').val().trim();

    if (!pw || !pw2) {
      $('.passwordk_pass').hide();
      $('.password_wrong').hide();
      return;
    }

    if (pw === pw2) {
      $('.passwordk_pass').show();
      $('.password_wrong').hide();
    } else {
      $('.passwordk_pass').hide();
      $('.password_wrong').show();
    }
  }

  $('#pw, #pwConfirm').on('input', validate);
});

// 아이디 입력후  버튼 활성화
$(function () {
  $('.add_id').on('input', function () {
    const hasValue = $(this).val().trim().length > 0;
    const btn = $(this).closest('div').find('button');

    if (hasValue) {
      btn.removeClass('disable').addClass('active');
    } else {
      btn.removeClass('active').addClass('disable');
    }
  });
});


// 페이지 전환
$(function () {
  $('.person_icon').on('click', function() {
    $('.person_wrap').show();
    $('.data_wrap').hide();
    $('.data_icon').removeClass('menu_active');
    $('.person_icon').addClass('menu_active');
  });

  $('.data_icon').on('click', function() {
    $('.person_wrap').hide();
    $('.data_wrap').show();
    $('.person_icon').removeClass('menu_active');
    $('.data_icon').addClass('menu_active');
  })
})


// 수정하기
// $(function () {
//   $('.edit button').on('click', function () {
//     $('.modal_bg').show()
//   })
// })