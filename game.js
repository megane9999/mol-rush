const AVOGADRO = 6.022e23;
const SAVE_KEY = "mol-rush-synth-lab-v2";
const VISIBLE_MOLECULE_LIMIT = 1000;
const VISIBLE_TARGETS = {
  low: 180,
  mid: 420,
  high: 1000,
};
const REACTION_DENSITY_MULTIPLIER = {
  low: 6,
  mid: 3,
  high: 1,
};

const i18n = {
  ja: {
    tagline: "分子を増やし、衝突でより複雑な分子へ合成",
    activeMolecule: "Active Molecule",
    displayDensity: "Display",
    moleculesTab: "分子",
    skillsTab: "スキル",
    reactionsTab: "反応",
    openTechTree: "技術ツリーを開く",
    reset: "リセット",
    moleculeNotes: "Molecule Notes",
    techTreeTitle: "合成技術ツリー",
    goalTitle: "1 mol 達成",
    goalBody: "合計生成数が 6.022 x 10^23 個を超えました。ここからは医薬品分子の量産がハイスコア目標です。",
    continue: "続ける",
    feedSingle: "単体",
    feedMix: "比率",
    clickButton: "反応槽をクリックして増やす",
    synthReadyTitle: "Synth Lab Ready",
    synthReadyDetail: "水素分子を増やし、スキルで反応ルートを開きましょう。",
    resetConfirm: "現在の実験データをリセットしますか？",
    resetTitle: "実験を初期化",
    resetDetail: "水素分子から再開します。",
    reactorIdle: "画面内の分子オブジェクト同士が実際に衝突したときだけ反応します。",
    reactionSuccess: "合成成功",
    value: "価値",
    feedMaterial: "クリック材料",
    product: "生成物",
    undiscovered: "未発見",
    lockedText: "スキルや反応でアンロックされます。",
    acquired: "取得済",
    ready: "READY",
    locked: "LOCKED",
    materialWaiting: "材料待ち",
    lockedReaction: "未解禁",
    goalEventTitle: "1 mol 達成",
    goalEventDetail: "反応槽が臨界祝賀モードに入りました。",
    molEquivalent: "mol 相当",
    feedShare: "投入比率",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    level: "Lv",
  },
  en: {
    tagline: "Grow molecules and synthesize more complex products through collisions",
    activeMolecule: "Active Molecule",
    displayDensity: "Display",
    moleculesTab: "Molecules",
    skillsTab: "Skills",
    reactionsTab: "Reactions",
    openTechTree: "Open Tech Tree",
    reset: "Reset",
    moleculeNotes: "Molecule Notes",
    techTreeTitle: "Synthesis Tech Tree",
    goalTitle: "1 mol Reached",
    goalBody: "Total production exceeded 6.022 x 10^23 molecules. From here, mass-producing pharmaceutical molecules is the high-score target.",
    continue: "Continue",
    feedSingle: "Single",
    feedMix: "Ratio",
    clickButton: "Click Reactor to Feed",
    synthReadyTitle: "Synth Lab Ready",
    synthReadyDetail: "Feed hydrogen molecules and unlock reaction routes through skills.",
    resetConfirm: "Reset the current experiment data?",
    resetTitle: "Experiment Reset",
    resetDetail: "Restarting from hydrogen molecules.",
    reactorIdle: "Reactions occur only when visible molecule objects collide in the reactor.",
    reactionSuccess: "Synthesis",
    value: "Value",
    feedMaterial: "Feed",
    product: "Product",
    undiscovered: "Undiscovered",
    lockedText: "Unlocked through skills or reactions.",
    acquired: "Owned",
    ready: "READY",
    locked: "LOCKED",
    materialWaiting: "Waiting",
    lockedReaction: "Locked",
    goalEventTitle: "1 mol Reached",
    goalEventDetail: "The reactor has entered celebration mode.",
    molEquivalent: "mol equivalent",
    feedShare: "Feed share",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    level: "Lv",
  },
};

const atomColors = {
  H: ["#f4fbff", "#bfcbd7"],
  O: ["#ff6f82", "#8e2031"],
  N: ["#80adff", "#213d8e"],
  C: ["#b5c0c7", "#3b464d"],
};

const molecules = {
  h2: {
    name: "水素",
    formula: "H2",
    value: 1,
    atoms: [
      ["H", -18, 0],
      ["H", 18, 0],
    ],
    bonds: [[0, 1]],
    feed: true,
    desc: "最も軽い二原子分子。アンモニアやメタノールなど、多くの工業的合成の還元剤として重要です。",
  },
  o2: {
    name: "酸素",
    formula: "O2",
    value: 4,
    atoms: [
      ["O", -19, 0],
      ["O", 19, 0],
    ],
    bonds: [[0, 1]],
    feed: true,
    desc: "空気中に含まれる二原子分子。水素と反応して水を生じますが、実際には点火や触媒などの条件が重要です。",
  },
  n2: {
    name: "窒素",
    formula: "N2",
    value: 6,
    atoms: [
      ["N", -19, 0],
      ["N", 19, 0],
    ],
    bonds: [[0, 1]],
    feed: true,
    desc: "空気の主成分。三重結合が非常に強く、アンモニア合成には高温高圧と触媒が必要です。",
  },
  h2o: {
    name: "水",
    formula: "H2O",
    value: 22,
    atoms: [
      ["O", 0, 5],
      ["H", -24, -16],
      ["H", 24, -16],
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
    desc: "折れ線形の分子。水素と酸素の燃焼で生成します。ゲーム内では初期の合成成功の目印です。",
  },
  nh3: {
    name: "アンモニア",
    formula: "NH3",
    value: 95,
    atoms: [
      ["N", 0, 0],
      ["H", -27, 14],
      ["H", 27, 14],
      ["H", 0, -30],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    desc: "窒素肥料の基礎になる分子。ハーバー・ボッシュ法では窒素と水素から鉄系触媒を用いて合成されます。",
  },
  co2: {
    name: "二酸化炭素",
    formula: "CO2",
    value: 70,
    atoms: [
      ["O", -36, 0],
      ["C", 0, 0],
      ["O", 36, 0],
    ],
    bonds: [
      [0, 1],
      [1, 2],
    ],
    feed: true,
    desc: "直線形の分子。メタノール合成や尿素合成の炭素源として扱います。",
  },
  methanol: {
    name: "メタノール",
    formula: "CH3OH",
    value: 320,
    atoms: [
      ["C", -10, 0],
      ["O", 28, 0],
      ["H", 48, -18],
      ["H", -30, -22],
      ["H", -35, 16],
      ["H", -2, 30],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [0, 3],
      [0, 4],
      [0, 5],
    ],
    desc: "最も単純なアルコール。実工業では CO/CO2 と H2 から銅系触媒で合成されます。",
  },
  urea: {
    name: "尿素",
    formula: "CO(NH2)2",
    value: 1200,
    atoms: [
      ["C", 0, 0],
      ["O", 0, -34],
      ["N", -34, 16],
      ["N", 34, 16],
      ["H", -54, 0],
      ["H", -48, 38],
      ["H", 54, 0],
      ["H", 48, 38],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [2, 4],
      [2, 5],
      [3, 6],
      [3, 7],
    ],
    desc: "肥料や樹脂原料として重要な分子。工業的にはアンモニアと二酸化炭素から合成されます。",
  },
  salicylic: {
    name: "サリチル酸",
    formula: "C7H6O3",
    value: 1800,
    atoms: makeRingStructure(["C", "C", "C", "C", "C", "C"], 34, [
      ["O", 0, -58],
      ["O", 52, -38],
      ["O", 68, -10],
    ]),
    bonds: makeRingBonds(6).concat([
      [0, 6],
      [1, 7],
      [7, 8],
    ]),
    feed: true,
    desc: "芳香族化合物の一種。アスピリン合成ではアセチル化される原料として扱います。",
  },
  aceticAnhydride: {
    name: "無水酢酸",
    formula: "(CH3CO)2O",
    value: 1600,
    atoms: [
      ["C", -42, 0],
      ["C", -12, 0],
      ["O", -12, -32],
      ["O", 18, 0],
      ["C", 48, 0],
      ["O", 48, -32],
      ["C", 78, 0],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 5],
      [4, 6],
    ],
    feed: true,
    desc: "アセチル化剤として使われる酸無水物。アスピリン合成の反応相手です。",
  },
  aspirin: {
    name: "アスピリン",
    formula: "C9H8O4",
    value: 9000,
    atoms: makeRingStructure(["C", "C", "C", "C", "C", "C"], 34, [
      ["O", 0, -58],
      ["O", 56, -40],
      ["O", 72, -10],
      ["C", -50, -38],
      ["O", -72, -58],
      ["C", -74, -14],
    ]),
    bonds: makeRingBonds(6).concat([
      [0, 6],
      [1, 7],
      [7, 8],
      [2, 9],
      [9, 10],
      [9, 11],
    ]),
    desc: "代表的な医薬品分子。サリチル酸を無水酢酸でアセチル化して得られる、ゲーム内の初期ハイスコア目標です。",
  },
  aceticAcid: {
    name: "酢酸",
    formula: "CH3COOH",
    value: 400,
    atoms: [
      ["C", -22, 0],
      ["C", 12, 0],
      ["O", 32, -26],
      ["O", 34, 18],
      ["H", 54, 28],
      ["H", -44, -18],
      ["H", -48, 14],
      ["H", -18, 30],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [0, 5],
      [0, 6],
      [0, 7],
    ],
    desc: "アスピリン合成の副生成物として扱います。食酢の主成分としても知られます。",
  },
};

const moleculeLocale = {
  h2: {
    enName: "Hydrogen",
    enDesc: "The lightest diatomic molecule. It is important as a reducing agent in industrial routes such as ammonia and methanol synthesis.",
  },
  o2: {
    enName: "Oxygen",
    enDesc: "A diatomic molecule found in air. It reacts with hydrogen to form water, though real reactions require ignition or catalytic conditions.",
  },
  n2: {
    enName: "Nitrogen",
    enDesc: "The main component of air. Its triple bond is very strong, so ammonia synthesis requires high temperature, high pressure, and a catalyst.",
  },
  h2o: {
    enName: "Water",
    enDesc: "A bent molecule formed when hydrogen and oxygen react. In this game it marks the first successful synthesis route.",
  },
  nh3: {
    enName: "Ammonia",
    enDesc: "A foundation molecule for nitrogen fertilizers. The Haber-Bosch process synthesizes it from nitrogen and hydrogen with an iron-based catalyst.",
  },
  co2: {
    enName: "Carbon dioxide",
    enDesc: "A linear molecule used here as a carbon source for methanol and urea routes.",
  },
  methanol: {
    enName: "Methanol",
    enDesc: "The simplest alcohol. Industrially, it can be made from CO or CO2 and H2 with copper-based catalysts.",
  },
  urea: {
    enName: "Urea",
    enDesc: "An important fertilizer and resin feedstock. It is industrially synthesized from ammonia and carbon dioxide.",
  },
  salicylic: {
    enName: "Salicylic acid",
    enDesc: "An aromatic compound used as a precursor in aspirin synthesis, where it is acetylated.",
  },
  aceticAnhydride: {
    enName: "Acetic anhydride",
    enDesc: "An acetylating reagent used as the reaction partner for aspirin synthesis.",
  },
  aspirin: {
    enName: "Aspirin",
    enDesc: "A representative pharmaceutical molecule. In this game it is an early high-score target made by acetylating salicylic acid.",
  },
  aceticAcid: {
    enName: "Acetic acid",
    enDesc: "A byproduct in the aspirin route here, and also known as the main acidic component of vinegar.",
  },
};

const reactions = [
  {
    id: "water",
    name: "水の合成",
    equation: "2H2 + O2 -> 2H2O",
    skill: "spark",
    reactants: { h2: 2, o2: 1 },
    products: { h2o: 2 },
    desc: "水素と酸素が反応して水になります。ゲームでは安全な点火制御をスキルとして扱います。",
  },
  {
    id: "ammonia",
    name: "ハーバー・ボッシュ法",
    equation: "N2 + 3H2 -> 2NH3",
    skill: "haber",
    reactants: { n2: 1, h2: 3 },
    products: { nh3: 2 },
    desc: "窒素の強い結合を、高温高圧と触媒で乗り越えてアンモニアを作ります。",
  },
  {
    id: "methanol",
    name: "CO2 水素化",
    equation: "CO2 + 3H2 -> CH3OH + H2O",
    skill: "copper",
    reactants: { co2: 1, h2: 3 },
    products: { methanol: 1, h2o: 1 },
    desc: "CO2 を水素化してメタノールを得るルートです。ゲーム内では銅系触媒スキルで解禁します。",
  },
  {
    id: "urea",
    name: "尿素合成",
    equation: "2NH3 + CO2 -> CO(NH2)2 + H2O",
    skill: "ureaPlant",
    reactants: { nh3: 2, co2: 1 },
    products: { urea: 1, h2o: 1 },
    desc: "アンモニアと二酸化炭素から尿素を作る肥料化学ルートです。",
  },
  {
    id: "aspirin",
    name: "アスピリン合成",
    equation: "C7H6O3 + (CH3CO)2O -> C9H8O4 + CH3COOH",
    skill: "pharma",
    reactants: { salicylic: 1, aceticAnhydride: 1 },
    products: { aspirin: 1, aceticAcid: 1 },
    desc: "サリチル酸を無水酢酸でアセチル化する医薬品分子ルートです。",
  },
];

const reactionLocale = {
  water: {
    enName: "Water synthesis",
    enDesc: "Hydrogen and oxygen react to form water. The game treats safe ignition control as a skill.",
  },
  ammonia: {
    enName: "Haber-Bosch process",
    enDesc: "This route overcomes nitrogen's strong bond with high temperature, high pressure, and catalysis to make ammonia.",
  },
  methanol: {
    enName: "CO2 hydrogenation",
    enDesc: "A route that hydrogenates CO2 to methanol, unlocked here through a copper catalyst skill.",
  },
  urea: {
    enName: "Urea synthesis",
    enDesc: "A fertilizer chemistry route that combines ammonia and carbon dioxide into urea.",
  },
  aspirin: {
    enName: "Aspirin synthesis",
    enDesc: "A pharmaceutical route that acetylates salicylic acid with acetic anhydride.",
  },
};

const skills = {
  air: {
    name: "空気分離",
    cost: 50,
    maxLevel: 8,
    unlocks: ["o2", "n2"],
    desc: "酸素と窒素を材料として扱えるようにします。",
  },
  spark: {
    name: "点火制御",
    cost: 140,
    maxLevel: 8,
    prereq: ["air"],
    desc: "水素と酸素の衝突で水を合成できるようにします。",
  },
  electrolysis: {
    name: "電解ライン",
    cost: 320,
    maxLevel: 10,
    prereq: ["spark"],
    desc: "クリック量を増やし、空気分離後の酸素供給も少し増やします。",
  },
  haber: {
    name: "ハーバー・ボッシュ法",
    cost: 900,
    maxLevel: 10,
    prereq: ["air", "electrolysis"],
    desc: "窒素と水素からアンモニアを合成できるようにします。",
  },
  co2Capture: {
    name: "CO2 回収",
    cost: 2400,
    maxLevel: 10,
    prereq: ["haber"],
    unlocks: ["co2"],
    desc: "二酸化炭素を材料として扱えるようにします。",
  },
  copper: {
    name: "銅系触媒",
    cost: 6200,
    maxLevel: 10,
    prereq: ["co2Capture"],
    desc: "CO2 と水素からメタノールを合成できるようにします。",
  },
  ureaPlant: {
    name: "尿素プラント",
    cost: 15000,
    maxLevel: 8,
    prereq: ["haber", "co2Capture"],
    desc: "アンモニアと CO2 から尿素を合成できるようにします。",
  },
  pharma: {
    name: "医薬品合成ルート",
    cost: 42000,
    maxLevel: 8,
    prereq: ["copper", "ureaPlant"],
    unlocks: ["salicylic", "aceticAnhydride"],
    desc: "サリチル酸と無水酢酸を扱い、アスピリン合成を解禁します。",
  },
  hotBath: {
    name: "恒温反応槽",
    cost: 90000,
    maxLevel: 12,
    prereq: ["copper"],
    desc: "温度制御で分子の移動速度を上げ、衝突頻度を増やします。",
  },
  pressurePump: {
    name: "高圧ポンプ",
    cost: 180000,
    maxLevel: 12,
    prereq: ["haber", "hotBath"],
    desc: "高圧条件でクリック投入量を大きく増やします。",
  },
  flowChemistry: {
    name: "フロー合成",
    cost: 420000,
    maxLevel: 12,
    prereq: ["pressurePump", "pharma"],
    desc: "連続投入ラインでクリック投入と自動投入をさらに強化します。",
  },
  molPreview: {
    name: "mol到達テストライン",
    cost: 1200000,
    maxLevel: 8,
    prereq: ["flowChemistry"],
    desc: "テストプレイ用の超強化ライン。1 mol 到達演出を確認しやすくします。",
  },
  quantumCatalyst: {
    name: "量子触媒アレイ",
    cost: 6000000,
    maxLevel: 8,
    prereq: ["molPreview"],
    desc: "反応速度と投入量を桁違いに引き上げる終盤用アップグレードです。",
  },
  avogadroEngine: {
    name: "アボガドロエンジン",
    cost: 25000000,
    maxLevel: 6,
    prereq: ["quantumCatalyst"],
    desc: "1 mol 到達を検証するための極端に強力なテスト用合成エンジンです。",
  },
};

const skillLocale = {
  air: { enName: "Air separation", enDesc: "Allows oxygen and nitrogen to be used as feed molecules." },
  spark: { enName: "Ignition control", enDesc: "Allows hydrogen and oxygen collisions to synthesize water." },
  electrolysis: { enName: "Electrolysis line", enDesc: "Increases click yield and adds a little oxygen supply after air separation." },
  haber: { enName: "Haber-Bosch process", enDesc: "Allows ammonia synthesis from nitrogen and hydrogen." },
  co2Capture: { enName: "CO2 capture", enDesc: "Allows carbon dioxide to be used as a feed molecule." },
  copper: { enName: "Copper catalyst", enDesc: "Allows methanol synthesis from CO2 and hydrogen." },
  ureaPlant: { enName: "Urea plant", enDesc: "Allows urea synthesis from ammonia and CO2." },
  pharma: { enName: "Pharmaceutical route", enDesc: "Unlocks salicylic acid and acetic anhydride for aspirin synthesis." },
  hotBath: { enName: "Thermostated reactor", enDesc: "Temperature control increases molecular speed and collision frequency." },
  pressurePump: { enName: "High-pressure pump", enDesc: "High-pressure conditions greatly increase click feed." },
  flowChemistry: { enName: "Flow chemistry", enDesc: "Continuous feed lines further strengthen click and auto feed." },
  molPreview: { enName: "1 mol preview line", enDesc: "A supercharged test line that makes the 1 mol celebration much easier to trigger." },
  quantumCatalyst: { enName: "Quantum catalyst array", enDesc: "A late-game upgrade that raises reaction speed and feed rates by orders of magnitude." },
  avogadroEngine: { enName: "Avogadro engine", enDesc: "An extremely powerful test synthesis engine for reaching the 1 mol celebration." },
};

const skillTreePositions = {
  air: [7, 38],
  spark: [22, 18],
  electrolysis: [22, 58],
  haber: [42, 38],
  co2Capture: [58, 38],
  copper: [74, 20],
  ureaPlant: [74, 56],
  pharma: [90, 38],
  hotBath: [58, 15],
  pressurePump: [74, 38],
  flowChemistry: [94, 60],
  molPreview: [98, 18],
  quantumCatalyst: [110, 38],
  avogadroEngine: [122, 18],
};

const milestones = [
  { value: 1e3, title: "研究価値 1,000", detail: "基礎合成が安定してきました。", enTitle: "Research value 1,000", enDetail: "Basic synthesis is stabilizing." },
  { value: 1e5, title: "反応ネットワーク拡大", detail: "複数の分子をつなぐルートが見えてきました。", enTitle: "Reaction network expanded", enDetail: "Routes linking multiple molecules are emerging." },
  { value: 1e7, title: "工業化フェーズ", detail: "合成速度と価値が大きく伸びます。", enTitle: "Industrial phase", enDetail: "Synthesis speed and value are scaling up." },
  { value: 1e9, title: "医薬品スケールへ", detail: "複雑な有機分子を狙える段階です。", enTitle: "Toward pharma scale", enDetail: "Complex organic molecules are now realistic targets." },
  { value: AVOGADRO, title: "1 mol 達成", detail: "アボガドロ定数を突破しました。", enTitle: "1 mol reached", enDetail: "Avogadro's constant has been exceeded." },
];

const els = {
  canvas: document.querySelector("#reactor-canvas"),
  scoreValue: document.querySelector("#score-value"),
  molProgressText: document.querySelector("#mol-progress-text"),
  molProgressBar: document.querySelector("#mol-progress-bar"),
  activeName: document.querySelector("#active-name"),
  activeDesc: document.querySelector("#active-desc"),
  perClick: document.querySelector("#per-click"),
  perSecond: document.querySelector("#per-second"),
  clickTarget: document.querySelector("#click-target"),
  languageToggle: document.querySelector("#language-toggle"),
  openSkillTree: document.querySelector("#open-skill-tree"),
  skillTreeDialog: document.querySelector("#skill-tree-dialog"),
  skillTreeMap: document.querySelector("#skill-tree-map"),
  feedModeButtons: [...document.querySelectorAll("[data-feed-mode]")],
  qualityButtons: [...document.querySelectorAll("[data-quality]")],
  moleculeList: document.querySelector("#molecule-list"),
  skillList: document.querySelector("#skill-list"),
  reactionList: document.querySelector("#reaction-list"),
  reactionTitle: document.querySelector("#reaction-title"),
  reactionDetail: document.querySelector("#reaction-detail"),
  infoName: document.querySelector("#info-name"),
  infoFormula: document.querySelector("#info-formula"),
  infoDesc: document.querySelector("#info-desc"),
  floatingTextLayer: document.querySelector("#floating-text-layer"),
  eventBanner: document.querySelector("#event-banner"),
  eventTitle: document.querySelector("#event-title"),
  eventDetail: document.querySelector("#event-detail"),
  goalDialog: document.querySelector("#goal-dialog"),
  resetButton: document.querySelector("#reset-button"),
  muteToggle: document.querySelector("#mute-toggle"),
  tabs: [...document.querySelectorAll(".tab")],
  panels: [...document.querySelectorAll(".panel")],
};

const ctx = els.canvas.getContext("2d");
const state = loadState();
const ambient = [];
const visualSpawnDebt = {};
const reactionEffects = [];
let lastFrame = performance.now();
let saveTimer = 0;
let uiTimer = 0;
let panelDirty = true;
let bannerTimer = 0;
let audioContext = null;
let infoKey = state.active;
let zoom = 1;

resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  seedAmbient();
});
seedAmbient();
bindEvents();
applyLanguage();
showEvent(t("synthReadyTitle"), t("synthReadyDetail"));
updateUi();
requestAnimationFrame(tick);

function makeRingStructure(elements, radius, extraAtoms) {
  const ring = elements.map((element, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / elements.length;
    return [element, Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
  return ring.concat(extraAtoms);
}

function makeRingBonds(count) {
  return Array.from({ length: count }, (_, index) => [index, (index + 1) % count]);
}

function createInitialState() {
  return {
    score: 0,
    totalCount: 0,
    active: "h2",
    unlocked: ["h2"],
    synthesized: [],
    skills: {},
    inventory: {
      h2: 0,
    },
    reachedMilestones: [],
    goalShown: false,
    language: "ja",
    feedMode: "single",
    visualQuality: "mid",
    feedRatios: {},
    muted: false,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== "object") return createInitialState();
    const base = createInitialState();
    return {
      ...base,
      ...saved,
      skills: { ...base.skills, ...(saved.skills || {}) },
      inventory: { ...base.inventory, ...(saved.inventory || {}) },
      feedRatios: { ...base.feedRatios, ...(saved.feedRatios || {}) },
      unlocked: Array.isArray(saved.unlocked) ? saved.unlocked : base.unlocked,
      synthesized: Array.isArray(saved.synthesized) ? saved.synthesized : base.synthesized,
      reachedMilestones: Array.isArray(saved.reachedMilestones) ? saved.reachedMilestones : base.reachedMilestones,
    };
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function bindEvents() {
  els.canvas.addEventListener("pointerdown", (event) => {
    handleMaterialClick(event.clientX, event.clientY);
  });

  els.languageToggle.addEventListener("click", () => {
    state.language = state.language === "ja" ? "en" : "ja";
    panelDirty = true;
    applyLanguage();
    updateUi();
    saveState();
  });

  els.muteToggle.addEventListener("click", () => {
    state.muted = !state.muted;
    updateUi();
    saveState();
  });

  els.canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      zoom = clamp(zoom + direction * 0.12, 0.55, 2.4);
    },
    { passive: false },
  );

  els.clickTarget.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const rect = els.canvas.getBoundingClientRect();
    handleMaterialClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  els.clickTarget.addEventListener("click", (event) => event.preventDefault());

  els.feedModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.feedMode = button.dataset.feedMode;
      panelDirty = true;
      updateUi();
      saveState();
    });
  });

  els.qualityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.visualQuality = button.dataset.quality;
      rebalanceVisibleMolecules();
      panelDirty = true;
      updateUi();
      saveState();
    });
  });

  els.resetButton.addEventListener("click", () => {
    if (!window.confirm(t("resetConfirm"))) return;
    localStorage.removeItem(SAVE_KEY);
    Object.assign(state, createInitialState());
    infoKey = state.active;
    reactionEffects.length = 0;
    panelDirty = true;
    seedAmbient();
    applyLanguage();
    showEvent(t("resetTitle"), t("resetDetail"));
    updateUi();
  });

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      els.tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      els.panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === `panel-${tab.dataset.panel}`));
      panelDirty = true;
    });
  });

  els.openSkillTree.addEventListener("click", () => {
    renderSkillTree();
    els.skillTreeDialog.showModal();
  });
}

function handleMaterialClick(clientX, clientY) {
  ensureAudio();
  els.clickTarget.classList.add("is-pressed");
  window.setTimeout(() => els.clickTarget.classList.remove("is-pressed"), 90);
  const amount = getClickAmount();
  const additions = getFeedAdditions(amount);
  for (const [key, value] of Object.entries(additions)) {
    addInventory(key, value, true);
  }
  spawnFloatText(clientX, clientY, formatFeedFloat(additions));
  rebalanceVisibleMolecules(clientX, clientY, state.active);
  playClickSound();
  panelDirty = true;
  updateUi();
}

function getFeedAdditions(amount) {
  if (state.feedMode !== "mix") return { [state.active]: amount };
  return distributeAmount(amount, getFeedableKeys());
}

function getFeedableKeys() {
  return Object.entries(molecules)
    .filter(([key, molecule]) => molecule.feed && state.unlocked.includes(key))
    .map(([key]) => key);
}

function distributeAmount(amount, keys) {
  const validKeys = keys.length > 0 ? keys : [state.active];
  const totalWeight = validKeys.reduce((sum, key) => sum + getFeedRatio(key), 0) || validKeys.length;
  return validKeys.reduce((result, key) => {
    result[key] = amount * (getFeedRatio(key) / totalWeight);
    return result;
  }, {});
}

function getFeedRatio(key) {
  const value = Number(state.feedRatios[key]);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function formatFeedFloat(additions) {
  const entries = Object.entries(additions);
  if (entries.length === 1) {
    const [key, amount] = entries[0];
    return `+${formatNumber(amount)} ${molecules[key].formula}`;
  }
  return `+${formatNumber(entries.reduce((sum, [, amount]) => sum + amount, 0))} mix`;
}

function getClickAmount() {
  let amount = 1;
  amount += getSkillLevel("electrolysis") * 4;
  amount += getSkillLevel("haber") * 3;
  amount += getSkillLevel("pharma") * 12;
  amount *= Math.pow(5, getSkillLevel("pressurePump"));
  amount *= Math.pow(3, getSkillLevel("flowChemistry"));
  amount *= Math.pow(1000, getSkillLevel("molPreview"));
  amount *= Math.pow(1e6, getSkillLevel("quantumCatalyst"));
  amount *= Math.pow(1e12, getSkillLevel("avogadroEngine"));
  return amount;
}

function getVisibleTargetCount() {
  const inventoryTotal = Object.values(state.inventory).reduce((sum, value) => sum + Math.max(0, value || 0), 0);
  if (inventoryTotal <= 0) return 64;
  const qualityTarget = VISIBLE_TARGETS[state.visualQuality] || VISIBLE_TARGETS.mid;
  return Math.min(VISIBLE_MOLECULE_LIMIT, qualityTarget, Math.max(90, Math.ceil(Math.sqrt(inventoryTotal) * 9)));
}

function getAutoFeedPerSecond() {
  let total = 0;
  total += getSkillLevel("air") * 0.7;
  total += getSkillLevel("electrolysis") * 1.4;
  total += getSkillLevel("co2Capture") * 0.5;
  total += getSkillLevel("pharma") * 0.28;
  total += getSkillLevel("flowChemistry") * 4.2;
  total *= Math.pow(100, getSkillLevel("molPreview"));
  total *= Math.pow(1e5, getSkillLevel("quantumCatalyst"));
  total *= Math.pow(1e10, getSkillLevel("avogadroEngine"));
  return total;
}

function addInventory(key, amount, scoreIt = false) {
  state.inventory[key] = (state.inventory[key] || 0) + amount;
  state.totalCount += amount;
  if (scoreIt) {
    state.score += amount * molecules[key].value;
  }
  if (!state.unlocked.includes(key)) state.unlocked.push(key);
  checkMilestones();
}

function spendInventory(requirements) {
  for (const [key, amount] of Object.entries(requirements)) {
    state.inventory[key] -= amount;
  }
}

function canReact(reaction) {
  if (getSkillLevel(reaction.skill) <= 0) return false;
  const requirements = scaleRequirements(reaction.reactants, getReactionScoreMultiplier());
  return Object.entries(requirements).every(([key, amount]) => (state.inventory[key] || 0) >= amount);
}

function getReactionValue(reaction) {
  return Object.entries(reaction.products).reduce((sum, [key, amount]) => sum + molecules[key].value * amount, 0);
}

function synthesize(reaction, x = null, y = null) {
  const multiplier = getReactionScoreMultiplier();
  spendInventory(scaleRequirements(reaction.reactants, multiplier));
  let value = 0;
  for (const [key, amount] of Object.entries(reaction.products)) {
    const scaledAmount = amount * multiplier;
    state.inventory[key] = (state.inventory[key] || 0) + scaledAmount;
    state.totalCount += scaledAmount;
    value += molecules[key].value * scaledAmount;
    if (!state.synthesized.includes(key)) state.synthesized.push(key);
    if (!state.unlocked.includes(key)) state.unlocked.push(key);
    addProductMoleculesAt(key, x, y, Math.min(5, Math.max(1, Math.ceil(amount))));
  }
  state.score += value;
  spawnReactionEffect(x, y, Object.keys(reaction.products));
  showEvent(reaction.name, `${reaction.equation} / +${formatNumber(value)} value`);
  updateReactionCaption(reaction, true);
  playFeverSound();
  triggerFeverVisuals();
  checkMilestones();
  panelDirty = true;
  updateUi();
}

function getReactionScoreMultiplier() {
  const density = REACTION_DENSITY_MULTIPLIER[state.visualQuality] || REACTION_DENSITY_MULTIPLIER.mid;
  return density * Math.pow(10, getSkillLevel("quantumCatalyst")) * Math.pow(1e6, getSkillLevel("avogadroEngine"));
}

function scaleRequirements(requirements, multiplier) {
  return Object.fromEntries(Object.entries(requirements).map(([key, amount]) => [key, amount * multiplier]));
}

function buySkill(key) {
  const skill = skills[key];
  if (!canBuySkill(key)) return;
  ensureAudio();
  state.score -= getSkillCost(key);
  state.skills[key] = getSkillLevel(key) + 1;
  for (const molecule of skill.unlocks || []) {
    if (!state.unlocked.includes(molecule)) state.unlocked.push(molecule);
  }
  showEvent(getSkillName(key), getSkillDesc(key));
  playUpgradeSound();
  panelDirty = true;
  updateUi();
  saveState();
}

function canBuySkill(key) {
  const skill = skills[key];
  if (getSkillLevel(key) >= getSkillMaxLevel(key)) return false;
  if (state.score < getSkillCost(key)) return false;
  return (skill.prereq || []).every((prereq) => getSkillLevel(prereq) > 0);
}

function getSkillLevel(key) {
  const raw = state.skills[key];
  if (raw === true) return 1;
  if (raw === false || raw === undefined) return 0;
  const level = Number(raw);
  return Number.isFinite(level) ? level : 0;
}

function getSkillMaxLevel(key) {
  return skills[key].maxLevel || 1;
}

function getSkillCost(key) {
  const level = getSkillLevel(key);
  return skills[key].cost * Math.pow(2.35, level);
}

function updateUi() {
  const mol = state.totalCount / AVOGADRO;
  const logProgress = Math.min(100, (Math.log10(state.totalCount + 1) / Math.log10(AVOGADRO)) * 100);
  const active = molecules[state.active];

  els.scoreValue.textContent = formatNumber(state.score);
  els.molProgressText.textContent = `${formatMol(mol)} ${t("molEquivalent")} / ${formatNumber(state.totalCount)} molecules`;
  els.molProgressBar.style.width = `${logProgress}%`;
  els.activeName.textContent = `${getMoleculeName(state.active)} ${active.formula}`;
  els.activeDesc.textContent = getMoleculeDesc(state.active);
  els.perClick.textContent = `+${formatNumber(getClickAmount())}`;
  els.perSecond.textContent = `${formatNumber(getAutoFeedPerSecond())}/s`;
  els.feedModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.feedMode === state.feedMode);
    button.textContent = button.dataset.feedMode === "single" ? t("feedSingle") : t("feedMix");
  });
  els.qualityButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.quality === state.visualQuality);
  });
  els.muteToggle.textContent = state.muted ? t("soundOff") : t("soundOn");
  els.muteToggle.classList.toggle("is-active", !state.muted);

  if (panelDirty) {
    renderMoleculeList();
    renderSkillList();
    renderReactionList();
    if (els.skillTreeDialog.open) renderSkillTree();
    panelDirty = false;
  } else {
    updatePanelDynamicState();
  }
  updateInfo(infoKey);
}

function updatePanelDynamicState() {
  els.skillList.querySelectorAll("[data-skill-key]").forEach((button) => {
    const key = button.dataset.skillKey;
    button.disabled = getSkillLevel(key) >= getSkillMaxLevel(key) || !canBuySkill(key);
    const cost = button.querySelector("[data-skill-cost]");
    if (cost) {
      const level = getSkillLevel(key);
      const maxLevel = getSkillMaxLevel(key);
      cost.textContent = `${t("level")} ${level}/${maxLevel} ${level >= maxLevel ? t("acquired") : formatNumber(getSkillCost(key))}`;
    }
  });
}

function renderMoleculeList() {
  els.moleculeList.replaceChildren();
  for (const [key, molecule] of Object.entries(molecules)) {
    const unlocked = state.unlocked.includes(key) || state.synthesized.includes(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `molecule-row${state.active === key ? " is-active" : ""}`;
    button.disabled = !unlocked || !molecule.feed;
    button.innerHTML = `
      <span class="row-head">
        <strong>${getMoleculeName(key)}</strong>
        <em>${formatNumber(state.inventory[key] || 0)}</em>
      </span>
      <span class="badge-line">
        <span class="badge ${unlocked ? "ok" : "locked"}">${unlocked ? molecule.formula : t("undiscovered")}</span>
        <span class="badge">${molecule.feed ? t("feedMaterial") : t("product")}</span>
        <span class="badge">${t("value")} ${formatNumber(molecule.value)}</span>
      </span>
      <span class="row-desc">${unlocked ? getMoleculeDesc(key) : t("lockedText")}</span>
      ${molecule.feed && unlocked ? renderRatioControl(key) : ""}
    `;
    button.addEventListener("click", (event) => {
      if (!button.disabled && !eventTargetIsRatioControl(event)) {
        state.active = key;
        infoKey = key;
        panelDirty = true;
        updateUi();
      }
    });
    button.addEventListener("mouseenter", () => {
      infoKey = key;
      updateInfo(infoKey);
    });
    button.addEventListener("focus", () => {
      infoKey = key;
      updateInfo(infoKey);
    });
    const slider = button.querySelector("[data-ratio-key]");
    if (slider) {
      slider.addEventListener("pointerdown", (event) => event.stopPropagation());
      slider.addEventListener("click", (event) => event.stopPropagation());
      slider.addEventListener("input", (event) => {
        event.stopPropagation();
        state.feedRatios[key] = Number(event.target.value);
        panelDirty = true;
        updateUi();
        saveState();
      });
    }
    els.moleculeList.append(button);
  }
}

function renderRatioControl(key) {
  return `
    <label class="ratio-control">
      <span>${t("feedShare")} ${getFeedRatio(key)}</span>
      <input type="range" min="0" max="10" step="1" value="${getFeedRatio(key)}" data-ratio-key="${key}" />
    </label>
  `;
}

function eventTargetIsRatioControl(event) {
  return Boolean(event.target.closest && event.target.closest(".ratio-control"));
}

function renderSkillList() {
  els.skillList.replaceChildren();
  for (const [key, skill] of Object.entries(skills)) {
    const level = getSkillLevel(key);
    const maxLevel = getSkillMaxLevel(key);
    const owned = level > 0;
    const prereqOk = (skill.prereq || []).every((prereq) => getSkillLevel(prereq) > 0);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skill-row";
    button.dataset.skillKey = key;
    button.disabled = level >= maxLevel || !canBuySkill(key);
    button.innerHTML = `
      <span class="row-head">
        <strong>${getSkillName(key)}</strong>
        <em data-skill-cost>${t("level")} ${level}/${maxLevel} ${level >= maxLevel ? t("acquired") : formatNumber(getSkillCost(key))}</em>
      </span>
      <span class="badge-line">
        <span class="badge ${owned ? "ok" : prereqOk ? "" : "locked"}">${owned ? "ACTIVE" : prereqOk ? t("ready") : t("locked")}</span>
        ${(skill.prereq || []).map((prereq) => `<span class="badge">${getSkillName(prereq)}</span>`).join("")}
      </span>
      <span class="row-desc">${getSkillDesc(key)}</span>
    `;
    button.addEventListener("click", () => buySkill(key));
    els.skillList.append(button);
  }
}

function renderSkillTree() {
  els.skillTreeMap.replaceChildren();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-links");
  svg.setAttribute("viewBox", "0 0 100 72");
  svg.setAttribute("preserveAspectRatio", "none");

  for (const [key, skill] of Object.entries(skills)) {
    const [x, y] = skillTreePositions[key];
    for (const prereq of skill.prereq || []) {
      const [fromX, fromY] = skillTreePositions[prereq];
      if (fromX === undefined || x === undefined) continue;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", fromX);
      line.setAttribute("y1", fromY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", y);
      line.setAttribute("class", getSkillLevel(prereq) > 0 ? "is-active" : "");
      svg.append(line);
    }
  }

  els.skillTreeMap.append(svg);

  for (const [key, skill] of Object.entries(skills)) {
    const [x, y] = skillTreePositions[key];
    if (x === undefined) continue;
    const level = getSkillLevel(key);
    const maxLevel = getSkillMaxLevel(key);
    const owned = level > 0;
    const prereqOk = (skill.prereq || []).every((prereq) => getSkillLevel(prereq) > 0);
    const node = document.createElement("button");
    node.type = "button";
    node.className = `tree-node ${owned ? "is-owned" : prereqOk ? "is-ready" : "is-locked"}`;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    node.disabled = level >= maxLevel || !canBuySkill(key);
    node.innerHTML = `
      <strong>${getSkillName(key)}</strong>
      <span>${t("level")} ${level}/${maxLevel} ${level >= maxLevel ? t("acquired") : `${formatNumber(getSkillCost(key))} value`}</span>
      <small>${getSkillDesc(key)}</small>
    `;
    node.addEventListener("click", () => buySkill(key));
    els.skillTreeMap.append(node);
  }
}

function renderReactionList() {
  els.reactionList.replaceChildren();
  for (const reaction of reactions) {
    const enabled = getSkillLevel(reaction.skill) > 0;
    const ready = canReact(reaction);
    const row = document.createElement("article");
    row.className = "reaction-row";
    row.innerHTML = `
      <span class="row-head">
        <strong>${getReactionName(reaction.id)}</strong>
        <em>${ready ? t("ready") : enabled ? t("materialWaiting") : t("lockedReaction")}</em>
      </span>
      <span class="formula">${reaction.equation}</span>
      <span class="badge-line">
        <span class="badge ${enabled ? "ok" : "locked"}">${getSkillName(reaction.skill)}</span>
        <span class="badge">${t("value")} ${formatNumber(getReactionValue(reaction))}</span>
      </span>
      <span class="row-desc">${getReactionDesc(reaction.id)}</span>
    `;
    els.reactionList.append(row);
  }
}

function updateInfo(key) {
  const molecule = molecules[key];
  els.infoName.textContent = `${getMoleculeName(key)} ${molecule.formula}`;
  els.infoFormula.textContent = molecule.formula;
  els.infoDesc.textContent = getMoleculeDesc(key);
}

function updateReactionCaption(reaction, success = false) {
  if (!reaction) {
    els.reactionTitle.textContent = "Zoom Reactor";
    els.reactionDetail.textContent = t("reactorIdle");
    return;
  }
  els.reactionTitle.textContent = success ? `${t("reactionSuccess")}: ${getReactionName(reaction.id)}` : getReactionName(reaction.id);
  els.reactionDetail.textContent = reaction.equation;
}

function checkMilestones() {
  for (const milestone of milestones) {
    const metric = milestone.value === AVOGADRO ? state.totalCount : state.score;
    if (metric < milestone.value || state.reachedMilestones.includes(milestone.value)) continue;
    state.reachedMilestones.push(milestone.value);
    if (milestone.value === AVOGADRO && !state.goalShown) {
      state.goalShown = true;
      showEvent(t("goalEventTitle"), t("goalEventDetail"));
      playGoalFanfare();
      triggerGoalParty();
      window.setTimeout(() => {
        if (!els.goalDialog.open) els.goalDialog.showModal();
      }, 500);
    } else {
      showEvent(getMilestoneTitle(milestone), getMilestoneDetail(milestone));
      playFeverSound();
    }
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) < 1000) return Math.floor(value).toLocaleString("ja-JP");
  if (Math.abs(value) < 1e6) return Math.floor(value).toLocaleString("ja-JP");
  return value.toExponential(2);
}

function formatMol(value) {
  if (value === 0) return "0";
  if (value < 0.001) return value.toExponential(2);
  return value.toLocaleString("ja-JP", { maximumFractionDigits: 4 });
}

function showEvent(title, detail) {
  els.eventTitle.textContent = title;
  els.eventDetail.textContent = detail;
  els.eventBanner.classList.add("is-visible");
  window.clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => {
    els.eventBanner.classList.remove("is-visible");
  }, 2600);
}

function t(key) {
  return (i18n[state.language] && i18n[state.language][key]) || i18n.ja[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  els.languageToggle.textContent = state.language === "ja" ? "EN" : "JA";
  els.clickTarget.textContent = t("clickButton");
  els.feedModeButtons.forEach((button) => {
    button.textContent = button.dataset.feedMode === "single" ? t("feedSingle") : t("feedMix");
  });
}

function getMoleculeName(key) {
  const locale = moleculeLocale[key] || {};
  return state.language === "en" ? locale.enName || molecules[key].name : molecules[key].name;
}

function getMoleculeDesc(key) {
  const locale = moleculeLocale[key] || {};
  return state.language === "en" ? locale.enDesc || molecules[key].desc : molecules[key].desc;
}

function getSkillName(key) {
  const locale = skillLocale[key] || {};
  return state.language === "en" ? locale.enName || skills[key].name : skills[key].name;
}

function getSkillDesc(key) {
  const locale = skillLocale[key] || {};
  return state.language === "en" ? locale.enDesc || skills[key].desc : skills[key].desc;
}

function getReactionName(id) {
  const reaction = reactions.find((item) => item.id === id);
  const locale = reactionLocale[id] || {};
  return state.language === "en" ? locale.enName || reaction.name : reaction.name;
}

function getReactionDesc(id) {
  const reaction = reactions.find((item) => item.id === id);
  const locale = reactionLocale[id] || {};
  return state.language === "en" ? locale.enDesc || reaction.desc : reaction.desc;
}

function getMilestoneTitle(milestone) {
  return state.language === "en" ? milestone.enTitle || milestone.title : milestone.title;
}

function getMilestoneDetail(milestone) {
  return state.language === "en" ? milestone.enDetail || milestone.detail : milestone.detail;
}

function spawnFloatText(x, y, text) {
  const node = document.createElement("span");
  node.className = "float-text";
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  els.floatingTextLayer.append(node);
  node.addEventListener("animationend", () => node.remove(), { once: true });
}

function triggerFeverVisuals() {
  document.body.classList.add("is-fever");
  window.setTimeout(() => document.body.classList.remove("is-fever"), 920);
}

function triggerGoalParty() {
  document.body.classList.add("is-goal-party");
  for (let i = 0; i < 18; i += 1) {
    window.setTimeout(() => {
      const rect = els.canvas.getBoundingClientRect();
      spawnReactionEffect(Math.random() * rect.width, Math.random() * rect.height, ["aspirin"]);
    }, i * 120);
  }
  window.setTimeout(() => document.body.classList.remove("is-goal-party"), 5200);
}

function tick(now) {
  const delta = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  runAutoFeed(delta);
  runCollisionReactions(delta);
  uiTimer += delta;
  if (uiTimer > 0.25) {
    uiTimer = 0;
    updateUi();
  }
  saveTimer += delta;
  if (saveTimer > 2) {
    saveTimer = 0;
    saveState();
  }

  draw(now, delta);
  requestAnimationFrame(tick);
}

function runAutoFeed(delta) {
  if (state.feedMode === "mix") {
    const total = getAutoFeedPerSecond() * delta;
    if (total > 0) {
      for (const [key, amount] of Object.entries(distributeAmount(total, getFeedableKeys()))) {
  feedMolecule(key, amount);
      }
    }
    return;
  }

  if (getSkillLevel("air") > 0) {
    feedMolecule("o2", 0.25 * getSkillLevel("air") * delta);
    feedMolecule("n2", 0.45 * getSkillLevel("air") * delta);
  }
  if (getSkillLevel("electrolysis") > 0) {
    feedMolecule("h2", 1.2 * getSkillLevel("electrolysis") * delta);
    feedMolecule("o2", 0.2 * getSkillLevel("electrolysis") * delta);
  }
  if (getSkillLevel("co2Capture") > 0) {
    feedMolecule("co2", 0.5 * getSkillLevel("co2Capture") * delta);
  }
  if (getSkillLevel("pharma") > 0) {
    feedMolecule("salicylic", 0.14 * getSkillLevel("pharma") * delta);
    feedMolecule("aceticAnhydride", 0.14 * getSkillLevel("pharma") * delta);
  }
}

function feedMolecule(key, amount) {
  addInventory(key, amount, true);
  visualSpawnDebt[key] = (visualSpawnDebt[key] || 0) + amount;
  if (visualSpawnDebt[key] >= 1) {
    visualSpawnDebt[key] = 0;
    rebalanceVisibleMolecules(null, null, key);
  }
}

function runCollisionReactions(delta) {
  detectMoleculeCollisions();
}

function detectMoleculeCollisions() {
  const cellSize = 72;
  const grid = new Map();
  for (let i = 0; i < ambient.length; i += 1) {
    const item = ambient[i];
    const gx = Math.floor(item.x / cellSize);
    const gy = Math.floor(item.y / cellSize);
    const id = `${gx},${gy}`;
    if (!grid.has(id)) grid.set(id, []);
    grid.get(id).push(i);
  }

  const checked = new Set();
  for (let i = 0; i < ambient.length; i += 1) {
    const a = ambient[i];
    const gx = Math.floor(a.x / cellSize);
    const gy = Math.floor(a.y / cellSize);
    for (let ox = -1; ox <= 1; ox += 1) {
      for (let oy = -1; oy <= 1; oy += 1) {
        const bucket = grid.get(`${gx + ox},${gy + oy}`);
        if (!bucket) continue;
        for (const j of bucket) {
          if (j <= i) continue;
          const pairId = `${i}:${j}`;
          if (checked.has(pairId)) continue;
          checked.add(pairId);
          const b = ambient[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const minDistance = getCollisionRadius(a.key, a.scale) + getCollisionRadius(b.key, b.scale);
          if (dx * dx + dy * dy > minDistance * minDistance) continue;

          const reaction = findCollisionReaction(a.key, b.key);
          if (!reaction) {
            resolveElasticCollision(a, b, dx, dy);
            continue;
          }

          const selected = collectVisibleReactants(reaction, a, b);
          if (!selected) {
            resolveElasticCollision(a, b, dx, dy);
            continue;
          }

          const cx = selected.reduce((sum, item) => sum + item.x, 0) / selected.length;
          const cy = selected.reduce((sum, item) => sum + item.y, 0) / selected.length;
          removeVisibleMolecules(selected);
          synthesize(reaction, cx, cy);
          return;
        }
      }
    }
  }
}

function findCollisionReaction(aKey, bKey) {
  return reactions.find((reaction) => {
    if (!canReact(reaction)) return false;
    const required = reaction.reactants;
    if (!required[aKey] || !required[bKey]) return false;
    if (aKey === bKey && required[aKey] < 2) return false;
    return true;
  });
}

function collectVisibleReactants(reaction, first, second) {
  const needed = { ...reaction.reactants };
  const selected = [];
  if (!takeVisibleReactant(first, needed, selected)) return null;
  if (!takeVisibleReactant(second, needed, selected)) return null;

  const candidates = ambient
    .filter((item) => item !== first && item !== second && needed[item.key] > 0)
    .sort((a, b) => distanceToSelection(a, selected) - distanceToSelection(b, selected));

  for (const candidate of candidates) {
    takeVisibleReactant(candidate, needed, selected);
    if (Object.values(needed).every((amount) => amount <= 0)) return selected;
  }

  return Object.values(needed).every((amount) => amount <= 0) ? selected : null;
}

function takeVisibleReactant(item, needed, selected) {
  if (!needed[item.key] || needed[item.key] <= 0) return false;
  needed[item.key] -= 1;
  selected.push(item);
  return true;
}

function distanceToSelection(item, selected) {
  if (selected.length === 0) return 0;
  return Math.min(...selected.map((other) => (item.x - other.x) ** 2 + (item.y - other.y) ** 2));
}

function removeVisibleMolecules(items) {
  const removeSet = new Set(items);
  for (let i = ambient.length - 1; i >= 0; i -= 1) {
    if (removeSet.has(ambient[i])) ambient.splice(i, 1);
  }
}

function resolveElasticCollision(a, b, dx, dy) {
  const distance = Math.max(1, Math.hypot(dx, dy));
  const nx = dx / distance;
  const ny = dy / distance;
  const push = 12;
  a.x += nx * push;
  a.y += ny * push;
  b.x -= nx * push;
  b.y -= ny * push;
  const avx = a.vx;
  const avy = a.vy;
  a.vx = b.vx * 0.88 + nx * 18;
  a.vy = b.vy * 0.88 + ny * 18;
  b.vx = avx * 0.88 - nx * 18;
  b.vy = avy * 0.88 - ny * 18;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = els.canvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;
  els.canvas.width = Math.floor(width * dpr);
  els.canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedAmbient() {
  ambient.length = 0;
  rebalanceVisibleMolecules();
}

function rebalanceVisibleMolecules(focusClientX = null, focusClientY = null, preferredKey = null) {
  const desired = calculateDesiredVisibleCounts();
  const current = countVisibleMolecules();
  for (const [key, count] of Object.entries(current)) {
    const excess = count - (desired[key] || 0);
    if (excess > 0) removeVisibleByKey(key, excess);
  }
  for (const [key, count] of Object.entries(desired)) {
    const missing = count - (countVisibleMolecules()[key] || 0);
    if (missing > 0) addVisibleMolecules(key, focusClientX, focusClientY, missing, key === preferredKey);
  }
  trimVisibleMolecules();
}

function calculateDesiredVisibleCounts() {
  const entries = Object.entries(state.inventory)
    .filter(([key, amount]) => molecules[key] && amount > 0 && (state.unlocked.includes(key) || state.synthesized.includes(key)));
  if (entries.length === 0) return { h2: 64 };

  const target = getVisibleTargetCount();
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
  const desired = {};
  let allocated = 0;

  for (const [key, amount] of entries) {
    const exact = (amount / total) * target;
    desired[key] = Math.max(1, Math.floor(exact));
    allocated += desired[key];
  }

  const sorted = entries
    .map(([key, amount]) => ({ key, remainder: ((amount / total) * target) % 1 }))
    .sort((a, b) => b.remainder - a.remainder);
  let index = 0;
  while (allocated < target && sorted.length > 0) {
    desired[sorted[index % sorted.length].key] += 1;
    allocated += 1;
    index += 1;
  }

  return desired;
}

function countVisibleMolecules() {
  return ambient.reduce((counts, item) => {
    counts[item.key] = (counts[item.key] || 0) + 1;
    return counts;
  }, {});
}

function removeVisibleByKey(key, count) {
  for (let i = ambient.length - 1; i >= 0 && count > 0; i -= 1) {
    if (ambient[i].key === key) {
      ambient.splice(i, 1);
      count -= 1;
    }
  }
}

function addVisibleMolecules(key, clientX, clientY, count, nearFocus = false) {
  const rect = els.canvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;
  for (let i = 0; i < count; i += 1) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    if (nearFocus && clientX !== null && clientY !== null && Math.random() < 0.4) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 22 + Math.random() * 90;
      x = clientX - rect.left + Math.cos(angle) * distance;
      y = clientY - rect.top + Math.sin(angle) * distance;
    }
    ambient.push(createVisibleMolecule(key, clamp(x, 20, width - 20), clamp(y, 20, height - 20)));
  }
}

function addProductMoleculesAt(key, x, y, count) {
  const rect = els.canvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;
  const originX = x === null ? Math.random() * width : x;
  const originY = y === null ? Math.random() * height : y;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 8 + Math.random() * 28;
    const molecule = createVisibleMolecule(
      key,
      clamp(originX + Math.cos(angle) * distance, 18, width - 18),
      clamp(originY + Math.sin(angle) * distance, 18, height - 18),
    );
    molecule.vx += Math.cos(angle) * 70;
    molecule.vy += Math.sin(angle) * 70;
    ambient.push(molecule);
  }
  trimVisibleMolecules();
}

function spawnReactionEffect(x, y, productKeys) {
  if (x === null || y === null) return;
  reactionEffects.push({
    x,
    y,
    productKeys,
    age: 0,
    duration: 0.72,
    sparks: Array.from({ length: 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 24 + Math.random() * 62,
      size: 1.5 + Math.random() * 2.5,
    })),
  });
  if (reactionEffects.length > 24) reactionEffects.shift();
}

function createVisibleMolecule(key, x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speedBoost = Math.pow(1.7, getSkillLevel("hotBath")) * Math.pow(1.25, getSkillLevel("quantumCatalyst"));
  const speed = (26 + Math.random() * 48) * speedBoost;
  return {
    key,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    spin: Math.random() * Math.PI * 2,
    spinSpeed: -1.2 + Math.random() * 2.4,
    scale: 0.64 + Math.random() * 0.38,
  };
}

function trimVisibleMolecules() {
  while (ambient.length > VISIBLE_MOLECULE_LIMIT) {
    ambient.shift();
  }
}

function draw(now, delta) {
  const rect = els.canvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;
  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height, now);
  drawReactorWindow(width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);
  drawAmbient(width, height, delta);
  drawReactionEffects(delta);
  ctx.restore();
  drawZoomIndicator(width, height);
}

function drawGrid(width, height, now) {
  const spacing = 72;
  const offset = (now / 80) % spacing;
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "#58f2cf";
  ctx.lineWidth = 1;
  for (let x = -spacing + offset; x < width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - height * 0.32, height);
    ctx.stroke();
  }
  for (let y = offset; y < height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + width * 0.32);
    ctx.stroke();
  }
  ctx.restore();
}

function drawReactorWindow(width, height) {
  const radius = Math.min(width, height) * 0.32 * zoom;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const gradient = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
  gradient.addColorStop(0, "rgba(88, 242, 207, 0.08)");
  gradient.addColorStop(0.74, "rgba(88, 242, 207, 0.04)");
  gradient.addColorStop(1, "rgba(88, 242, 207, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(132, 255, 219, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawZoomIndicator(width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(7, 14, 13, 0.68)";
  ctx.strokeStyle = "rgba(132, 255, 219, 0.22)";
  ctx.lineWidth = 1;
  const text = `zoom ${zoom.toFixed(1)}x`;
  ctx.font = "700 12px system-ui";
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + 24;
  ctx.beginPath();
  ctx.roundRect(width / 2 - boxWidth / 2, 112, boxWidth, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#9fbfb7";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, 126);
  ctx.restore();
}

function drawAmbient(width, height, delta) {
  for (const mote of ambient) {
    mote.x += mote.vx * delta;
    mote.y += mote.vy * delta;
    mote.spin += mote.spinSpeed * delta;
    const radius = getCollisionRadius(mote.key, mote.scale);
    if (mote.x < radius) {
      mote.x = radius;
      mote.vx = Math.abs(mote.vx);
    }
    if (mote.x > width - radius) {
      mote.x = width - radius;
      mote.vx = -Math.abs(mote.vx);
    }
    if (mote.y < radius) {
      mote.y = radius;
      mote.vy = Math.abs(mote.vy);
    }
    if (mote.y > height - radius) {
      mote.y = height - radius;
      mote.vy = -Math.abs(mote.vy);
    }
    ctx.save();
    ctx.globalAlpha = 0.68;
    drawMolecule(mote.key, mote.x, mote.y, 0.52 * mote.scale, mote.spin);
    ctx.restore();
  }
}

function drawReactionEffects(delta) {
  for (let i = reactionEffects.length - 1; i >= 0; i -= 1) {
    const effect = reactionEffects[i];
    effect.age += delta;
    const t = effect.age / effect.duration;
    if (t >= 1) {
      reactionEffects.splice(i, 1);
      continue;
    }

    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(255, 210, 93, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 10 + t * 46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(145, 255, 124, 0.9)";
    for (const spark of effect.sparks) {
      const distance = spark.speed * t;
      ctx.beginPath();
      ctx.arc(
        effect.x + Math.cos(spark.angle) * distance,
        effect.y + Math.sin(spark.angle) * distance,
        spark.size * alpha,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawMolecule(key, x, y, scale = 1, rotation = 0) {
  const molecule = molecules[key];
  if (!molecule) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  ctx.lineCap = "round";
  for (const [from, to] of molecule.bonds) {
    const a = molecule.atoms[from];
    const b = molecule.atoms[to];
    ctx.strokeStyle = "rgba(234, 255, 249, 0.74)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(a[1], a[2]);
    ctx.lineTo(b[1], b[2]);
    ctx.stroke();
  }

  for (const atom of molecule.atoms) {
    const [symbol, ax, ay] = atom;
    const [light, dark] = atomColors[symbol] || atomColors.C;
    const radius = symbol === "H" ? 12 : 16;
    const gradient = ctx.createRadialGradient(ax - radius * 0.35, ay - radius * 0.35, 1, ax, ay, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.24, light);
    gradient.addColorStop(1, dark);
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgba(236, 255, 248, 0.56)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ax, ay, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.rotate(-rotation);
    ctx.fillStyle = symbol === "H" ? "#1a2624" : "#f6fffb";
    ctx.font = "700 10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, ax, ay + 0.5);
    ctx.restore();
  }

  ctx.restore();
}

function getCollisionRadius(key, scale = 1) {
  const molecule = molecules[key];
  if (!molecule) return 20;
  const maxAtomDistance = molecule.atoms.reduce((max, atom) => Math.max(max, Math.hypot(atom[1], atom[2])), 0);
  return Math.max(18, (maxAtomDistance + 18) * 0.52 * scale);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensureAudio() {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
}

function playClickSound() {
  if (!audioContext || state.muted) return;
  playTone(330 + Math.random() * 80, 0.045, "triangle", 0.05);
}

function playUpgradeSound() {
  if (!audioContext || state.muted) return;
  [220, 330, 495].forEach((frequency, index) => {
    window.setTimeout(() => playTone(frequency, 0.08, "sawtooth", 0.055), index * 42);
  });
}

function playFeverSound() {
  if (!audioContext || state.muted) return;
  const pattern = [196, 247, 294, 392, 494, 587, 784, 988, 1175, 1568];
  pattern.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone(frequency, 0.08, index % 3 === 0 ? "square" : "sawtooth", 0.032);
      if (index % 2 === 0) playNoiseHit(0.026);
    }, index * 58);
  });
}

function playGoalFanfare() {
  if (!audioContext || state.muted) return;
  const lead = [392, 523, 659, 784, 1047, 1319, 1568, 2093, 1760, 2093, 2637, 3136];
  const bass = [98, 123, 147, 196, 247, 294];
  lead.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone(frequency, 0.18, index % 2 === 0 ? "sawtooth" : "square", 0.095);
      playNoiseHit(0.055);
    }, index * 95);
  });
  bass.forEach((frequency, index) => {
    window.setTimeout(() => playTone(frequency, 0.32, "triangle", 0.09), index * 190);
  });
}

function playTone(frequency, duration, type, volume) {
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * 1.06, now + duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1900, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playNoiseHit(duration) {
  const now = audioContext.currentTime;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 1600;
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start(now);
}
