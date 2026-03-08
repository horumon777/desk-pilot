import { DiagnosisQuestion } from "@/types";

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  // ===== Q1: チェア =====
  {
    id: "q1_chair",
    questionText: "今、仕事で使っている椅子は？",
    description: "一番近いものを選んでください",
    targetAxes: ["ergonomics"],
    options: [
      {
        id: "q1_a1",
        label: "高機能オフィスチェア",
        icon: "🏆",
        description: "アーロン、エルゴヒューマン等。ランバーサポート・アームレスト付き",
        scoreContributions: { ergonomics: 6 },
      },
      {
        id: "q1_a2",
        label: "1〜3万円台のオフィスチェア",
        icon: "💺",
        description: "メッシュバック、高さ調整あり。そこそこ快適",
        scoreContributions: { ergonomics: 4 },
      },
      {
        id: "q1_a3",
        label: "ダイニングチェア / 折りたたみ椅子",
        icon: "🪑",
        description: "仕事用ではないが、とりあえず座れる",
        scoreContributions: { ergonomics: 2 },
      },
      {
        id: "q1_a4",
        label: "ソファ / ベッド / 床",
        icon: "🛋️",
        description: "固定の椅子がない、またはリラックス姿勢で作業",
        scoreContributions: { ergonomics: 0 },
      },
    ],
  },

  // ===== Q2: モニター =====
  {
    id: "q2_monitor",
    questionText: "モニター環境はどんな感じ？",
    description: "普段の作業時のセットアップ",
    targetAxes: ["productivity", "focus"],
    options: [
      {
        id: "q2_a1",
        label: "外部モニター2台以上 / ウルトラワイド",
        icon: "🖥️",
        description: "デュアルモニターまたは34インチ以上のウルトラワイド",
        scoreContributions: { productivity: 6, focus: 3 },
      },
      {
        id: "q2_a2",
        label: "外部モニター1台",
        icon: "🖥️",
        description: "24〜27インチ程度の外部ディスプレイ",
        scoreContributions: { productivity: 4, focus: 2 },
      },
      {
        id: "q2_a3",
        label: "ノートPC + 外部モニター",
        icon: "💻",
        description: "ノートの画面とサブモニターを併用",
        scoreContributions: { productivity: 3, focus: 2 },
      },
      {
        id: "q2_a4",
        label: "ノートPCの画面だけ",
        icon: "📱",
        description: "13〜16インチのノートPC画面のみで作業",
        scoreContributions: { productivity: 1, focus: 1 },
      },
    ],
  },

  // ===== Q3: 入力デバイス =====
  {
    id: "q3_input",
    questionText: "キーボードとマウスは？",
    description: "メインで使っているもの",
    targetAxes: ["ergonomics", "productivity"],
    options: [
      {
        id: "q3_a1",
        label: "こだわりの外付けキーボード + マウス",
        icon: "⌨️",
        description: "HHKB、Realforce、MX Keys等。打鍵感やカスタマイズ重視",
        scoreContributions: { ergonomics: 4, productivity: 4 },
      },
      {
        id: "q3_a2",
        label: "一般的な外付けキーボード + マウス",
        icon: "🖱️",
        description: "特にこだわりはないが、外付けは使っている",
        scoreContributions: { ergonomics: 3, productivity: 3 },
      },
      {
        id: "q3_a3",
        label: "ノートPCのキーボード + 外付けマウス",
        icon: "👆",
        description: "マウスだけは外付け。キーボードはPC内蔵",
        scoreContributions: { ergonomics: 2, productivity: 2 },
      },
      {
        id: "q3_a4",
        label: "ノートPCのキーボード + トラックパッド",
        icon: "🤲",
        description: "外付けデバイスなし。すべてPC内蔵",
        scoreContributions: { ergonomics: 1, productivity: 1 },
      },
    ],
  },

  // ===== Q4: 照明 =====
  {
    id: "q4_lighting",
    questionText: "デスク周りの照明は？",
    description: "作業中の明かりの状況",
    targetAxes: ["focus", "ergonomics"],
    options: [
      {
        id: "q4_a1",
        label: "モニターライト + 間接照明",
        icon: "💡",
        description: "BenQ ScreenBar等 + 部屋の間接照明で最適化",
        scoreContributions: { focus: 5, ergonomics: 3 },
      },
      {
        id: "q4_a2",
        label: "デスクライトあり",
        icon: "🔦",
        description: "スタンドライトやクリップライトを設置",
        scoreContributions: { focus: 3, ergonomics: 2 },
      },
      {
        id: "q4_a3",
        label: "部屋の天井照明だけ",
        icon: "🔆",
        description: "専用の照明はなし。部屋全体の明かりのみ",
        scoreContributions: { focus: 1, ergonomics: 1 },
      },
      {
        id: "q4_a4",
        label: "暗い / 特に気にしていない",
        icon: "🌑",
        description: "画面の明かりだけ、または照明環境を意識していない",
        scoreContributions: { focus: 0, ergonomics: 0 },
      },
    ],
  },

  // ===== Q5: デスクのサイズと素材 =====
  {
    id: "q5_desk",
    questionText: "作業デスクの状況は？",
    description: "サイズ・使い心地の実感",
    targetAxes: ["productivity", "aesthetics"],
    options: [
      {
        id: "q5_a1",
        label: "広い専用デスク（120cm以上）",
        icon: "📐",
        description: "天板が広く、モニターも資料も余裕で置ける",
        scoreContributions: { productivity: 4, aesthetics: 4 },
      },
      {
        id: "q5_a2",
        label: "標準的なデスク（100cm前後）",
        icon: "🗂️",
        description: "一般的なサイズ。足りないことはないがギリギリ",
        scoreContributions: { productivity: 3, aesthetics: 3 },
      },
      {
        id: "q5_a3",
        label: "小さめのデスク（80cm以下）",
        icon: "📦",
        description: "コンパクト。物を置くと作業スペースが狭くなる",
        scoreContributions: { productivity: 2, aesthetics: 1 },
      },
      {
        id: "q5_a4",
        label: "テーブルの一角 / 固定の場所がない",
        icon: "🍽️",
        description: "ダイニングテーブルやカウンター、場所が定まっていない",
        scoreContributions: { productivity: 0, aesthetics: 0 },
      },
    ],
  },

  // ===== Q6: ケーブル管理 =====
  {
    id: "q6_cables",
    questionText: "デスク周りのケーブル、どうなってる？",
    description: "正直に答えてください",
    targetAxes: ["maintenance", "aesthetics"],
    options: [
      {
        id: "q6_a1",
        label: "きっちり整理済み",
        icon: "✨",
        description: "ケーブルトレー・結束バンド等で見えない状態",
        scoreContributions: { maintenance: 5, aesthetics: 3 },
      },
      {
        id: "q6_a2",
        label: "まあまあ整理してる",
        icon: "👍",
        description: "ある程度まとめてるが、一部見えている",
        scoreContributions: { maintenance: 3, aesthetics: 2 },
      },
      {
        id: "q6_a3",
        label: "散らかってる",
        icon: "🔌",
        description: "ケーブルが複数見えていて、絡まっている",
        scoreContributions: { maintenance: 1, aesthetics: 1 },
      },
      {
        id: "q6_a4",
        label: "カオス",
        icon: "🕸️",
        description: "何のケーブルかわからないものが床を這っている",
        scoreContributions: { maintenance: 0, aesthetics: 0 },
      },
    ],
  },

  // ===== Q7: 音環境 =====
  {
    id: "q7_audio",
    questionText: "作業中の音環境は？",
    description: "集中できる環境かどうか",
    targetAxes: ["focus"],
    options: [
      {
        id: "q7_a1",
        label: "ノイキャン + 静かな個室",
        icon: "🎧",
        description: "AirPods Max等のノイキャン or 防音された個室",
        scoreContributions: { focus: 5 },
      },
      {
        id: "q7_a2",
        label: "ノイキャン or 静かな環境",
        icon: "🔇",
        description: "どちらか一方は確保できている",
        scoreContributions: { focus: 4 },
      },
      {
        id: "q7_a3",
        label: "BGM程度の環境音あり",
        icon: "🎵",
        description: "カフェ程度の雑音。イヤホンで音楽を聞いてる",
        scoreContributions: { focus: 2 },
      },
      {
        id: "q7_a4",
        label: "生活音・会話が聞こえる",
        icon: "📢",
        description: "テレビ、家族の声、オフィスの騒音が常にある",
        scoreContributions: { focus: 1 },
      },
    ],
  },

  // ===== Q8: デスク上の整理整頓 =====
  {
    id: "q8_organization",
    questionText: "今、デスクの上に\nどれくらいモノがある？",
    description: "作業中の状態で",
    targetAxes: ["maintenance", "productivity"],
    options: [
      {
        id: "q8_a1",
        label: "必要最低限だけ",
        icon: "◻️",
        description: "PC・モニター・入力デバイス。それ以外はほぼない",
        scoreContributions: { maintenance: 4, productivity: 3 },
      },
      {
        id: "q8_a2",
        label: "少しの小物がある",
        icon: "🌿",
        description: "ドリンク、植物、ペン立て程度。管理できている",
        scoreContributions: { maintenance: 3, productivity: 3 },
      },
      {
        id: "q8_a3",
        label: "結構モノが多い",
        icon: "📚",
        description: "書類、本、ガジェットが置かれている。やや雑然",
        scoreContributions: { maintenance: 2, productivity: 1 },
      },
      {
        id: "q8_a4",
        label: "作業スペースが埋まっている",
        icon: "🗑️",
        description: "何がどこにあるかわからない。探し物が多い",
        scoreContributions: { maintenance: 0, productivity: 0 },
      },
    ],
  },

  // ===== Q9: 見た目・インテリア =====
  {
    id: "q9_aesthetics",
    questionText: "デスク周りの見た目、\nどれくらい気を使ってる？",
    description: "インテリアやカラー統一など",
    targetAxes: ["aesthetics"],
    options: [
      {
        id: "q9_a1",
        label: "トータルコーディネート済み",
        icon: "🎨",
        description: "色味・素材・配置を意識してセットアップ構築",
        scoreContributions: { aesthetics: 6 },
      },
      {
        id: "q9_a2",
        label: "ある程度こだわっている",
        icon: "🖼️",
        description: "デスクマットや小物の色は揃えている",
        scoreContributions: { aesthetics: 4 },
      },
      {
        id: "q9_a3",
        label: "機能性優先",
        icon: "🔧",
        description: "見た目よりも使いやすさ。統一感はあまりない",
        scoreContributions: { aesthetics: 2 },
      },
      {
        id: "q9_a4",
        label: "特に気にしていない",
        icon: "🤷",
        description: "見た目は意識したことがない",
        scoreContributions: { aesthetics: 0 },
      },
    ],
  },

  // ===== Q10: メンテナンス習慣 =====
  {
    id: "q10_habits",
    questionText: "デスク周りの掃除や\n見直しの頻度は？",
    description: "日頃の習慣として",
    targetAxes: ["maintenance", "ergonomics"],
    options: [
      {
        id: "q10_a1",
        label: "週1以上で定期的に",
        icon: "📅",
        description: "デスク拭き・整理を習慣化している",
        scoreContributions: { maintenance: 5, ergonomics: 2 },
      },
      {
        id: "q10_a2",
        label: "月1〜2回くらい",
        icon: "🧹",
        description: "気になったときにやる。まあまあの頻度",
        scoreContributions: { maintenance: 3, ergonomics: 1 },
      },
      {
        id: "q10_a3",
        label: "たまに大掃除",
        icon: "💨",
        description: "散らかってきたら一気にやるタイプ",
        scoreContributions: { maintenance: 1, ergonomics: 1 },
      },
      {
        id: "q10_a4",
        label: "ほとんどやらない",
        icon: "😅",
        description: "最後にデスクを掃除したのがいつか覚えていない",
        scoreContributions: { maintenance: 0, ergonomics: 0 },
      },
    ],
  },

  // ===== Q11: モニターの位置・姿勢 =====
  {
    id: "q11_monitor_position",
    questionText: "モニターの高さや位置、\n調整してる？",
    description: "目線・首の角度に関わる部分",
    targetAxes: ["ergonomics", "focus"],
    options: [
      {
        id: "q11_a1",
        label: "モニターアーム + 目線ぴったり",
        icon: "🦾",
        description: "アームで高さ・角度を最適化。目線がまっすぐ",
        scoreContributions: { ergonomics: 5, focus: 2 },
      },
      {
        id: "q11_a2",
        label: "スタンドで高さ調整済み",
        icon: "📏",
        description: "台やスタンドで持ち上げて調整している",
        scoreContributions: { ergonomics: 3, focus: 1 },
      },
      {
        id: "q11_a3",
        label: "置いたまま。特に調整してない",
        icon: "🖥️",
        description: "モニターを置いただけ。高さは気にしていない",
        scoreContributions: { ergonomics: 1, focus: 1 },
      },
      {
        id: "q11_a4",
        label: "ノートPCの画面を覗き込んでいる",
        icon: "🙇",
        description: "画面が低い位置にあり、首を曲げて見ている",
        scoreContributions: { ergonomics: 0, focus: 0 },
      },
    ],
  },

  // ===== Q12: 昇降デスク / デスク機能 =====
  {
    id: "q12_desk_type",
    questionText: "デスク自体の機能は？",
    description: "昇降機能や拡張性など",
    targetAxes: ["ergonomics", "productivity"],
    options: [
      {
        id: "q12_a1",
        label: "電動昇降デスク",
        icon: "⬆️",
        description: "FlexiSpot等。ボタンで高さを変えられる",
        scoreContributions: { ergonomics: 5, productivity: 3 },
      },
      {
        id: "q12_a2",
        label: "手動昇降 / 高さ調整可能",
        icon: "🔧",
        description: "手動で高さ変更できる。たまに立って作業する",
        scoreContributions: { ergonomics: 4, productivity: 2 },
      },
      {
        id: "q12_a3",
        label: "固定デスク（仕事用）",
        icon: "🗄️",
        description: "高さは変えられないが、仕事用として購入したもの",
        scoreContributions: { ergonomics: 2, productivity: 2 },
      },
      {
        id: "q12_a4",
        label: "汎用テーブル / 間に合わせ",
        icon: "🍽️",
        description: "もともと仕事用じゃない。カフェテーブルやこたつなど",
        scoreContributions: { ergonomics: 0, productivity: 0 },
      },
    ],
  },

  // ===== Q13: デスクアクセサリー =====
  {
    id: "q13_accessories",
    questionText: "デスク周りのアクセサリー、\nどのくらい揃えてる？",
    description: "デスクマット、リストレスト、USBハブなど",
    targetAxes: ["aesthetics", "ergonomics"],
    options: [
      {
        id: "q13_a1",
        label: "しっかり揃えている",
        icon: "💎",
        description: "デスクマット、リストレスト、ハブ、小物トレーなど充実",
        scoreContributions: { aesthetics: 4, ergonomics: 3 },
      },
      {
        id: "q13_a2",
        label: "いくつかは持っている",
        icon: "👌",
        description: "デスクマットかリストレストか、何か1〜2個はある",
        scoreContributions: { aesthetics: 3, ergonomics: 2 },
      },
      {
        id: "q13_a3",
        label: "最低限（充電器くらい）",
        icon: "🔌",
        description: "充電ケーブルやスマホスタンド程度",
        scoreContributions: { aesthetics: 1, ergonomics: 1 },
      },
      {
        id: "q13_a4",
        label: "何もない",
        icon: "🚫",
        description: "PC以外のアクセサリーは特にない",
        scoreContributions: { aesthetics: 0, ergonomics: 0 },
      },
    ],
  },

  // ===== Q14: 作業時間と休憩 =====
  {
    id: "q14_breaks",
    questionText: "ぶっ通しで何時間くらい\n座りっぱなし？",
    description: "休憩を取らずに作業する時間",
    targetAxes: ["ergonomics", "focus"],
    options: [
      {
        id: "q14_a1",
        label: "1時間ごとに休憩する",
        icon: "⏰",
        description: "意識的に立ち上がったりストレッチする習慣がある",
        scoreContributions: { ergonomics: 4, focus: 3 },
      },
      {
        id: "q14_a2",
        label: "2〜3時間で一息つく",
        icon: "☕",
        description: "コーヒー入れたりトイレに行くタイミングで動く",
        scoreContributions: { ergonomics: 3, focus: 2 },
      },
      {
        id: "q14_a3",
        label: "気づいたら4時間以上",
        icon: "😵",
        description: "集中すると休憩を忘れてしまう",
        scoreContributions: { ergonomics: 1, focus: 1 },
      },
      {
        id: "q14_a4",
        label: "半日〜1日座りっぱなし",
        icon: "💀",
        description: "ほぼ動かない。腰や首が常にバキバキ",
        scoreContributions: { ergonomics: 0, focus: 0 },
      },
    ],
  },

  // ===== Q15: 集中を妨げるもの =====
  {
    id: "q15_distractions",
    questionText: "作業中、集中を妨げるもの\nどれくらいある？",
    description: "スマホ通知、人の出入り、視界のノイズなど",
    targetAxes: ["focus", "productivity"],
    options: [
      {
        id: "q15_a1",
        label: "ほぼゼロ。集中できる環境",
        icon: "🧘",
        description: "通知オフ・個室・視界スッキリ。邪魔が入らない",
        scoreContributions: { focus: 4, productivity: 3 },
      },
      {
        id: "q15_a2",
        label: "たまに中断される程度",
        icon: "🔔",
        description: "通知は一部オン。たまに声をかけられる",
        scoreContributions: { focus: 3, productivity: 2 },
      },
      {
        id: "q15_a3",
        label: "結構ある",
        icon: "📱",
        description: "スマホが気になる、周りの動きが視界に入る",
        scoreContributions: { focus: 1, productivity: 1 },
      },
      {
        id: "q15_a4",
        label: "常に何かに中断される",
        icon: "🌀",
        description: "通知、同居人、テレビ…集中が30分持たない",
        scoreContributions: { focus: 0, productivity: 0 },
      },
    ],
  },
];
