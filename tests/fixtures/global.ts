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
  DOC: '料金・コースを知りたい',
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
