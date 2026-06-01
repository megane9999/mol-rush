const AVOGADRO = 6.022e23;
const SAVE_KEY = "mol-rush-state-v1";

const upgrades = {
  pipette: {
    baseCost: 25,
    growth: 1.52,
    label: "マイクロピペット",
  },
  catalyst: {
    baseCost: 120,
    growth: 1.58,
    label: "触媒粒子",
  },
  chain: {
    baseCost: 900,
    growth: 5.8,
    label: "連鎖反応",
  },
  reactor: {
    baseCost: 1.5e4,
    growth: 7.5,
    label: "高圧リアクター",
  },
};

const milestones = [
  { value: 1e3, title: "溶液が温まってきた", detail: "1,000 分子突破。シンセシス加速。" },
  { value: 1e6, title: "反応チェーン点火", detail: "100 万分子突破。フィーバー突入。" },
  { value: 1e9, title: "ナノスケール制圧", detail: "10 億分子突破。ビートが上がる。" },
  { value: 1e12, title: "マイクロモルの気配", detail: "1 兆分子突破。実験室が揺れる。" },
  { value: 1e15, title: "巨大反応炉オンライン", detail: "1000 兆分子突破。出力上昇。" },
  { value: 1e18, title: "指数合成フェーズ", detail: "10^18 分子突破。あと少し。" },
  { value: AVOGADRO, title: "1 mol 達成", detail: "アボガドロ定数を突破。" },
];

const state = loadState();
const els = {
  canvas: document.querySelector("#molecule-field"),
  moleculeCount: document.querySelector("#molecule-count"),
  molProgressText: document.querySelector("#mol-progress-text"),
  molProgressBar: document.querySelector("#mol-progress-bar"),
  perClick: document.querySelector("#per-click"),
  perSecond: document.querySelector("#per-second"),
  clickTarget: document.querySelector("#click-target"),
  floatingTextLayer: document.querySelector("#floating-text-layer"),
  eventBanner: document.querySelector("#event-banner"),
  eventTitle: document.querySelector("#event-title"),
  eventDetail: document.querySelector("#event-detail"),
  goalDialog: document.querySelector("#goal-dialog"),
  resetButton: document.querySelector("#reset-button"),
  upgradeButtons: [...document.querySelectorAll(".upgrade")],
};

const ctx = els.canvas.getContext("2d");
const particles = [];
let audioContext = null;
let lastFrame = performance.now();
let autosaveTimer = 0;
let bannerTimer = 0;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

els.clickTarget.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  ensureAudio();
  els.clickTarget.classList.add("is-pressed");
  window.setTimeout(() => els.clickTarget.classList.remove("is-pressed"), 90);
  addMolecules(getPerClick(), event.clientX, event.clientY, true);
  playClickSound();
});

els.upgradeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.upgrade;
    buyUpgrade(key);
  });
});

els.resetButton.addEventListener("click", () => {
  if (!window.confirm("現在の実験データをリセットしますか？")) return;
  localStorage.removeItem(SAVE_KEY);
  Object.assign(state, createInitialState());
  particles.length = 0;
  showEvent("実験を初期化", "新しいサンプルから再開。");
  updateUi();
});

showEvent("Synthesis Ready", "分子をクリックして実験開始。");
updateUi();
requestAnimationFrame(tick);

function createInitialState() {
  return {
    molecules: 0,
    totalMolecules: 0,
    upgrades: {
      pipette: 0,
      catalyst: 0,
      chain: 0,
      reactor: 0,
    },
    reachedMilestones: [],
    goalShown: false,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== "object") return createInitialState();
    return {
      ...createInitialState(),
      ...saved,
      upgrades: {
        ...createInitialState().upgrades,
        ...(saved.upgrades || {}),
      },
      reachedMilestones: Array.isArray(saved.reachedMilestones) ? saved.reachedMilestones : [],
    };
  } catch {
    return createInitialState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getUpgradeCost(key) {
  const config = upgrades[key];
  return config.baseCost * Math.pow(config.growth, state.upgrades[key]);
}

function getGlobalMultiplier() {
  const reactorBoost = Math.pow(3, state.upgrades.reactor);
  const milestoneBoost = Math.pow(10, state.reachedMilestones.length);
  return reactorBoost * milestoneBoost;
}

function getPerClick() {
  const pipetteBase = 1 + state.upgrades.pipette * 4;
  const chainBoost = Math.pow(2, state.upgrades.chain);
  return pipetteBase * chainBoost * getGlobalMultiplier();
}

function getPerSecond() {
  const catalyst = state.upgrades.catalyst;
  if (catalyst <= 0) return 0;
  return 5 * catalyst * Math.pow(1.28, catalyst) * getGlobalMultiplier();
}

function addMolecules(amount, x = window.innerWidth / 2, y = window.innerHeight / 2, fromClick = false) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.molecules += amount;
  state.totalMolecules += amount;

  if (fromClick) {
    spawnFloatText(x, y, `+${formatNumber(amount)}`);
    spawnMolecules(x, y, Math.min(18, 5 + Math.floor(Math.log10(amount + 1))));
  }

  checkMilestones();
  updateUi();
}

function buyUpgrade(key) {
  const cost = getUpgradeCost(key);
  if (state.molecules < cost) return;
  ensureAudio();
  state.molecules -= cost;
  state.upgrades[key] += 1;
  showEvent(upgrades[key].label, "設備強化。生成速度が上昇。");
  playUpgradeSound();
  spawnMolecules(window.innerWidth * 0.78, window.innerHeight * 0.62, 14);
  updateUi();
  saveState();
}

function checkMilestones() {
  for (const milestone of milestones) {
    if (state.totalMolecules < milestone.value || state.reachedMilestones.includes(milestone.value)) {
      continue;
    }

    state.reachedMilestones.push(milestone.value);
    showEvent(milestone.title, milestone.detail);
    playFeverSound();
    triggerFeverVisuals();

    if (milestone.value === AVOGADRO && !state.goalShown) {
      state.goalShown = true;
      window.setTimeout(() => {
        if (!els.goalDialog.open) els.goalDialog.showModal();
      }, 540);
    }
  }
}

function updateUi() {
  const mol = state.totalMolecules / AVOGADRO;
  const logProgress = Math.min(100, (Math.log10(state.totalMolecules + 1) / Math.log10(AVOGADRO)) * 100);

  els.moleculeCount.textContent = formatNumber(state.molecules);
  els.molProgressText.textContent = `${formatMol(mol)} mol`;
  els.molProgressBar.style.width = `${logProgress}%`;
  els.perClick.textContent = `+${formatNumber(getPerClick())}`;
  els.perSecond.textContent = `${formatNumber(getPerSecond())}/s`;

  for (const button of els.upgradeButtons) {
    const key = button.dataset.upgrade;
    const cost = getUpgradeCost(key);
    const costEl = document.querySelector(`#${key}-cost`);
    costEl.textContent = formatNumber(cost);
    button.disabled = state.molecules < cost;
  }
}

function formatNumber(value) {
  if (value < 1000) return Math.floor(value).toLocaleString("ja-JP");
  if (value < 1e6) return Math.floor(value).toLocaleString("ja-JP");
  return value.toExponential(2);
}

function formatMol(value) {
  if (value === 0) return "0";
  if (value < 0.001) return value.toExponential(2);
  if (value < 1000) return value.toLocaleString("ja-JP", { maximumFractionDigits: 4 });
  return value.toExponential(2);
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

function showEvent(title, detail) {
  els.eventTitle.textContent = title;
  els.eventDetail.textContent = detail;
  els.eventBanner.classList.add("is-visible");
  window.clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => {
    els.eventBanner.classList.remove("is-visible");
  }, 2400);
}

function triggerFeverVisuals() {
  document.body.classList.add("is-fever");
  spawnMolecules(window.innerWidth / 2, window.innerHeight / 2, 70);
  window.setTimeout(() => document.body.classList.remove("is-fever"), 920);
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playClickSound() {
  if (!audioContext) return;
  playTone(330 + Math.random() * 80, 0.045, "triangle", 0.05);
}

function playUpgradeSound() {
  if (!audioContext) return;
  [220, 330, 495].forEach((frequency, index) => {
    window.setTimeout(() => playTone(frequency, 0.08, "sawtooth", 0.055), index * 42);
  });
}

function playFeverSound() {
  if (!audioContext) return;
  const pattern = [196, 247, 294, 392, 494, 587, 784, 988, 1175, 1568, 1976, 1568];
  pattern.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone(frequency, 0.105, index % 3 === 0 ? "square" : "sawtooth", 0.075);
      if (index % 2 === 0) playNoiseHit(0.045);
    }, index * 58);
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
  filter.frequency.setValueAtTime(1800, now);
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

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.floor(window.innerWidth * dpr);
  els.canvas.height = Math.floor(window.innerHeight * dpr);
  els.canvas.style.width = `${window.innerWidth}px`;
  els.canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnMolecules(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 4.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: -0.08 + Math.random() * 0.16,
      radius: 5 + Math.random() * 10,
      life: 0,
      maxLife: 1300 + Math.random() * 900,
      hue: Math.random() < 0.5 ? 166 : Math.random() < 0.75 ? 100 : 43,
    });
  }

  if (particles.length > 260) {
    particles.splice(0, particles.length - 260);
  }
}

function tick(now) {
  const delta = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  const autoAmount = getPerSecond() * delta;
  if (autoAmount > 0) {
    state.molecules += autoAmount;
    state.totalMolecules += autoAmount;
    if (Math.random() < 0.16) {
      spawnMolecules(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * (0.25 + Math.random() * 0.5), 1);
    }
    checkMilestones();
    updateUi();
  }

  autosaveTimer += delta;
  if (autosaveTimer > 2) {
    autosaveTimer = 0;
    saveState();
  }

  drawParticles(now);
  requestAnimationFrame(tick);
}

function drawParticles(now) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawGrid(now);

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life += 16;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.992;
    p.vy *= 0.992;
    p.vy -= 0.005;
    p.spin += p.spinSpeed;

    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    if (alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    drawMoleculeParticle(p, alpha);
  }
}

function drawGrid(now) {
  const spacing = 72;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#57f4d1";
  ctx.lineWidth = 1;
  const offset = (now / 80) % spacing;

  for (let x = -spacing + offset; x < window.innerWidth + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - window.innerHeight * 0.32, window.innerHeight);
    ctx.stroke();
  }

  for (let y = offset; y < window.innerHeight + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(window.innerWidth, y + window.innerWidth * 0.32);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMoleculeParticle(p, alpha) {
  const points = [
    { x: Math.cos(p.spin) * p.radius * 1.5, y: Math.sin(p.spin) * p.radius * 1.5 },
    { x: Math.cos(p.spin + 2.15) * p.radius * 1.35, y: Math.sin(p.spin + 2.15) * p.radius * 1.35 },
    { x: Math.cos(p.spin + 4.2) * p.radius * 1.25, y: Math.sin(p.spin + 4.2) * p.radius * 1.25 },
  ];

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `hsla(${p.hue}, 95%, 74%, 0.56)`;
  ctx.lineWidth = Math.max(1, p.radius * 0.25);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.stroke();

  for (const point of points) {
    const gradient = ctx.createRadialGradient(point.x - p.radius * 0.25, point.y - p.radius * 0.25, 1, point.x, point.y, p.radius);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.23, `hsla(${p.hue}, 95%, 70%, 0.96)`);
    gradient.addColorStop(1, `hsla(${p.hue}, 80%, 32%, 0.92)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
