/* =============================================================================
   매일 경제 학습 서비스 — app.js
   MVP 핵심 기능 구현 (프런트엔드 · localStorage 기반, 백엔드 없이 실제 동작)

   기능 맵
   ① 오늘의 뉴스 3개   : 데이터 렌더 · 아코디언 · 음성재생(TTS) · 학습완료 · 노트저장
   ② 오늘의 경제 용어   : 3단 구조 · 내 사전 저장
   ③ 경제 캘린더        : D-day 자동 계산·정렬 · 사전설명 펼침
   ④ 나만의 노트        : 아카이브 · 검색 · 태그필터 · 메모 · AI 질문
   ⑤ 업종·종목 연결     : 국내/해외 토글 · 미니 스파크라인 · 등락 색상
   + 진행률/스트릭, 뷰 전환, 설정
   ============================================================================= */
'use strict';

/* ---------- [설정] 오늘 날짜 (PRD 기준일) ---------- */
const APP_TODAY = new Date(2026, 6, 2); // 2026-07-02 (월 0-index)

/* =============================================================================
   [data] 목업 데이터 — 실제 서비스에선 API로 대체되는 부분
   ============================================================================= */
const DATA = {
  // ① 뉴스 (난이도 1~3)
  news: [
    {
      id: 'n1', category: '통화정책', difficulty: 1,
      title: '한국은행, 기준금리 연 2.75%로 동결',
      summary: '한국은행 금융통화위원회가 기준금리를 연 2.75%로 5회 연속 동결했습니다.',
      why: '금리는 대출이자·예금이자·환율을 움직이는 “돈의 값”입니다. 동결은 경기 둔화와 물가를 동시에 지켜보겠다는 신중한 신호예요.',
      impacts: [
        '대출·예금 금리가 당분간 큰 변화 없이 유지될 가능성',
        '부동산·주식 등 자산시장엔 대체로 중립적 영향',
        '미국과의 금리 차 유지 → 환율 변동성은 계속 주시'
      ],
      tags: ['#은행', '#부동산', '#증권'],
    },
    {
      id: 'n2', category: '글로벌', difficulty: 2,
      title: '미국 6월 소비자물가(CPI) 3.1%… 시장 예상 부합',
      summary: '미국 6월 소비자물가 상승률이 전년 대비 3.1%로 시장 전망에 부합했습니다.',
      why: '미국 물가는 연준(Fed)의 금리 결정에 직결되고, 이는 곧 전 세계 환율·수출기업 실적으로 번집니다.',
      impacts: [
        '물가가 안정 흐름을 보이면 금리 인하 기대가 살아날 수 있음',
        '원/달러 환율과 수출주 투자심리에 영향',
        '반도체 등 경기민감 업종의 변동성 확대 가능'
      ],
      tags: ['#반도체', '#수출주', '#환율'],
    },
    {
      id: 'n3', category: '산업', difficulty: 3,
      title: 'AI 반도체 수요 급증, HBM 공급 부족 심화',
      summary: '생성형 AI 확산으로 고대역폭메모리(HBM) 수요가 급증하며 공급 부족이 이어지고 있습니다.',
      why: 'HBM은 AI 연산에 필수인 고성능 메모리로, 국내 반도체 기업의 새로운 수익원으로 주목받고 있어요.',
      impacts: [
        'HBM 강자인 국내 메모리 기업의 실적 개선 기대',
        '반도체 장비·소재 협력사로 온기 확산 가능',
        '공급 부족 장기화 시 완제품 가격 상승 요인'
      ],
      tags: ['#반도체', '#AI', '#장비'],
    },
  ],

  // ② 오늘의 용어
  term: {
    id: 't-qt',
    word: '양적긴축 (QT)',
    tag: '#금리',
    definition: '중앙은행이 사들였던 채권을 다시 시장에 팔아, 시중에 풀린 돈을 거둬들이는 정책이에요.',
    example: '양적완화가 수도꼭지로 욕조에 물을 채우는 것이라면, 양적긴축은 마개를 열어 물을 빼는 것과 같아요.',
    inNews: '오늘 미국 CPI 뉴스에서 “연준의 긴축 기조”가 언급됐죠. 시중 유동성이 줄면 주식·채권에 부담이 될 수 있어요.',
  },

  // ③ 경제 캘린더 (ISO 날짜)
  events: [
    { id: 'e1', name: '삼성전자 2분기 잠정실적 발표', date: '2026-07-08', type: '실적',
      desc: '반도체 업황 회복 여부를 가늠할 첫 지표. 시장 기대치와의 차이가 주가 방향을 좌우합니다.' },
    { id: 'e2', name: '미국 6월 소비자물가(CPI)', date: '2026-07-10', type: '지표',
      desc: '연준의 금리 경로에 가장 큰 영향을 주는 지표. 예상보다 높으면 긴축 우려가 커집니다.' },
    { id: 'e3', name: '한국은행 7월 금융통화위원회', date: '2026-07-16', type: '통화정책',
      desc: '기준금리 결정 회의. 동결/인하 여부와 총재 발언(포워드 가이던스)이 핵심입니다.' },
    { id: 'e4', name: '미국 FOMC 정례회의', date: '2026-07-29', type: '통화정책',
      desc: '미 연준의 금리 결정. 점도표와 파월 의장 기자회견이 글로벌 증시를 흔듭니다.' },
  ],

  // ⑤ 업종·종목 (교육용 · 과거 흐름 스파크라인)
  stocks: {
    domestic: [
      { name: '삼성전자', sector: '반도체', change: 1.2, series: [69,70,68,71,72,71,73,74,73,75,76,77] },
      { name: 'SK하이닉스', sector: '반도체', change: 3.4, series: [180,183,181,188,190,195,193,200,205,210,208,215] },
      { name: 'LG에너지솔루션', sector: '2차전지', change: -0.8, series: [420,418,415,410,412,408,405,400,402,398,395,392] },
      { name: 'KB금융', sector: '금융', change: 0.5, series: [72,72,73,73,74,74,73,74,75,75,76,76] },
      { name: '현대차', sector: '자동차', change: -0.3, series: [245,244,246,243,242,244,241,240,242,239,240,239] },
    ],
    global: [
      { name: 'NVIDIA', sector: 'AI 반도체', change: 2.7, series: [118,120,119,125,128,130,127,135,140,138,145,150] },
      { name: 'Apple', sector: 'IT', change: 0.4, series: [210,211,209,212,213,212,214,213,215,216,215,217] },
      { name: 'Microsoft', sector: '클라우드', change: 1.1, series: [440,442,438,445,448,446,450,452,451,455,458,462] },
      { name: 'Tesla', sector: '전기차', change: -1.6, series: [250,248,252,245,243,240,238,235,237,232,230,228] },
    ],
  },
};

/* =============================================================================
   [store] 상태 저장소 — localStorage 래퍼
   ============================================================================= */
const KEY = 'econ-daily-v1';
const Store = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { this.data = null; }
    if (!this.data) this.data = this._default();
    return this.data;
  },
  _default() {
    return {
      streak: 1,
      lastActive: null,          // 'YYYY-MM-DD'
      progressDate: null,        // 오늘 진행 기록 날짜
      doneNews: [],              // 오늘 학습완료한 뉴스 id
      termSavedToday: false,     // 오늘 용어 저장 여부(진행률용)
      notes: [],                 // 아카이브: {id, kind, title, tags[], summary, date, memo}
      settings: { audioAutoplay: false, reduceMotion: false },
    };
  },
  save() { localStorage.setItem(KEY, JSON.stringify(this.data)); },
};

/* =============================================================================
   [util] 공통 유틸
   ============================================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

function iso(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function fmtDate(d) {
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}
function daysBetween(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.hidden = true, 250); }, 2200);
}

/* =============================================================================
   진행률 / 스트릭 (localStorage로 실제 동작)
   ============================================================================= */
function initStreak() {
  const s = Store.data;
  const today = iso(new Date());          // 실제 오늘(스트릭은 현실 날짜 기준)
  if (s.lastActive === today) {
    // 같은 날 재방문 — 변화 없음
  } else {
    const yesterday = iso(new Date(Date.now() - 86400000));
    s.streak = (s.lastActive === yesterday) ? s.streak + 1 : 1;
    s.lastActive = today;
  }
  Store.save();
}

function resetDailyProgressIfNeeded() {
  const s = Store.data;
  const key = iso(APP_TODAY);
  if (s.progressDate !== key) {
    s.progressDate = key;
    s.doneNews = [];
    s.termSavedToday = false;
    Store.save();
  }
}

function renderProgress() {
  const s = Store.data;
  const total = DATA.news.length + 1;              // 뉴스 3 + 용어 1
  const done = s.doneNews.length + (s.termSavedToday ? 1 : 0);

  // 진행 점
  const row = $('#hero-progress');
  row.innerHTML = '';
  for (let i = 0; i < total; i++) {
    row.appendChild(el('span', 'progress-dot' + (i < done ? ' done' : '')));
  }
  $('#hero-count').textContent = `${done} / ${total}`;
  $('#hero-streak').textContent = `${s.streak}일째`;
}

/* =============================================================================
   ① 오늘의 뉴스
   ============================================================================= */
function difficultyDots(level) {
  const label = { 1: '쉬움', 2: '보통', 3: '어려움' }[level] || '';
  let dots = '';
  for (let i = 1; i <= 3; i++) dots += `<i class="${i <= level ? 'on' : ''}"></i>`;
  return `<span class="level-dots">${dots}<span class="label">${label}</span></span>`;
}

function renderNews() {
  const list = $('#news-list');
  list.innerHTML = '';
  $('#news-count-label').textContent = `${DATA.news.length}개`;

  DATA.news.forEach((n, idx) => {
    const done = Store.data.doneNews.includes(n.id);
    const card = el('article', 'card news-item');
    card.dataset.id = n.id;
    card.innerHTML = `
      <div class="news-head">
        <span class="badge">${escapeHtml(n.category)}</span>
        ${difficultyDots(n.difficulty)}
        ${done ? '<span class="done-flag">학습완료</span>' : ''}
      </div>
      <h3 class="editorial-title news-title">${escapeHtml(n.title)}</h3>

      <div class="news-block">
        <div class="news-block-label">30초 요약</div>
        <p class="body">${escapeHtml(n.summary)}</p>
      </div>

      <div class="news-detail" ${idx === 0 ? '' : 'hidden'}>
        <div class="news-block">
          <div class="news-block-label">왜 중요한가</div>
          <p class="body">${escapeHtml(n.why)}</p>
        </div>
        <div class="news-block">
          <div class="news-block-label">어떤 영향이 생기나</div>
          <ul class="impact-list">${n.impacts.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
        </div>
        <div class="tag-row">${n.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>

      <button class="news-toggle" data-act="toggle">
        <span class="toggle-text">${idx === 0 ? '접기' : '자세히 보기'}</span>
        <svg class="ico-16 chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      <div class="news-actions">
        <button class="btn-outline audio-btn" data-act="audio">
          <svg class="ico-16 ic-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="ico-16 ic-stop" viewBox="0 0 24 24" fill="currentColor" hidden><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
          <span class="audio-text">오디오로 듣기</span>
        </button>
        <button class="btn-check ${done ? 'checked' : ''}" data-act="done">
          <svg class="ico-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          <span>${done ? '완료됨' : '학습완료'}</span>
        </button>
        <button class="btn-icon-ghost" data-act="save" title="노트에 저장">
          <svg class="ico-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    `;
    if (idx === 0) card.querySelector('.chev').style.transform = 'rotate(180deg)';
    list.appendChild(card);
  });
}

/* 뉴스 카드 이벤트 (위임) */
function bindNews() {
  $('#news-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const card = e.target.closest('.news-item');
    const news = DATA.news.find(n => n.id === card.dataset.id);
    const act = btn.dataset.act;

    if (act === 'toggle') {
      const detail = card.querySelector('.news-detail');
      const open = detail.hidden;
      detail.hidden = !open;
      card.querySelector('.toggle-text').textContent = open ? '접기' : '자세히 보기';
      card.querySelector('.chev').style.transform = open ? 'rotate(180deg)' : '';
    }
    else if (act === 'audio') {
      toggleAudio(card, news);
    }
    else if (act === 'done') {
      markNewsDone(news, btn);
    }
    else if (act === 'save') {
      saveNote({ id: 'news-' + news.id, kind: 'news', title: news.title,
        tags: news.tags, summary: news.summary });
    }
  });
}

function markNewsDone(news, btn) {
  const s = Store.data;
  if (s.doneNews.includes(news.id)) { toast('이미 학습완료한 뉴스예요'); return; }
  s.doneNews.push(news.id);
  Store.save();
  // 학습완료 시 노트에도 자동 아카이브
  saveNote({ id: 'news-' + news.id, kind: 'news', title: news.title,
    tags: news.tags, summary: news.summary }, true);
  renderNews();
  renderProgress();
  toast('학습완료! 오늘의 진행률에 반영됐어요');
}

/* ---- 오디오: Web Speech API (한국어 TTS) ---- */
let speaking = null; // 현재 재생 중인 card
function toggleAudio(card, news) {
  const synth = window.speechSynthesis;
  if (!synth) { toast('이 브라우저는 음성 재생을 지원하지 않아요'); return; }

  // 재생 중인 카드를 다시 누르면 정지
  if (speaking === card) { synth.cancel(); return; }
  synth.cancel(); // 다른 카드 재생 중이면 중단

  const text = `${news.title}. 30초 요약. ${news.summary} 왜 중요한가. ${news.why} 어떤 영향이 생기나. ${news.impacts.join('. ')}`;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = 1.02;
  u.onstart = () => { speaking = card; setAudioUI(card, true); };
  u.onend = () => { if (speaking === card) speaking = null; setAudioUI(card, false); };
  u.onerror = () => { speaking = null; setAudioUI(card, false); };
  synth.speak(u);
}
function setAudioUI(card, playing) {
  card.querySelector('.ic-play').hidden = playing;
  card.querySelector('.ic-stop').hidden = !playing;
  card.querySelector('.audio-text').textContent = playing ? '재생 중지' : '오디오로 듣기';
  card.querySelector('.audio-btn').classList.toggle('playing', playing);
}

/* =============================================================================
   ② 오늘의 용어
   ============================================================================= */
function renderTerm() {
  const t = DATA.term;
  const saved = Store.data.notes.some(n => n.id === 'term-' + t.id);
  $('#term-card').innerHTML = `
    <span class="badge original">오늘의 단어</span>
    <div class="term-word">${escapeHtml(t.word)}</div>
    <div class="term-step">
      <div class="term-step-label">한 줄 정의</div>
      <p class="body">${escapeHtml(t.definition)}</p>
    </div>
    <div class="term-step">
      <div class="term-step-label">쉬운 예시</div>
      <p class="body">${escapeHtml(t.example)}</p>
    </div>
    <div class="term-step">
      <div class="term-step-label">오늘 뉴스에서는</div>
      <p class="body">${escapeHtml(t.inNews)}</p>
    </div>
    <button class="btn-primary term-save ${saved ? 'saved' : ''}" data-act="save-term" ${saved ? 'disabled' : ''}>
      ${saved ? '내 사전에 저장됨' : '내 사전에 저장하기'}
    </button>
  `;
}
function bindTerm() {
  $('#term-card').addEventListener('click', e => {
    if (!e.target.closest('[data-act="save-term"]')) return;
    const t = DATA.term;
    saveNote({ id: 'term-' + t.id, kind: 'term', title: t.word,
      tags: [t.tag], summary: t.definition });
    Store.data.termSavedToday = true;
    Store.save();
    renderTerm();
    renderProgress();
    toast('내 사전에 저장했어요');
  });
}

/* =============================================================================
   ③ 경제 캘린더 — D-day 계산·정렬
   ============================================================================= */
function renderCalendar() {
  const list = $('#calendar-list');
  list.innerHTML = '';

  const events = DATA.events
    .map(e => ({ ...e, dday: daysBetween(APP_TODAY, new Date(e.date + 'T00:00:00')) }))
    .filter(e => e.dday >= 0)          // 지난 일정 제외
    .sort((a, b) => a.dday - b.dday);

  if (!events.length) { list.innerHTML = '<p class="caption">예정된 일정이 없어요</p>'; return; }

  events.forEach(ev => {
    const ddayText = ev.dday === 0 ? 'D-DAY' : `D-${ev.dday}`;
    const [, m, d] = ev.date.split('-');
    const item = el('div', 'cal-item');
    item.innerHTML = `
      <div class="cal-dday ${ev.dday <= 3 ? 'soon' : ''}">${ddayText}</div>
      <div class="cal-info">
        <div class="cal-name">${escapeHtml(ev.name)} <span class="cal-type">${escapeHtml(ev.type)}</span></div>
        <div class="cal-date">${Number(m)}월 ${Number(d)}일 · <button class="cal-more" data-act="cal-detail">사전 설명 보기</button></div>
        <p class="cal-desc body" hidden>${escapeHtml(ev.desc)}</p>
      </div>
    `;
    list.appendChild(item);
  });
}
function bindCalendar() {
  $('#calendar-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-act="cal-detail"]');
    if (!btn) return;
    const desc = btn.closest('.cal-info').querySelector('.cal-desc');
    desc.hidden = !desc.hidden;
    btn.textContent = desc.hidden ? '사전 설명 보기' : '접기';
  });
}

/* =============================================================================
   ④ 나만의 노트 — 아카이브 · 검색 · 태그 · 메모 · AI 질문
   ============================================================================= */
function saveNote(note, silent = false) {
  const s = Store.data;
  if (s.notes.some(n => n.id === note.id)) {
    if (!silent) toast('이미 노트에 저장되어 있어요');
    return;
  }
  s.notes.unshift({ ...note, date: iso(APP_TODAY), memo: '' });
  Store.save();
  if (!silent) toast('노트에 저장했어요');
  renderNoteTags();
  renderNoteArchive();
}

let noteFilter = { text: '', tag: null };

function renderNoteTags() {
  const box = $('#note-tags');
  const tags = [...new Set(Store.data.notes.flatMap(n => n.tags))];
  box.innerHTML = `<button class="chip ${!noteFilter.tag ? 'active' : ''}" data-tag="">전체</button>` +
    tags.map(t => `<button class="chip ${noteFilter.tag === t ? 'active' : ''}" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
}

function renderNoteArchive() {
  const box = $('#note-archive');
  let notes = Store.data.notes;

  if (noteFilter.tag) notes = notes.filter(n => n.tags.includes(noteFilter.tag));
  if (noteFilter.text) {
    const q = noteFilter.text.toLowerCase();
    notes = notes.filter(n =>
      (n.title + n.summary + n.tags.join(' ')).toLowerCase().includes(q));
  }

  $('#note-archive-head').textContent = `저장한 학습 내용 (${Store.data.notes.length})`;

  if (!Store.data.notes.length) {
    box.innerHTML = `<div class="empty-state small">
      <p class="empty-desc">아직 저장한 내용이 없어요.<br/>뉴스·용어를 학습하고 저장해 보세요.</p></div>`;
    return;
  }
  if (!notes.length) {
    box.innerHTML = `<div class="empty-state small"><p class="empty-desc">조건에 맞는 노트가 없어요.</p></div>`;
    return;
  }

  box.innerHTML = notes.map(n => `
    <div class="note-item" data-id="${escapeHtml(n.id)}">
      <div class="note-item-head">
        <span class="badge ${n.kind === 'term' ? 'original' : ''}">${n.kind === 'term' ? '용어' : '뉴스'}</span>
        <span class="note-date">${n.date}</span>
        <button class="note-del" data-act="del" title="삭제">
          <svg class="ico-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="note-item-title">${escapeHtml(n.title)}</div>
      <p class="note-item-sum caption">${escapeHtml(n.summary)}</p>
      <div class="tag-row">${n.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <input class="note-memo" data-act="memo" placeholder="메모 추가하기…" value="${escapeHtml(n.memo || '')}" />
    </div>
  `).join('');
}

function bindNote() {
  // 검색
  $('#note-search-input').addEventListener('input', e => {
    noteFilter.text = e.target.value.trim();
    renderNoteArchive();
  });
  // 태그 필터
  $('#note-tags').addEventListener('click', e => {
    const chip = e.target.closest('[data-tag]');
    if (!chip) return;
    noteFilter.tag = chip.dataset.tag || null;
    renderNoteTags();
    renderNoteArchive();
  });
  // 아카이브: 삭제 / 메모
  $('#note-archive').addEventListener('click', e => {
    const del = e.target.closest('[data-act="del"]');
    if (!del) return;
    const id = del.closest('.note-item').dataset.id;
    Store.data.notes = Store.data.notes.filter(n => n.id !== id);
    Store.save();
    renderNoteTags(); renderNoteArchive();
    toast('노트를 삭제했어요');
  });
  $('#note-archive').addEventListener('change', e => {
    const memo = e.target.closest('[data-act="memo"]');
    if (!memo) return;
    const id = memo.closest('.note-item').dataset.id;
    const note = Store.data.notes.find(n => n.id === id);
    if (note) { note.memo = memo.value; Store.save(); toast('메모를 저장했어요'); }
  });
  // AI 질문
  $('#ai-send').addEventListener('click', runAiQuery);
  $('#ai-input').addEventListener('keydown', e => { if (e.key === 'Enter') runAiQuery(); });
}

/* AI 질문 — 저장된 노트를 키워드로 검색해 정리해 주는 간단 로직 */
function runAiQuery() {
  const q = $('#ai-input').value.trim();
  const answer = $('#ai-answer');
  if (!q) { toast('질문을 입력해 주세요'); return; }

  const notes = Store.data.notes;
  if (!notes.length) {
    show(answer, `아직 저장된 노트가 없어요. 먼저 오늘의 뉴스·용어를 학습하고 저장하면,
      제가 그 내용을 바탕으로 정리해 드릴게요.`);
    return;
  }

  // 질문에서 키워드 추출 (노트 태그/제목과 매칭)
  const vocab = [...new Set(notes.flatMap(n => [...n.tags.map(t => t.replace('#','')), ...n.title.split(/\s+/)]))]
    .filter(w => w.length >= 2);
  const hits = vocab.filter(w => q.includes(w));

  let matched = notes;
  if (hits.length) {
    matched = notes.filter(n =>
      hits.some(w => (n.title + n.summary + n.tags.join(' ')).includes(w)));
  }

  if (!matched.length) {
    show(answer, `“${escapeHtml(q)}”와 관련된 저장 노트를 찾지 못했어요.
      다른 키워드(예: 금리, 반도체, 환율)로 물어봐 주세요.`);
    return;
  }

  const kw = hits.length ? `‘${hits.join(', ')}’ 관련 ` : '';
  const bullets = matched.slice(0, 5).map(n =>
    `<li><b>${escapeHtml(n.title)}</b><br/><span class="caption">${escapeHtml(n.summary)}</span></li>`).join('');
  show(answer, `저장하신 노트 중 ${kw}내용 <b>${matched.length}건</b>을 정리했어요.
    <ul class="ai-list">${bullets}</ul>
    <span class="caption">※ 학습 이력 기반 요약입니다. 투자 판단의 근거로 삼지 마세요.</span>`);
}
function show(elm, html) { elm.hidden = false; elm.innerHTML = html; }

/* =============================================================================
   ⑤ 업종·종목 — 국내/해외 · 스파크라인 · 등락
   ============================================================================= */
let curMarket = 'domestic';

function sparkline(series, up) {
  const w = 120, h = 40, pad = 3;
  const min = Math.min(...series), max = Math.max(...series);
  const span = (max - min) || 1;
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const color = up ? 'var(--up)' : 'var(--down)';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function renderStocks() {
  const box = $('#stocks-list');
  const items = DATA.stocks[curMarket];
  box.innerHTML = `<div class="stock-grid">` + items.map(st => {
    const up = st.change >= 0;
    return `
      <div class="stock-card">
        <div class="stock-name">${escapeHtml(st.name)}</div>
        <div class="stock-sector">${escapeHtml(st.sector)}</div>
        ${sparkline(st.series, up)}
        <div class="stock-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(st.change).toFixed(1)}%</div>
      </div>`;
  }).join('') + `</div>`;
}
function bindStocks() {
  $('#stocks-tabs').addEventListener('click', e => {
    const chip = e.target.closest('[data-market]');
    if (!chip) return;
    curMarket = chip.dataset.market;
    $$('#stocks-tabs .chip').forEach(c => c.classList.toggle('active', c === chip));
    renderStocks();
  });
}

/* =============================================================================
   설정
   ============================================================================= */
function renderSettings() {
  const s = Store.data;
  $('#stat-grid').innerHTML = `
    <div class="stat"><div class="stat-num">${s.streak}</div><div class="stat-label">연속 학습일</div></div>
    <div class="stat"><div class="stat-num">${s.notes.length}</div><div class="stat-label">저장한 노트</div></div>
    <div class="stat"><div class="stat-num">${s.notes.filter(n=>n.kind==='term').length}</div><div class="stat-label">내 사전 용어</div></div>
  `;
  $('#set-audio').checked = s.settings.audioAutoplay;
  $('#set-motion').checked = s.settings.reduceMotion;
  document.body.classList.toggle('reduce-motion', s.settings.reduceMotion);
}
function bindSettings() {
  $('#set-audio').addEventListener('change', e => {
    Store.data.settings.audioAutoplay = e.target.checked; Store.save();
  });
  $('#set-motion').addEventListener('change', e => {
    Store.data.settings.reduceMotion = e.target.checked; Store.save();
    document.body.classList.toggle('reduce-motion', e.target.checked);
  });
  $('#reset-data').addEventListener('click', () => {
    if (!confirm('학습 데이터를 모두 초기화할까요? (스트릭·노트·진행률)')) return;
    localStorage.removeItem(KEY);
    Store.load();
    initStreak(); resetDailyProgressIfNeeded();
    renderAll();
    toast('초기화했어요');
  });
}

/* =============================================================================
   뷰 전환 (하단 탭)
   ============================================================================= */
const VIEW_TITLE = {
  'view-today': '오늘의 경제', 'view-map': '경제지도',
  'view-note': '나만의 노트', 'view-stocks': '업종·종목', 'view-settings': '설정',
};
function switchView(viewId) {
  if (!document.getElementById(viewId)) viewId = 'view-today';
  $$('.view').forEach(v => v.hidden = (v.id !== viewId));
  $$('#section-bottomnav .nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === viewId));
  $('#appbar-title').textContent = VIEW_TITLE[viewId] || '오늘의 경제';
  $('#page-scroll').scrollTop = 0;
  window.scrollTo(0, 0);
  if (window.speechSynthesis) window.speechSynthesis.cancel(); // 뷰 이동 시 오디오 정지
  const hash = viewId.replace('view-', '');
  if (location.hash.slice(1) !== hash) history.replaceState(null, '', '#' + hash);
}
function bindNav() {
  $('#section-bottomnav').addEventListener('click', e => {
    const tab = e.target.closest('[data-view]');
    if (tab) switchView(tab.dataset.view);
  });
  // 본문 내 링크(내 사전 등)
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); switchView('view-' + nav.dataset.nav); }
  });
}

/* =============================================================================
   초기화
   ============================================================================= */
function renderAll() {
  $('#appbar-date').textContent = fmtDate(APP_TODAY);
  renderProgress();
  renderNews();
  renderTerm();
  renderCalendar();
  renderNoteTags();
  renderNoteArchive();
  renderStocks();
  renderSettings();
}

function init() {
  Store.load();
  initStreak();
  resetDailyProgressIfNeeded();

  // 이벤트 바인딩(한 번)
  bindNews(); bindTerm(); bindCalendar(); bindNote(); bindStocks(); bindSettings(); bindNav();

  renderAll();

  // URL 해시로 뷰 딥링크 (#note, #stocks 등)
  const hash = location.hash.slice(1);
  if (hash) switchView('view-' + hash);
}

document.addEventListener('DOMContentLoaded', init);
