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

/* ---------- [설정] 오늘 날짜 — 실제 오늘 날짜를 그대로 사용 ---------- */
const APP_TODAY = new Date();

/* =============================================================================
   [data] 목업 데이터 — 실제 서비스에선 API로 대체되는 부분
   뉴스·용어는 날짜(연중 일수)를 기준으로 5세트를 순환 노출해 매일 다른 내용을 보여준다.
   ============================================================================= */
const NEWS_POOLS = [
  // 세트 0 — 통화정책
  [
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
  // 세트 1 — 고용/노동시장
  [
    {
      id: 'n1b', category: '고용', difficulty: 1,
      title: '미국 6월 비농업고용 20만 명 증가, 실업률 3.9%',
      summary: '미국의 6월 비농업 부문 신규 고용이 20만 명 늘며 시장 예상을 웃돌았고, 실업률은 3.9%를 기록했습니다.',
      why: '고용지표는 소비 여력과 경기 온도를 가장 빠르게 보여주는 신호예요. 고용이 탄탄하면 소비가 살아나지만, 연준의 금리 인하 시점은 늦춰질 수 있어요.',
      impacts: [
        '고용 호조가 이어지면 금리 인하 기대가 뒤로 밀릴 가능성',
        '소비 관련 업종(유통·서비스) 심리에 긍정적 영향',
        '달러 강세로 원/달러 환율 상승 압력'
      ],
      tags: ['#고용', '#연준', '#환율'],
    },
    {
      id: 'n2b', category: '국내경제', difficulty: 2,
      title: '국내 취업자 수 3개월 연속 증가, 청년 고용은 둔화',
      summary: '통계청 발표에 따르면 지난달 취업자 수가 전년 대비 늘며 3개월 연속 증가세를 이어갔지만, 20대 취업자는 감소했습니다.',
      why: '전체 고용 숫자가 좋아 보여도 세대별 온도차가 크면 정책 대응이 달라져야 해요. 청년 고용 둔화는 소비·주거 수요에도 영향을 줍니다.',
      impacts: [
        '제조업·돌봄 서비스 중심 고용 개선 지속 가능성',
        '청년층 대상 고용 지원 정책 확대 논의',
        '1인 가구 소비 패턴에 미치는 영향 주시'
      ],
      tags: ['#고용', '#소비', '#정책'],
    },
    {
      id: 'n3b', category: '정책', difficulty: 2,
      title: '내년도 최저임금 인상률, 노사 협상 본격화',
      summary: '내년도 최저임금을 정하는 노사 협상이 시작되며, 인상률을 둘러싼 노동계와 경영계의 입장차가 확인됐습니다.',
      why: '최저임금은 저임금 근로자의 소득뿐 아니라 자영업자의 인건비 부담, 나아가 물가에도 영향을 미치는 민감한 변수예요.',
      impacts: [
        '소상공인·자영업 인건비 부담 변화 가능성',
        '저임금 근로자 실질소득에 직접 영향',
        '인상폭에 따라 물가에도 시차를 두고 반영'
      ],
      tags: ['#최저임금', '#고용', '#물가'],
    },
  ],
  // 세트 2 — 환율/무역
  [
    {
      id: 'n1c', category: '외환', difficulty: 2,
      title: '원/달러 환율 1,350원대 등락, 수출기업 희비 교차',
      summary: '원/달러 환율이 1,350원대에서 등락을 거듭하며 업종별로 수출기업의 실적 전망이 엇갈리고 있습니다.',
      why: '환율은 수출기업의 가격 경쟁력과 수입 물가를 동시에 움직이는 변수예요. 원화 약세는 수출엔 유리하지만 수입 물가엔 부담이 됩니다.',
      impacts: [
        '자동차·반도체 등 수출 대기업 실적에 우호적 환경',
        '원자재·에너지 수입 물가 상승 부담 확대',
        '환헤지 여부에 따라 기업별 손익 차이 발생'
      ],
      tags: ['#환율', '#수출', '#반도체'],
    },
    {
      id: 'n2c', category: '글로벌', difficulty: 3,
      title: '미국, 대중 반도체 수출 규제 추가 강화 검토',
      summary: '미국 정부가 첨단 반도체·장비의 중국 수출 통제를 한층 강화하는 방안을 검토 중인 것으로 알려졌습니다.',
      why: '글로벌 반도체 공급망은 미·중 기술 패권 경쟁의 최전선이에요. 규제 강도에 따라 국내 기업의 대중 매출과 공급망 전략이 크게 흔들릴 수 있어요.',
      impacts: [
        '국내 반도체 기업의 중국向 장비·소재 수출 차질 우려',
        '공급망 다변화 압력으로 신규 투자처 모색 가속',
        '중국의 자체 반도체 육성 속도에 미칠 영향 주목'
      ],
      tags: ['#반도체', '#미중갈등', '#수출'],
    },
    {
      id: 'n3c', category: '무역', difficulty: 1,
      title: '6월 무역수지 흑자 전환, 반도체 수출이 견인',
      summary: '6월 무역수지가 흑자로 전환됐으며, 반도체 수출 호조가 실적 개선을 이끌었습니다.',
      why: '무역수지는 한 나라가 물건을 팔아 번 돈과 사들이는 데 쓴 돈의 차이예요. 수출로 먹고사는 한국 경제엔 특히 중요한 성적표죠.',
      impacts: [
        '수출 중심 경기 회복 흐름에 긍정적 신호',
        '원화 가치 및 외환보유고 안정에 기여',
        '반도체 의존도가 높은 무역구조의 리스크도 함께 부각'
      ],
      tags: ['#무역수지', '#반도체', '#수출'],
    },
  ],
  // 세트 3 — 부동산/금융
  [
    {
      id: 'n1d', category: '부동산', difficulty: 1,
      title: '서울 아파트값 3주 연속 상승, 거래량은 오히려 감소',
      summary: '서울 아파트 매매가격이 3주 연속 올랐지만, 실제 거래량은 전월 대비 줄어든 것으로 나타났습니다.',
      why: '가격은 오르는데 거래는 줄면 매도자와 매수자의 기대 가격 차이가 크다는 뜻이에요. 시장 방향을 가늠할 때 가격과 거래량을 함께 봐야 하는 이유죠.',
      impacts: [
        '일부 인기 지역 중심의 국지적 상승 가능성',
        '대출 규제·금리 수준에 따라 거래 회복 속도 좌우',
        '전세가율 변화가 매매 심리에 미칠 영향 주시'
      ],
      tags: ['#부동산', '#금리', '#대출'],
    },
    {
      id: 'n2d', category: '금융', difficulty: 2,
      title: '시중은행, 주택담보대출 금리 소폭 인상',
      summary: '주요 시중은행들이 자금 조달 비용 상승을 반영해 주택담보대출 금리를 소폭 올렸습니다.',
      why: '대출 금리는 기준금리뿐 아니라 은행의 자금 조달 사정에도 영향을 받아요. 실제 이용자가 체감하는 이자 부담은 기준금리와 다르게 움직일 수 있어요.',
      impacts: [
        '신규 대출자의 월 상환 부담 증가',
        '변동금리 이용자의 이자 부담 확대 우려',
        '주택 매수 심리에 미치는 하방 압력'
      ],
      tags: ['#대출', '#금리', '#부동산'],
    },
    {
      id: 'n3d', category: '정책', difficulty: 2,
      title: '정부, 전세사기 피해자 지원 대책 추가 발표',
      summary: '정부가 전세사기 피해자를 위한 주거 지원과 금융 구제 방안을 담은 추가 대책을 내놓았습니다.',
      why: '전세제도는 한국 특유의 주거 방식으로, 제도의 허점이 드러나면 세입자 보호를 위한 정책 대응이 뒤따르게 돼요.',
      impacts: [
        '피해자 대상 저리 대환대출·거주지원 확대',
        '임대차 시장 신뢰 회복 여부 주목',
        '전세 제도 개편 논의로 이어질 가능성'
      ],
      tags: ['#부동산', '#정책', '#전세'],
    },
  ],
  // 세트 4 — 증시/기업실적
  [
    {
      id: 'n1e', category: '증시', difficulty: 1,
      title: '코스피 2,700선 등락, 외국인 순매수로 전환',
      summary: '코스피 지수가 2,700선 부근에서 등락을 거듭한 가운데, 외국인 투자자가 순매수로 돌아섰습니다.',
      why: '외국인 수급은 국내 증시의 방향을 좌우하는 큰 축 중 하나예요. 매수·매도 전환은 글로벌 자금 흐름의 변화를 보여주는 신호이기도 해요.',
      impacts: [
        '대형주 중심의 지수 상승 압력 가능성',
        '원/달러 환율 안정에도 긍정적 영향',
        '개인 투자자 심리 개선으로 거래대금 증가 기대'
      ],
      tags: ['#증시', '#외국인수급', '#환율'],
    },
    {
      id: 'n2e', category: '기업', difficulty: 2,
      title: '국내 배터리 3사, 2분기 실적 부진 전망',
      summary: '전기차 수요 둔화 여파로 국내 주요 배터리 3사의 2분기 실적이 시장 기대치를 밑돌 것으로 전망됩니다.',
      why: '배터리 산업은 전기차 판매량에 직접 연동돼요. 수요가 주춤하면 공장 가동률과 수익성이 함께 흔들릴 수 있어요.',
      impacts: [
        '관련 부품·소재 협력사 실적에도 연쇄 영향',
        '업체별 증설 계획 재조정 가능성',
        '전기차 캐즘(수요 정체) 장기화 여부가 관건'
      ],
      tags: ['#2차전지', '#전기차', '#실적'],
    },
    {
      id: 'n3e', category: '글로벌', difficulty: 2,
      title: '미국 빅테크 실적 발표 앞두고 증시 관망세',
      summary: '주요 빅테크 기업들의 실적 발표를 앞두고 뉴욕 증시가 방향성 없는 관망 장세를 이어가고 있습니다.',
      why: '빅테크 실적은 AI 투자 사이클이 실제 이익으로 이어지는지 확인하는 시험대예요. 결과에 따라 글로벌 증시 전반의 분위기가 갈릴 수 있어요.',
      impacts: [
        'AI 관련주 전반의 변동성 확대 가능성',
        '국내 반도체·부품주 동반 등락 요인',
        '실적 서프라이즈 여부에 따라 단기 수급 급변'
      ],
      tags: ['#미국증시', '#AI', '#실적'],
    },
  ],
];

const TERM_POOL = [
  {
    id: 't-qt', word: '양적긴축 (QT)', tag: '#금리',
    definition: '중앙은행이 사들였던 채권을 다시 시장에 팔아, 시중에 풀린 돈을 거둬들이는 정책이에요.',
    example: '양적완화가 수도꼭지로 욕조에 물을 채우는 것이라면, 양적긴축은 마개를 열어 물을 빼는 것과 같아요.',
    inNews: '오늘 미국 CPI 뉴스에서 “연준의 긴축 기조”가 언급됐죠. 시중 유동성이 줄면 주식·채권에 부담이 될 수 있어요.',
  },
  {
    id: 't-phillips', word: '필립스 곡선', tag: '#고용',
    definition: '실업률이 낮아지면 물가상승률이 높아지고, 반대로 실업률이 높아지면 물가상승률이 낮아지는 경향을 보여주는 그래프예요.',
    example: '사람을 구하기 힘든 만큼(실업률↓) 회사들이 임금을 더 주고, 그 비용이 물가에 반영되는 것과 비슷해요.',
    inNews: '오늘 고용지표 뉴스처럼 고용이 좋아질수록 물가·금리 정책에 대한 셈법이 복잡해지는 이유가 바로 이 관계 때문이에요.',
  },
  {
    id: 't-trade-balance', word: '무역수지', tag: '#무역',
    definition: '일정 기간 동안 한 나라가 수출로 번 돈에서 수입에 쓴 돈을 뺀 값이에요. 플러스면 흑자, 마이너스면 적자라고 해요.',
    example: '가게 매출에서 재료비를 뺀 것처럼, 나라 전체의 수출액에서 수입액을 뺀 것이 무역수지예요.',
    inNews: '오늘 뉴스처럼 반도체 수출이 늘면 무역수지가 흑자로 돌아서는 경우가 많아요. 특정 산업 의존도가 높다는 뜻이기도 해요.',
  },
  {
    id: 't-dsr', word: 'DSR (총부채원리금상환비율)', tag: '#대출',
    definition: '내가 버는 돈(연소득) 대비 1년 동안 갚아야 하는 모든 대출의 원금과 이자가 차지하는 비율이에요.',
    example: '월급이 300만 원인데 매달 대출 원리금으로 120만 원을 낸다면, DSR은 대략 40% 수준이라고 볼 수 있어요.',
    inNews: '오늘 대출 금리 인상 뉴스처럼 금리가 오르면 같은 대출이라도 DSR이 높아져 대출 한도가 줄어들 수 있어요.',
  },
  {
    id: 't-earnings-surprise', word: '어닝 서프라이즈', tag: '#실적',
    definition: '기업의 실제 발표 실적이 시장의 예상치를 크게 웃도는 것을 말해요. 반대로 크게 밑돌면 어닝 쇼크라고 해요.',
    example: '시험 전 예상 점수가 80점이었는데 실제로 95점을 받으면 깜짝 소식이 되는 것과 비슷해요.',
    inNews: '오늘 뉴스처럼 빅테크 실적 발표를 앞두고 시장이 긴장하는 이유는, 어닝 서프라이즈냐 쇼크냐에 따라 주가 흐름이 완전히 달라지기 때문이에요.',
  },
];

const _todayPoolIdx = dayOfYear(APP_TODAY) % NEWS_POOLS.length;

const DATA = {
  // ① 뉴스 (연중 일수 기준으로 매일 다른 세트 노출)
  news: NEWS_POOLS[_todayPoolIdx],

  // ② 오늘의 용어 (뉴스와 같은 세트 인덱스로 순환)
  term: TERM_POOL[_todayPoolIdx],

  // ③ 경제 캘린더 — 오늘 기준 상대 일수(offset)로 정의해 항상 최신 일정 유지
  events: [
    { id: 'e1', name: '삼성전자 2분기 잠정실적 발표', offset: 6, type: '실적',
      desc: '반도체 업황 회복 여부를 가늠할 첫 지표. 시장 기대치와의 차이가 주가 방향을 좌우합니다.' },
    { id: 'e2', name: '미국 6월 소비자물가(CPI)', offset: 8, type: '지표',
      desc: '연준의 금리 경로에 가장 큰 영향을 주는 지표. 예상보다 높으면 긴축 우려가 커집니다.' },
    { id: 'e3', name: '한국은행 7월 금융통화위원회', offset: 14, type: '통화정책',
      desc: '기준금리 결정 회의. 동결/인하 여부와 총재 발언(포워드 가이던스)이 핵심입니다.' },
    { id: 'e4', name: '미국 FOMC 정례회의', offset: 27, type: '통화정책',
      desc: '미 연준의 금리 결정. 점도표와 파월 의장 기자회견이 글로벌 증시를 흔듭니다.' },
  ],

  // ⑤ 업종·종목 (실시간 시세 연동 · 최초 표시용 참고값 + 과거 흐름 스파크라인)
  // status: 'idle'(최초, 아직 미조회) · 'loading' · 'live'(실시간 조회 성공) · 'error'(조회 실패, 참고값 유지)
  stocks: {
    domestic: [
      { name: '삼성전자', sector: '반도체', symbol: '005930.KS', price: null, change: 1.2, series: [69,70,68,71,72,71,73,74,73,75,76,77], status: 'idle' },
      { name: 'SK하이닉스', sector: '반도체', symbol: '000660.KS', price: null, change: 3.4, series: [180,183,181,188,190,195,193,200,205,210,208,215], status: 'idle' },
      { name: 'LG에너지솔루션', sector: '2차전지', symbol: '373220.KS', price: null, change: -0.8, series: [420,418,415,410,412,408,405,400,402,398,395,392], status: 'idle' },
      { name: 'KB금융', sector: '금융', symbol: '105560.KS', price: null, change: 0.5, series: [72,72,73,73,74,74,73,74,75,75,76,76], status: 'idle' },
      { name: '현대차', sector: '자동차', symbol: '005380.KS', price: null, change: -0.3, series: [245,244,246,243,242,244,241,240,242,239,240,239], status: 'idle' },
    ],
    global: [
      { name: 'NVIDIA', sector: 'AI 반도체', symbol: 'NVDA', price: null, change: 2.7, series: [118,120,119,125,128,130,127,135,140,138,145,150], status: 'idle' },
      { name: 'Apple', sector: 'IT', symbol: 'AAPL', price: null, change: 0.4, series: [210,211,209,212,213,212,214,213,215,216,215,217], status: 'idle' },
      { name: 'Microsoft', sector: '클라우드', symbol: 'MSFT', price: null, change: 1.1, series: [440,442,438,445,448,446,450,452,451,455,458,462], status: 'idle' },
      { name: 'Tesla', sector: '전기차', symbol: 'TSLA', price: null, change: -1.6, series: [250,248,252,245,243,240,238,235,237,232,230,228], status: 'idle' },
    ],
  },
};

/* =============================================================================
   [live] 실시간 시세 연동 — Yahoo Finance 비공식 엔드포인트를 CORS 프록시로 호출
   (별도 백엔드/키 없이 정적 페이지에서 동작 · 프록시 장애 시 마지막 참고값 유지)
   ============================================================================= */
const STOCKS_REFRESH_MS = 60 * 1000;

const CORS_PROXIES = [
  target => `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
  target => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
];

const PROXY_TIMEOUT_MS = 8000;

/* 종목 전체를 한 번의 요청으로 조회 (심볼별 개별 호출 대비 훨씬 빠름) */
async function fetchAllQuotesRaw(symbols) {
  const target = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=1mo&interval=1d`;
  let lastErr;
  for (const wrap of CORS_PROXIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const res = await fetch(wrap(target), { cache: 'no-store', signal: controller.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json || typeof json !== 'object') throw new Error('빈 응답');
      return json;
    } catch (e) { lastErr = e; }
    finally { clearTimeout(timer); }
  }
  throw lastErr || new Error('시세 조회 실패');
}

let stocksFetching = false;
async function refreshStocks() {
  if (stocksFetching) return;
  stocksFetching = true;
  setStocksLiveStatus('loading');

  const allStocks = [...DATA.stocks.domestic, ...DATA.stocks.global];
  allStocks.forEach(st => { st.status = 'loading'; });
  renderStocks();

  try {
    const raw = await fetchAllQuotesRaw(allStocks.map(st => st.symbol));
    allStocks.forEach(st => {
      const d = raw[st.symbol];
      const closes = ((d && d.close) || []).filter(v => typeof v === 'number');
      if (closes.length < 2) { st.status = st.status === 'live' ? 'live' : 'error'; return; }
      const price = closes[closes.length - 1];
      const prevClose = closes[closes.length - 2];
      st.price = price;
      st.change = ((price - prevClose) / prevClose) * 100;
      st.series = closes.slice(-12);
      st.status = 'live';
    });
  } catch (e) {
    allStocks.forEach(st => { if (st.status !== 'live') st.status = 'error'; });
  }

  const anyLive = allStocks.some(st => st.status === 'live');
  DATA.stocksUpdatedAt = new Date();
  setStocksLiveStatus(anyLive ? 'live' : 'error');
  renderStocks();
  stocksFetching = false;
}

function setStocksLiveStatus(mode) {
  const box = $('#stocks-live-status');
  if (!box) return;
  box.classList.remove('live', 'error');
  const btn = $('#stocks-refresh-btn');
  if (mode === 'loading') {
    btn && btn.classList.add('spinning');
    $('#stocks-live-text').textContent = '실시간 시세 불러오는 중…';
  } else {
    btn && btn.classList.remove('spinning');
    box.classList.add(mode === 'live' ? 'live' : 'error');
    const time = DATA.stocksUpdatedAt
      ? DATA.stocksUpdatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '-';
    $('#stocks-live-text').textContent = mode === 'live'
      ? `실시간 시세 · ${time} 업데이트`
      : `실시간 조회 실패 · 참고 시세로 표시 중 (${time})`;
  }
}

let stocksTimer = null;
function startStocksAutoRefresh() {
  refreshStocks();
  clearInterval(stocksTimer);
  stocksTimer = setInterval(refreshStocks, STOCKS_REFRESH_MS);
}
function stopStocksAutoRefresh() {
  clearInterval(stocksTimer);
  stocksTimer = null;
}

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
function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
function addDays(d, n) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
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

/* 카드덱 상태: 현재 보고 있는 뉴스 카드 인덱스 */
let newsDeckIndex = 0;

function renderNews() {
  const list = $('#news-list');
  list.innerHTML = '';
  if (newsDeckIndex > DATA.news.length - 1) newsDeckIndex = DATA.news.length - 1;
  if (newsDeckIndex < 0) newsDeckIndex = 0;

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

      <div class="news-detail" hidden>
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
        <span class="toggle-text">자세히 보기</span>
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
    list.appendChild(card);
  });

  renderNewsDots();
  updateNewsDeck(false);
}

/* 카드덱 위치/투명도 갱신 (현재 카드는 정면, 이후 카드는 뒤로 살짝 쌓임) */
function updateNewsDeck(animateHeight) {
  const cards = [...$('#news-list').children];
  cards.forEach((card, i) => {
    const offset = i - newsDeckIndex;
    card.classList.toggle('active', offset === 0);
    if (offset < 0) {
      card.style.zIndex = 0;
      card.style.opacity = '0';
      card.style.transform = 'translateX(-115%) rotate(-6deg) scale(0.96)';
      card.style.pointerEvents = 'none';
    } else if (offset === 0) {
      card.style.zIndex = 30;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
      card.style.pointerEvents = 'auto';
    } else if (offset <= 2) {
      card.style.zIndex = 30 - offset;
      card.style.opacity = '1';
      card.style.transform = `translateY(${offset * 12}px) scale(${1 - offset * 0.045})`;
      card.style.pointerEvents = 'none';
    } else {
      card.style.zIndex = 0;
      card.style.opacity = '0';
      card.style.transform = `translateY(${2 * 12}px) scale(${1 - 2 * 0.045})`;
      card.style.pointerEvents = 'none';
    }
  });

  $('#news-count-label').textContent = `${newsDeckIndex + 1} / ${DATA.news.length}`;
  $('#news-prev').disabled = newsDeckIndex === 0;
  $('#news-next').disabled = newsDeckIndex === DATA.news.length - 1;
  [...$('#news-dots').children].forEach((dot, i) => dot.classList.toggle('active', i === newsDeckIndex));

  syncDeckHeight(animateHeight);
}

/* 활성 카드 높이에 맞춰 스택 컨테이너 높이 동기화 (아코디언 펼침 대응) */
function syncDeckHeight(animate) {
  const stack = $('#news-list');
  const active = stack.children[newsDeckIndex];
  if (!active) return;
  const setHeight = () => { stack.style.height = active.offsetHeight + 'px'; };
  if (animate === false) {
    stack.style.transition = 'none';
    setHeight();
    requestAnimationFrame(() => { stack.style.transition = ''; });
  } else {
    setHeight();
  }
}

function renderNewsDots() {
  const wrap = $('#news-dots');
  wrap.innerHTML = DATA.news.map((_, i) =>
    `<button class="dot" data-act="deck-goto" data-i="${i}" aria-label="${i + 1}번째 뉴스로 이동"></button>`
  ).join('');
}

function newsDeckGoTo(i) {
  if (i < 0 || i > DATA.news.length - 1 || i === newsDeckIndex) return;
  newsDeckIndex = i;
  updateNewsDeck(true);
}
function newsDeckNext() { newsDeckGoTo(newsDeckIndex + 1); }
function newsDeckPrev() { newsDeckGoTo(newsDeckIndex - 1); }

/* 뉴스 카드 이벤트 (위임) */
function bindNews() {
  const list = $('#news-list');

  list.addEventListener('click', e => {
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
      syncDeckHeight(true);
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

  $('#news-prev').addEventListener('click', newsDeckPrev);
  $('#news-next').addEventListener('click', newsDeckNext);
  $('#news-dots').addEventListener('click', e => {
    const dot = e.target.closest('[data-act="deck-goto"]');
    if (dot) newsDeckGoTo(Number(dot.dataset.i));
  });

  /* 스와이프(드래그)로 카드 넘기기 — 활성 카드에서만 동작, 버튼 위 드래그는 무시 */
  let dragCard = null, dragId = null, startX = 0, startY = 0, dx = 0, dy = 0, dragged = false, suppressClick = false;

  list.addEventListener('pointerdown', e => {
    if (e.target.closest('[data-act]')) return;
    const card = e.target.closest('.news-item.active');
    if (!card) return;
    dragCard = card; dragId = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0; dy = 0; dragged = false;
    card.setPointerCapture(dragId);
  });

  list.addEventListener('pointermove', e => {
    if (!dragCard || e.pointerId !== dragId) return;
    dx = e.clientX - startX; dy = e.clientY - startY;
    if (Math.abs(dx) > 4) dragged = true;
    if (!dragged) return;
    dragCard.classList.add('dragging');
    dragCard.style.transform = `translateX(${dx}px) translateY(${dy * 0.15}px) rotate(${dx / 20}deg)`;
  });

  function endDrag(e) {
    if (!dragCard || e.pointerId !== dragId) return;
    dragCard.classList.remove('dragging');
    const threshold = 90;
    if (dragged) suppressClick = true;
    if (dx <= -threshold) newsDeckNext();
    else if (dx >= threshold) newsDeckPrev();
    else updateNewsDeck(true);
    dragCard = null; dragId = null; dragged = false;
  }
  list.addEventListener('pointerup', endDrag);
  list.addEventListener('pointercancel', endDrag);

  /* 드래그 직후 클릭(토글 등) 오작동 방지 */
  list.addEventListener('click', e => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
  }, true);
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
    .map(e => ({ ...e, dday: e.offset, dateObj: addDays(APP_TODAY, e.offset) }))
    .filter(e => e.dday >= 0)          // 지난 일정 제외
    .sort((a, b) => a.dday - b.dday);

  if (!events.length) { list.innerHTML = '<p class="caption">예정된 일정이 없어요</p>'; return; }

  events.forEach(ev => {
    const ddayText = ev.dday === 0 ? 'D-DAY' : `D-${ev.dday}`;
    const item = el('div', 'cal-item');
    item.innerHTML = `
      <div class="cal-dday ${ev.dday <= 3 ? 'soon' : ''}">${ddayText}</div>
      <div class="cal-info">
        <div class="cal-name">${escapeHtml(ev.name)} <span class="cal-type">${escapeHtml(ev.type)}</span></div>
        <div class="cal-date">${ev.dateObj.getMonth() + 1}월 ${ev.dateObj.getDate()}일 · <button class="cal-more" data-act="cal-detail">사전 설명 보기</button></div>
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
    const isDomestic = curMarket === 'domestic';
    const priceText = typeof st.price === 'number'
      ? (isDomestic
          ? `${Math.round(st.price).toLocaleString('ko-KR')}원`
          : `$${st.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      : '—';
    return `
      <div class="stock-card ${st.status === 'loading' ? 'loading' : ''}">
        <div class="stock-name">${escapeHtml(st.name)}</div>
        <div class="stock-sector">${escapeHtml(st.sector)}</div>
        <div class="stock-price">${priceText}</div>
        ${sparkline(st.series, up)}
        <div class="stock-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(st.change).toFixed(1)}%</div>
        ${st.status === 'error' ? '<div class="stock-stale">실시간 조회 실패 · 참고값</div>' : ''}
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
  $('#stocks-refresh-btn').addEventListener('click', () => {
    if (!stocksFetching) refreshStocks();
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
  'view-today': '한입경제', 'view-map': '경제지도',
  'view-note': '나만의 노트', 'view-stocks': '업종·종목', 'view-settings': '설정',
};
function switchView(viewId) {
  if (!document.getElementById(viewId)) viewId = 'view-today';
  $$('.view').forEach(v => v.hidden = (v.id !== viewId));
  $$('#section-bottomnav .nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === viewId));
  $('#appbar-title').textContent = VIEW_TITLE[viewId] || '한입경제';
  $('#page-scroll').scrollTop = 0;
  window.scrollTo(0, 0);
  if (window.speechSynthesis) window.speechSynthesis.cancel(); // 뷰 이동 시 오디오 정지

  // 업종·종목 탭에 머무는 동안만 실시간 시세 자동 갱신
  if (viewId === 'view-stocks') startStocksAutoRefresh();
  else stopStocksAutoRefresh();

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
