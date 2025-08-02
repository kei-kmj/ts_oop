export const HEADER = {
  H1: 1,
  H2: 2,
} as const;

export const BUTTONS = {
  SEARCH: '検索',
  SEARCH_ACTION: '検索する',
  CLEAR: 'クリア',
  SUBMIT: '送信',
  CANCEL: 'キャンセル',
  FILTER: '絞り込み',
  FAVORITE: 'お気に入り',
  REGISTERED: '登録済み',
} as const;

export const FORM = {
  KEYWORD: 'キーワード',
  KEYWORD_INPUT: 'キーワードを入力',
  AREA_INPUT: 'エリアを入力',
  PREFECTURE_PLACEHOLDER: '都道府県をお選びください',
  CITY_PLACEHOLDER: '市区町村をお選びください',
} as const;

export const TABS = {
  AREA_SEARCH: 'エリアから探す',
  KEYWORD_SEARCH: 'フリーワードから探す',
} as const;

export const SORT_TYPES = {
  DATE_NEW: '新しい順',
  DATE_OLD: '古い順',
  RATING_HIGH: '高い順',
  RATING_LOW: '低い順',
} as const;

export const ATTRIBUTE_TYPES = {
  PARENT: '保護者',
  STUDENT: '生徒',
} as const;

export const REGIONS = {
  HOKKAIDO_TOHOKU: '北海道・東北',
  SHINETSU_HOKURIKU: '信越・北陸',
  KANTO: '関東',
  TOKAI: '東海',
  KANSAI: '関西',
  CHUGOKU_SHIKOKU: '中国・四国',
  KYUSHU_OKINAWA: '九州・沖縄',
} as const;

export const ADDRESS_LABELS = {
  NEAREST_STATION: '最寄駅',
  ADDRESS: '住所',
  MAP_LINK: '地図を見る',
} as const;

export const CTA_LINK = {
  TRIAL: '体験授業の相談',
  DOC: 'とりあえず料金を',
} as const;

export const SHORT_COURSE_BUTTON = {
  SUMMER: '夏期講習',
  WINTER: '冬期講習',
  SPRING: '春期講習',
};

export const CLASSROOM_TAB = {
  top: { className: 'tab-nav-season', label: '教室トップ' },
  report: { className: 'tab-nav-report', label: '詳細レポ' },
  review: { className: 'tab-nav-kuchikomi', label: '口コミ' },
  map: { className: 'tab-nav-map', label: '地図' },
} as const;

export type ClassroomTabKey = keyof typeof CLASSROOM_TAB;

export const SECTION = {
  RESULT: {
    areaId: 'result',
  },
} as const;

export const EXAM_TYPES = {
  ALL: 'すべて',
  UNIVERSITY: '大学受験',
  HIGH_SCHOOL: '高校受験',
  JUNIOR_HIGH: '中学受験',
  ELEMENTARY: '小学校受験',
  TEST_PREP: 'テスト対策',
  INTEGRATED: '中高一貫校',
  ENGLISH: '子供英語',
} as const;

export const JUKU_TABS = {
  TOP: '塾トップ',
  REPORT: '詳細レポ',
  COURSE: 'コース',
  CLASSROOM_LIST: '教室一覧',
  REVIEW: '口コミ',
} as const;

export const GENDER = {
  MALE: '男性',
  FEMALE: '女性',
} as const;

export const INTERVIEW_LABELS = {
  NONE: 'なし',
  LIST_LINK: '合格者インタビュー一覧へ',
} as const;

export const TITLES = {
  JUKU_ATTENDED_DURING_EXAM: '受験時に通っていた塾',
} as const;

export const TIMEOUTS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 10000,
} as const;

export const MESSAGES = {
  NO_REVIEW: 'この教室にはまだ口コミがありません。',
  CLASSROOM_TOP_LINK_SUFFIX: 'のトップページへ戻る',
} as const;

export const CSS_CLASSES = {
  POST_EXPERIENCE: '.bjc-post-experience',
  POST_INTERVIEW: '.bjc-post-interview',
  JUKU_HEADER_BOX: '.bjc-juku-header-box',
  CTA_BTN: '.bjc-cta-btn',
  REVIEW_ARTICLE: '.bjc-review-article',
  TAB_ACTIVE: '.js-tab__content.is-active',
} as const;

export const RATING_LABELS = {
  STAR_5: '星5',
  STAR_4: '星4',
  STAR_3: '星3',
  STAR_2: '星2',
  STAR_1: '星1',
} as const;
