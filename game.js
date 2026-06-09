(function () {
  'use strict';

  const CFG = window.CONFIG;
  const ATTR_KEYS = Object.keys(CFG.Attributes);
  const CARD_BY_ID = indexBy(CFG.Cards, 'id');
  const HABIT_BY_ID = indexBy(CFG.Habits, 'id');
  const ENDING_BY_ID = indexBy(CFG.Endings, 'id');
  const STORY_BY_ID = indexBy(CFG.StoryEntries || [], 'id');
  const STORY_CHARACTER_BY_ID = indexBy(CFG.StoryCharacters || [], 'id');
  const STORY_COLLECTIBLE_BY_ID = indexBy(CFG.StoryCollectibles || [], 'id');

  const Loader = {
    images: {},
    audio: {},
    fallbackCache: {},
    loaded: 0,
    total: 0,
    done: false,

    loadAll(onComplete) {
      const imageKeys = Object.keys(CFG.Assets.images);
      const audioKeys = Object.keys(CFG.Assets.audio);
      this.total = imageKeys.length + audioKeys.length;
      this.loaded = 0;
      this.done = false;
      this.updateProgress();

      if (this.total === 0) {
        this.finish(onComplete);
        return;
      }

      imageKeys.forEach((key) => this.loadImage(key, onComplete));
      audioKeys.forEach((key) => this.loadAudio(key, onComplete));
    },

    loadImage(key, onComplete) {
      const asset = CFG.Assets.images[key];
      const img = new Image();
      const record = { key, img, path: asset.path, useFallback: false };
      this.images[key] = record;
      img.onload = () => this.markLoaded(onComplete);
      img.onerror = () => {
        record.useFallback = true;
        this.markLoaded(onComplete);
      };
      img.src = asset.path;
    },

    loadAudio(key, onComplete) {
      const asset = CFG.Assets.audio[key];
      const audio = new Audio();
      const record = { key, audio, path: asset.path, useFallback: false };
      let settled = false;
      let timer = null;
      this.audio[key] = record;

      const finish = (failed) => {
        if (settled) return;
        settled = true;
        if (timer !== null) window.clearTimeout(timer);
        record.useFallback = Boolean(failed);
        this.markLoaded(onComplete);
      };

      audio.preload = 'auto';
      audio.loop = Boolean(asset.loop);
      audio.volume = asset.volume;
      audio.addEventListener('canplaythrough', () => finish(false), { once: true });
      audio.addEventListener('error', () => finish(true), { once: true });
      timer = window.setTimeout(() => finish(false), CFG.Loader.audioTimeoutMs);
      audio.src = asset.path;
      try {
        audio.load();
      } catch (err) {
        finish(true);
      }
    },

    markLoaded(onComplete) {
      this.loaded += 1;
      this.updateProgress();
      if (this.loaded >= this.total) {
        this.finish(onComplete);
      }
    },

    updateProgress() {
      const percent = this.total ? Math.round((this.loaded / this.total) * CFG.Loader.progressComplete) : CFG.Loader.progressComplete;
      const bar = document.getElementById('loading-bar');
      const text = document.getElementById('loading-text');
      if (bar !== null) bar.style.width = `${percent}%`;
      if (text !== null) text.textContent = `${percent}%`;
    },

    finish(onComplete) {
      if (this.done === true) return;
      this.done = true;
      this.updateProgress();
      if (typeof onComplete === 'function') onComplete();
    },

    getImage(key) {
      return this.images[key];
    },

    imageHtml(key, className, fallbackText) {
      const item = this.getImage(key);
      const safeText = fallbackText || '图';
      if (item && item.img && !item.useFallback) {
        return `<img class="${className}" src="${item.path}" alt="${safeText}">`;
      }
      const fallbackSrc = this.getFallbackImage(key, safeText);
      if (fallbackSrc) return `<img class="${className}" src="${fallbackSrc}" alt="${safeText}">`;
      return `<div class="fallback-icon" aria-label="${safeText}">${safeText.slice(0, 1)}</div>`;
    },

    getFallbackImage(key, label) {
      if (this.fallbackCache[key]) return this.fallbackCache[key];
      try {
        const canvas = document.createElement('canvas');
        const size = CFG.UI.cardIconSize;
        const palette = [CFG.Colors.teal, CFG.Colors.yellow, CFG.Colors.green, CFG.Colors.orange, CFG.Colors.red];
        const color = palette[Math.abs(hashText(key)) % palette.length];
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = CFG.Colors.paper;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = color;
        drawRoundRect(ctx, size * 0.1, size * 0.1, size * 0.8, size * 0.8, size * 0.22);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.beginPath();
        ctx.arc(size * 0.62, size * 0.34, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = CFG.Colors.ink;
        ctx.font = `900 ${Math.round(size * 0.34)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.slice(0, 1), size * 0.5, size * 0.56);
        this.fallbackCache[key] = canvas.toDataURL('image/png');
        return this.fallbackCache[key];
      } catch (err) {
        return '';
      }
    },

    play(key) {
      const item = this.audio[key];
      const asset = CFG.Assets.audio[key];
      if (item === undefined || asset === undefined || item.useFallback === true || Game.isMuted() === true) return;
      const audio = asset.loop ? item.audio : item.audio.cloneNode(true);
      audio.volume = asset.volume;
      audio.loop = Boolean(asset.loop);
      if (asset.loop === true && audio.paused === false) return;
      try {
        audio.currentTime = 0;
        const result = audio.play();
        if (result !== undefined && result !== null && typeof result.catch === 'function') result.catch(() => {});
      } catch (err) {}
    },

    startMusic() {
      this.play('campusLoop');
    },

    stopMusic() {
      const item = this.audio.campusLoop;
      if (item === undefined || item.audio === undefined) return;
      try {
        item.audio.pause();
      } catch (err) {}
    },

    syncMuted() {
      Object.keys(this.audio).forEach((key) => {
        const item = this.audio[key];
        if (item !== undefined && item.audio !== undefined) item.audio.muted = Game.isMuted();
      });
    }
  };

  const Input = {
    lastTouchAt: 0,

    bindTap(el, handler) {
      if (el === null || el === undefined || typeof handler !== 'function') return;
      const run = (event) => {
        if (event !== undefined && event !== null && event.cancelable === true) event.preventDefault();
        if (el.disabled === true || el.getAttribute('aria-disabled') === 'true') return;
        handler(event);
      };

      if (window.PointerEvent) {
        el.addEventListener('pointerup', run);
      } else {
        el.addEventListener('touchend', (event) => {
          this.lastTouchAt = Date.now();
          run(event);
        }, { passive: false });
        el.addEventListener('click', (event) => {
          if (Date.now() - this.lastTouchAt < CFG.Game.actionFeedbackMinMs) return;
          run(event);
        });
      }
    }
  };

  const Game = {
    state: null,
    dom: {},
    layout: null,
    particles: [],
    particleRaf: 0,
    feedbackTimer: 0,
    toastTimer: 0,

    prepareLayout() {
      this.dom.container = this.dom.container || document.getElementById('game-container');
      this.dom.canvas = this.dom.canvas || document.getElementById('fx-canvas');
      if (this.dom.container !== null) {
        this.dom.container.style.setProperty('--base-game-width', `${CFG.Screen.width}px`);
        this.dom.container.style.setProperty('--base-game-height', `${CFG.Screen.height}px`);
      }
      this.resizeGame();
    },

    init() {
      this.dom.container = document.getElementById('game-container');
      this.dom.scene = document.getElementById('scene-root');
      this.dom.overlay = document.getElementById('overlay-root');
      this.dom.canvas = document.getElementById('fx-canvas');
      this.dom.ctx = this.dom.canvas.getContext('2d');
      this.dom.loading = document.getElementById('loading-screen');
      this.dom.container.style.setProperty('--base-game-width', `${CFG.Screen.width}px`);
      this.dom.container.style.setProperty('--base-game-height', `${CFG.Screen.height}px`);
      this.resizeGame();
      window.addEventListener('resize', () => this.resizeGame());
      window.addEventListener('orientationchange', () => window.setTimeout(() => this.resizeGame(), 80));
      if (this.dom.loading !== null) {
        this.dom.loading.classList.add('hidden');
        window.setTimeout(() => {
          if (this.dom.loading !== null && this.dom.loading.parentNode !== null) this.dom.loading.parentNode.removeChild(this.dom.loading);
        }, CFG.UI.redFlashMs);
      }
      this.state = this.createInitialState();
      this.state.dex = this.loadDex();
      this.state.storyBook = this.loadStoryBook();
      this.state.muted = this.loadMuted();
      Loader.syncMuted();
      this.startParticleLoop();
    },

    resizeGame() {
      if (this.dom.container === undefined || this.dom.container === null) return;
      if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      const root = document.documentElement;
      const viewportWidth = window.innerWidth || root.clientWidth || CFG.Screen.width;
      const viewportHeight = window.innerHeight || root.clientHeight || CFG.Screen.height;
      root.style.setProperty('--app-height', `${viewportHeight}px`);

      const layout = this.getResponsiveLayout(viewportWidth, viewportHeight);
      this.layout = layout;
      this.dom.container.style.setProperty('--game-width', `${layout.width}px`);
      this.dom.container.style.setProperty('--game-height', `${layout.height}px`);
      this.dom.container.style.setProperty('--stage-offset-x', `${layout.offsetX}px`);
      this.dom.container.style.setProperty('--stage-offset-y', `${layout.offsetY}px`);
      this.dom.container.style.setProperty('--game-scale', `${layout.scale}`);
      this.resizeCanvas(layout.width, layout.height);
    },

    getResponsiveLayout(viewportWidth, viewportHeight) {
      const baseWidth = CFG.Screen.width;
      const baseHeight = CFG.Screen.height;
      const viewportRatio = viewportWidth / Math.max(viewportHeight, 1);
      const isCompact = viewportWidth <= CFG.Screen.mobileMaxWidth || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      let width = baseWidth;
      let height = baseHeight;

      if (isCompact) {
        if (viewportRatio > CFG.Screen.ratio) {
          width = clamp(Math.round(viewportWidth / (viewportHeight / baseHeight)), baseWidth, CFG.Screen.maxResponsiveWidth);
        } else {
          height = clamp(Math.round(viewportHeight / (viewportWidth / baseWidth)), baseHeight, CFG.Screen.maxResponsiveHeight);
        }
      }

      const scale = Math.min(viewportWidth / width, viewportHeight / height);
      return {
        width,
        height,
        scale,
        offsetX: Math.round((width - baseWidth) / 2),
        offsetY: Math.round((height - baseHeight) / 2)
      };
    },

    resizeCanvas(width, height) {
      if (!this.dom.canvas) return;
      if (this.dom.canvas.width !== width) this.dom.canvas.width = width;
      if (this.dom.canvas.height !== height) this.dom.canvas.height = height;
    },

    getStageOffset() {
      return this.layout || { offsetX: 0, offsetY: 0, width: CFG.Screen.width, height: CFG.Screen.height };
    },

    createInitialState() {
      const attrs = {};
      ATTR_KEYS.forEach((key) => { attrs[key] = CFG.Attributes[key].initial; });
      return {
        screen: 'start',
        week: 1,
        actionIndexInWeek: 0,
        stage: 1,
        attrs,
        initialAttrs: clone(attrs),
        attrHistory: [],
        selectedHistory: [],
        behaviorCounts: {},
        categoryStreak: { name: null, count: 0 },
        cardStreak: { id: null, count: 0 },
        habits: [],
        habitUnlockHistory: [],
        healthDropTotal: 0,
        roasts: [],
        recentRoastIds: [],
        eventHistory: [],
        weeklyEffectHistory: [],
        settledWeeks: [],
        weekCategories: [],
        weekPressureCount: 0,
        balancedWeeks: 0,
        overloadWeeks: 0,
        totalActionsTaken: 0,
        currentCards: [],
        cardLocked: false,
        selectedVisual: null,
        pendingNext: null,
        resumeNextAfterStory: null,
        comboMessage: '从三张行为卡里挑一张，大学人格开始发芽。',
        currentRoast: CFG.Game.defaultRoast,
        noStudyMisses: 0,
        noRelaxMisses: 0,
        procrastinationStudyPenalty: false,
        midtermShown: false,
        lastWeeklySummary: '',
        lastResult: null,
        storyBook: this.loadStoryBook ? this.loadStoryBook() : createEmptyStoryBook(),
        storyHistory: [],
        storyQueue: [],
        storyCandidate: null,
        pendingStoryResume: null,
        currentStory: null,
        storyMisses: 0,
        weeklyStoryCount: 0,
        storyNewThisRun: [],
        dex: this.loadDex ? this.loadDex() : { items: {} },
        muted: this.loadMuted ? this.loadMuted() : false
      };
    },

    showStartScreen() {
      this.clearTimers();
      this.clearOverlay();
      Loader.stopMusic();
      this.state.screen = 'start';
      this.state.dex = this.loadDex();
      this.state.storyBook = this.loadStoryBook();
      const hasSave = Boolean(this.getSavedGame());
      this.dom.scene.innerHTML = `
        <section class="scene start-scene">
          <div class="ui-stage">
            <div class="start-sticker">校园人格实验室</div>
            <h1 class="game-title">大学生人格进化论</h1>
            <p class="start-subtitle">${CFG.Game.introSubtitle}</p>
            <div class="start-buttons">
              <button class="btn primary" data-action="start">开始进化</button>
              <button class="btn secondary" data-action="dex">人格图鉴</button>
              <button class="btn secondary" data-action="reset-dex">重置图鉴</button>
              ${hasSave ? '<button class="btn secondary" data-action="continue">继续上局</button>' : ''}
            </div>
          </div>
        </section>
      `;
      this.bindSceneButton('start', () => {
        Loader.startMusic();
        this.startNewGame();
      });
      this.bindSceneButton('dex', () => this.showDexScreen());
      this.bindSceneButton('reset-dex', () => this.confirmResetDex());
      this.bindSceneButton('continue', () => {
        if (this.loadSavedGame()) {
          Loader.startMusic();
          this.showPlayScreen();
        } else {
          this.showToast('没有找到可继续的学期记录。');
          this.showStartScreen();
        }
      });
    },

    startNewGame() {
      const dex = this.loadDex();
      const muted = this.loadMuted();
      const storyBook = this.loadStoryBook();
      this.removeSavedGame();
      this.state = this.createInitialState();
      this.state.dex = dex;
      this.state.storyBook = storyBook;
      this.state.muted = muted;
      Loader.syncMuted();
      this.showTutorial(0);
    },

    showTutorial(page) {
      this.clearOverlay();
      this.state.screen = 'tutorial';
      const pages = CFG.Game.tutorialPages;
      const isLast = page >= pages.length - 1;
      this.dom.scene.innerHTML = `
        <section class="scene tutorial-scene">
          <div class="ui-stage">
            <div class="tutorial-card">
              <div class="tutorial-index">${page + 1}</div>
              <div class="tutorial-text">${pages[page]}</div>
              <div class="tutorial-dots">${pages.map((_, index) => `<span class="dot ${index === page ? 'active' : ''}"></span>`).join('')}</div>
              <button class="btn primary" data-action="tutorial-next" disabled>${isLast ? '进入第 1 周' : '下一条提示'}</button>
            </div>
          </div>
        </section>
      `;
      const button = this.dom.scene.querySelector('[data-action="tutorial-next"]');
      window.setTimeout(() => { if (button !== null) button.disabled = false; }, CFG.Game.tutorialMinMs);
      Input.bindTap(button, () => {
        if (isLast) {
          this.state.currentCards = this.generateCards();
          this.showPlayScreen();
        } else {
          this.showTutorial(page + 1);
        }
      });
    },

    showPlayScreen() {
      this.clearOverlay();
      this.state.screen = 'play';
      this.state.stage = this.getStage(this.state.week).id;
      if (this.state.currentCards.length === 0 && this.state.pendingNext === null && this.state.cardLocked === false) {
        this.state.currentCards = this.generateCards();
      }
      this.renderPlay();
    },

    renderPlay() {
      const stage = this.getStage(this.state.week);
      const completed = this.state.totalActionsTaken;
      const total = CFG.Game.totalActions;
      const nextButton = this.getNextButtonHtml();
      this.dom.scene.innerHTML = `
        <section class="scene play-scene">
          <div class="ui-stage">
          <div class="top-bar">
            <div>
              <div class="week-label">第 ${this.state.week} 周</div>
              <div class="stage-label">阶段 ${stage.id}：${stage.name}</div>
            </div>
            <div class="progress-pill">行动 ${completed}/${total}</div>
          </div>
          <button class="pause-button" data-action="pause" aria-label="暂停">Ⅱ</button>
          ${this.renderAttrBoard()}
          <div class="roast-bubble">
            <div class="roast-kicker">吐槽画像</div>
            <div class="roast-text">${this.state.currentRoast}</div>
          </div>
          ${this.renderHabitRow()}
          <div class="card-row">${this.renderCards()}</div>
          <div class="bottom-panel">
            <div class="combo-box">${this.state.comboMessage}</div>
            <div class="next-area">${nextButton}</div>
          </div>
          </div>
        </section>
      `;

      this.bindSceneButton('pause', () => this.showPauseMenu());
      this.state.currentCards.forEach((card) => {
        const el = this.dom.scene.querySelector(`[data-card-id="${card.id}"]`);
        if (this.state.cardLocked === false && this.state.pendingNext === null) {
          Input.bindTap(el, () => this.selectCard(card.id));
        }
      });
      this.bindSceneButton('next-action', () => this.prepareNextAction());
      this.bindSceneButton('weekend', () => this.startWeekend());
    },

    getNextButtonHtml() {
      if (this.state.pendingNext) {
        const action = this.state.pendingNext.type === 'weekend' ? 'weekend' : 'next-action';
        return `<button class="btn primary" data-action="${action}">${this.state.pendingNext.label}</button>`;
      }
      if (this.state.cardLocked) {
        return '<button class="btn secondary" disabled>反馈生成中...</button>';
      }
      return '<button class="btn secondary" disabled>点击一张行为卡</button>';
    },

    renderAttrBoard() {
      return `
        <div class="attr-board">
          ${ATTR_KEYS.map((key) => {
            const meta = CFG.Attributes[key];
            const value = this.state.attrs[key];
            const low = value < CFG.Game.lowAttributeThreshold ? 'low' : '';
            return `
              <div class="attr-item attr-${key} ${low}" style="--attr-color:${meta.color}">
                <div class="attr-head">
                  <span class="attr-name"><span class="attr-dot"></span>${meta.label}</span>
                  <span class="attr-value">${value}</span>
                </div>
                <div class="attr-track"><div class="attr-fill" style="width:${value}%"></div></div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    renderHabitRow() {
      if (!this.state.habits.length) {
        return '<div class="habit-row"><div class="habit-empty">习惯贴纸还没形成，连续选择会有惊喜。</div></div>';
      }
      const visible = this.state.habits.slice(0, CFG.Game.maxVisibleHabits);
      const extra = this.state.habits.length - visible.length;
      return `
        <div class="habit-row">
          ${visible.map((id, index) => `<span class="habit-chip ${this.wasHabitRecentlyUnlocked(id) ? 'new' : ''}" style="--rot:${this.getChipRotation(index)}deg">${HABIT_BY_ID[id].name}</span>`).join('')}
          ${extra > 0 ? `<span class="habit-chip">+${extra}</span>` : ''}
        </div>
      `;
    },

    renderCards() {
      if (!this.state.currentCards.length) {
        return '<div class="habit-empty">周末结算中，等辅导员发话。</div>';
      }
      return this.state.currentCards.map((card) => {
        const selected = this.state.selectedVisual === card.id;
        const dimmed = this.state.selectedVisual && !selected;
        const classes = ['behavior-card'];
        if (selected) classes.push('selected');
        if (dimmed) classes.push('dimmed');
        return `
          <article class="${classes.join(' ')}" data-card-id="${card.id}">
            <div class="card-icon-wrap">${Loader.imageHtml(card.icon, 'card-icon', card.name)}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-desc">${card.description}</div>
            <div class="effect-list">${this.renderEffectPreview(card.effects)}</div>
          </article>
        `;
      }).join('');
    },

    renderEffectPreview(effects) {
      return Object.keys(effects)
        .filter((key) => effects[key] !== 0)
        .sort((a, b) => Math.abs(effects[b]) - Math.abs(effects[a]))
        .slice(0, CFG.Game.visibleCardCount)
        .map((key) => {
          const value = effects[key];
          const sign = value > 0 ? '+' : '';
          const cls = value > 0 ? 'pos' : 'neg';
          return `<div class="effect-line ${cls}"><span>${CFG.Attributes[key].label}</span><span>${sign}${value}</span></div>`;
        }).join('');
    },

    selectCard(cardId) {
      if (this.state.cardLocked || this.state.pendingNext) return;
      const card = CARD_BY_ID[cardId];
      if (!card) return;
      const cardIndex = this.state.currentCards.findIndex((item) => item.id === cardId);
      const effectResult = this.buildCardEffects(card);
      this.state.cardLocked = true;
      this.state.selectedVisual = card.id;
      Loader.play('cardSelect');

      const changes = this.applyEffects(effectResult.effects, 'card', card.id);
      this.afterCardSelected(card, effectResult.comboText);
      const newHabits = this.checkHabits();
      const roast = this.pickRoast(card, newHabits, changes);
      this.recordRoast(roast);
      this.state.comboMessage = this.buildComboMessage(effectResult.comboText, newHabits);
      this.renderPlay();
      this.showFloatingChanges(changes, card.primary);
      this.spawnParticles('card', this.getCardCenterX(cardIndex), CFG.UI.cardTop + CFG.UI.cardParticleYOffset);
      this.handleImpactFeedback(changes);
      if (newHabits.length) {
        Loader.play('habitUnlock');
        this.spawnParticles('habit', CFG.UI.habitParticleX, CFG.UI.habitParticleY);
      }
      this.state.storyCandidate = this.pickStoryCandidate(card, newHabits);
      this.feedbackTimer = window.setTimeout(() => this.enableNextAfterFeedback(), CFG.Game.actionFeedbackMinMs);
    },

    buildCardEffects(card) {
      const effects = clone(card.effects);
      const isStudy = this.cardInGroup(card, 'study');
      const isRelax = this.cardInGroup(card, 'relax');
      const isFish = this.cardInGroup(card, 'fishRest');
      const isSocial = this.cardInGroup(card, 'social');
      const isPressure = this.cardInGroup(card, 'pressure');
      const isSkill = this.cardInGroup(card, 'skill');
      const nextCategoryCount = this.state.categoryStreak.name === card.bigCategory ? this.state.categoryStreak.count + 1 : 1;
      let comboText = '';

      if (this.state.actionIndexInWeek === 0) {
        if (this.state.attrs.mood < CFG.Game.healthWarningThreshold) addEffect(effects, card.primary, -2);
        if (this.state.attrs.health < CFG.Game.healthWarningThreshold) addEffect(effects, 'health', -3);
        if (this.hasHabit('nightEnergy')) addEffect(effects, 'health', -4);
      }

      if (this.hasHabit('selfDiscipline') && isStudy) addEffect(effects, 'academic', 2);
      if (this.hasHabit('procrastination') && isFish) addEffect(effects, 'mood', 2);
      if (this.state.procrastinationStudyPenalty && isStudy) {
        addEffect(effects, 'academic', -3);
        this.state.procrastinationStudyPenalty = false;
      }
      if (this.hasHabit('networkRadar') && isSocial) addEffect(effects, 'social', 1);
      if (this.hasHabit('nightEnergy')) {
        if (isStudy) addEffect(effects, 'academic', 2);
        if (isSkill) addEffect(effects, 'skill', 2);
      }
      if (this.hasHabit('socialShield') && isSocial) addEffect(effects, 'social', -2);
      if (this.hasHabit('loveFilter')) {
        if (card.id === 'love' || effects.mood > 0) addEffect(effects, 'mood', 3);
        if (isStudy) addEffect(effects, 'academic', -1);
      }
      if (this.hasHabit('workerAwake') && (card.id === 'work' || card.id === 'intern')) {
        addEffect(effects, 'money', 3);
        addEffect(effects, 'skill', 1);
      }
      if (this.hasHabit('projectBurn')) {
        if (isSkill) addEffect(effects, 'skill', 3);
        if (isPressure) addEffect(effects, 'health', -2);
      }
      if (this.hasHabit('esportsSense')) {
        if (card.id === 'game') {
          addEffect(effects, 'skill', 3);
          addEffect(effects, 'mood', 2);
        }
        if (isStudy) addEffect(effects, 'academic', -2);
      }
      if (this.hasHabit('dormAura') && isRelax) {
        addEffect(effects, 'mood', 2);
        addEffect(effects, 'health', 1);
      }
      if (nextCategoryCount >= CFG.Game.comboCount) {
        addEffect(effects, card.primary, 2);
        comboText = `${card.bigCategory}连选 Combo：${CFG.Attributes[card.primary].label}额外 +2`;
      }
      return { effects, comboText };
    },

    afterCardSelected(card, comboText) {
      this.state.behaviorCounts[card.id] = this.getCardCount(card.id) + 1;
      this.state.selectedHistory.push({
        week: this.state.week,
        actionIndexInWeek: this.state.actionIndexInWeek,
        cardId: card.id,
        bigCategory: card.bigCategory,
        tags: card.tags.slice()
      });
      this.state.weekCategories.push(card.bigCategory);
      if (this.cardInGroup(card, 'pressure')) this.state.weekPressureCount += 1;
      if (this.state.categoryStreak.name === card.bigCategory) {
        this.state.categoryStreak.count += 1;
      } else {
        this.state.categoryStreak = { name: card.bigCategory, count: 1 };
      }
      if (this.state.cardStreak.id === card.id) {
        this.state.cardStreak.count += 1;
      } else {
        this.state.cardStreak = { id: card.id, count: 1 };
      }
      this.state.actionIndexInWeek += 1;
      this.state.totalActionsTaken += 1;
      if (comboText) this.state.lastComboText = comboText;
    },

    enableNextAfterFeedback() {
      if (this.state.screen !== 'play') return;
      const weekDone = this.state.actionIndexInWeek >= this.getActionsThisWeek();
      const next = {
        type: weekDone ? 'weekend' : 'action',
        label: weekDone ? '进入周末事件' : '下一次选择'
      };
      this.state.pendingStoryResume = next;
      this.showStoryFlow(this.state.storyCandidate, next);
    },

    prepareNextAction() {
      this.clearTimers();
      this.state.pendingNext = null;
      this.state.resumeNextAfterStory = null;
      this.state.storyCandidate = null;
      this.state.pendingStoryResume = null;
      this.state.cardLocked = false;
      this.state.selectedVisual = null;
      this.state.currentCards = this.generateCards();
      this.renderPlay();
    },

    completeActionFlow(next) {
      this.clearOverlay();
      if (next && next.type === 'advance-week') {
        this.state.resumeNextAfterStory = null;
        this.state.pendingStoryResume = null;
        this.state.storyCandidate = null;
        this.advanceWeekOrFinish();
        return;
      }
      this.state.pendingNext = next;
      this.state.resumeNextAfterStory = null;
      this.state.pendingStoryResume = null;
      this.state.storyCandidate = null;
      this.state.cardLocked = true;
      this.renderPlay();
    },

    startWeekend() {
      this.clearTimers();
      this.state.pendingNext = null;
      this.state.resumeNextAfterStory = null;
      this.state.storyCandidate = null;
      this.state.pendingStoryResume = null;
      this.state.cardLocked = true;
      this.state.selectedVisual = null;
      this.state.currentCards = [];
      const weeklyChanges = this.applyWeeklyEffects();
      this.renderPlay();
      if (weeklyChanges.length > 0) this.showFloatingChanges(weeklyChanges, null, true);
      const event = this.pickWeekendEvent();
      if (event !== null && event !== undefined) {
        this.showEvent(event);
      } else {
        this.showNoEventDialog();
      }
    },

    applyWeeklyEffects() {
      if (this.state.settledWeeks.indexOf(this.state.week) >= 0) return [];
      const effects = {};
      const notes = [];
      const uniqueCategories = unique(this.state.weekCategories);
      if (uniqueCategories.length >= CFG.Game.balancedCategoryCount) {
        mergeEffects(effects, CFG.WeeklyEffects.balanced);
        this.state.balancedWeeks += 1;
        notes.push('均衡奖励：情绪 +3、自我认同 +2');
      }
      if (this.state.weekPressureCount >= CFG.Game.pressureOverloadCount) {
        mergeEffects(effects, CFG.WeeklyEffects.pressureOverload);
        this.state.overloadWeeks += 1;
        notes.push('压力过载：健康 -8、情绪 -5');
      }
      if (this.hasHabit('selfDiscipline') && this.state.attrs.social < CFG.Game.socialLowThreshold) {
        mergeEffects(effects, CFG.WeeklyEffects.selfDisciplineLowSocial);
        notes.push('自律副作用：社交偏低，情绪 -1');
      }
      if (this.hasHabit('networkRadar')) {
        mergeEffects(effects, CFG.WeeklyEffects.networkRadar);
        notes.push('人脉雷达维护成本：健康 -1');
      }
      if (this.hasHabit('loveFilter')) {
        mergeEffects(effects, CFG.WeeklyEffects.loveFilter);
        notes.push('恋爱滤镜日常开销：金钱 -2');
      }
      if (this.hasHabit('workerAwake')) {
        mergeEffects(effects, CFG.WeeklyEffects.workerAwake);
        notes.push('打工人觉醒副作用：情绪 -2');
      }
      const changes = this.applyEffects(effects, 'weekly', `week-${this.state.week}`);
      this.state.lastWeeklySummary = notes.join('；');
      this.state.settledWeeks.push(this.state.week);
      if (changes.length > 0) {
        this.state.weeklyEffectHistory.push({ week: this.state.week, effects: changes, notes: notes.slice() });
      }
      return changes;
    },

    pickWeekendEvent() {
      const week = this.state.week;
      const forced = CFG.Events.find((event) => event.forceWeek === week && this.checkEventCondition(event));
      if (forced !== undefined && this.hasEventHappened(forced.id) === false) return forced;

      const eligible = CFG.Events
        .filter((event) => !event.forceWeek)
        .filter((event) => week >= event.minWeek && week <= event.maxWeek)
        .filter((event) => this.checkEventCondition(event))
        .filter((event) => !this.hasEventHappened(event.id) || event.id === 'finalMaterials')
        .sort((a, b) => b.priority - a.priority);

      const critical = eligible.find((event) => event.id === 'overnightBackfire' || event.id === 'attendance');
      if (critical && (this.state.attrs.health < CFG.Game.lowAttributeThreshold || this.state.attrs.academic < CFG.Game.lowAttributeThreshold)) return critical;

      const stage = this.getStage(week);
      if (Math.random() > stage.eventRate) return null;
      if (eligible.length === 0) return null;
      return weightedPick(eligible, (event) => event.priority);
    },

    checkEventCondition(event) {
      const week = this.state.week;
      switch (event.condition) {
        case 'academicRisk': return this.state.attrs.academic < 45 || this.getCardCount('sleep') >= 2;
        case 'clubInterview': return week >= 5 && week <= 8 && this.state.attrs.social >= 45;
        case 'workConflict': return this.countGroup('workIntern') >= 2;
        case 'midterm': return week === 8;
        case 'dormTalk': return this.state.attrs.social >= 40 || this.getCardCount('dinner') >= 2;
        case 'competitionReady': return week >= 9 && week <= 12 && this.state.attrs.skill >= 45;
        case 'loveProject': return this.hasHabit('loveFilter') && this.hasHabit('projectBurn');
        case 'finalMaterials': return week >= 13 && week <= 16;
        case 'healthRisk': return this.state.attrs.health < 30 || this.hasHabit('nightEnergy');
        case 'startupPitch': return this.countGroup('startupProjectCompetition') >= 3 && this.state.attrs.identity >= 60;
        default: return true;
      }
    },

    showStoryFlow(candidate, next) {
      this.clearOverlay();
      this.state.pendingNext = null;
      this.state.resumeNextAfterStory = next;
      const fallback = this.buildNarrationStory(candidate && candidate.card ? candidate.card : null);
      const story = candidate && candidate.entry ? this.prepareStory(candidate.entry, candidate.card) : fallback;
      if (story.kind === 'narration') {
        this.showNarration(story, next);
      } else {
        this.showStoryScene(story, next);
      }
    },

    buildNarrationStory(card) {
      const pool = card && CFG.StoryNarrations[card.id] ? CFG.StoryNarrations[card.id] : [CFG.Story.defaultNarration];
      const narration = pool[Math.floor(Math.random() * pool.length)] || CFG.Story.defaultNarration;
      return {
        id: `narration-${card ? card.id : 'campus'}`,
        title: CFG.Story.quickNarrationTitle,
        kind: 'narration',
        scene: narration.scene || 'background',
        sceneLabel: narration.sceneLabel,
        text: narration.text,
        cardId: card ? card.id : null
      };
    },

    showNarration(story, next) {
      const sceneImage = this.storySceneImageHtml(story.scene, 'story-bg-img', story.sceneLabel);
      this.dom.overlay.innerHTML = `
        <div class="story-layer quick" data-story-kind="narration" style="--story-wash-top:${CFG.Story.washTopAlpha};--dialogue-bg-alpha:${CFG.Story.dialogueBgAlpha}">
          ${sceneImage}
          <div class="story-wash"></div>
          <div class="ui-stage">
            <div class="story-week-badge">第 ${this.state.week} 周 · ${story.sceneLabel}</div>
            <div class="narration-card">
              <div class="narration-kicker">${story.title}</div>
              <div class="narration-text">${story.text}</div>
            </div>
          </div>
        </div>
      `;
      let canContinue = false;
      const finish = () => {
        if (!canContinue) return;
        this.endNarration(next);
      };
      window.setTimeout(() => { canContinue = true; }, CFG.Story.narrationSkipMs);
      this.feedbackTimer = window.setTimeout(() => {
        canContinue = true;
        finish();
      }, CFG.Story.narrationAutoMs);
      const layer = this.dom.overlay.querySelector('.story-layer');
      Input.bindTap(layer, finish);
    },

    storySceneImageHtml(key, className, fallbackText) {
      if (key === 'background') return Loader.imageHtml('background', className, fallbackText);
      return Loader.imageHtml(key, className, fallbackText);
    },

    prepareStory(entry, card) {
      const story = clone(entry);
      this.state.storyBook = normalizeStoryBook(this.state.storyBook);
      const isEgg = story.kind === 'egg';
      const alreadyStory = this.isStoryUnlocked(story.id);
      const alreadyEgg = isEgg && this.isEggUnlocked(story.eggId);
      const alreadyCharacter = story.character && this.isCharacterUnlocked(story.character);
      const now = new Date().toISOString();
      const changes = [];
      const unlocked = { story: false, egg: false, character: false, characterId: story.character || null };

      story.cardId = card ? card.id : null;
      story.dialogues = this.resolveStoryDialogues(story.dialogues || []);
      if (!alreadyStory) {
        this.state.storyBook.unlockedStories[story.id] = { id: story.id, title: story.title, kind: story.kind, firstUnlockedAt: now, lastWeek: this.state.week };
        unlocked.story = story.kind !== 'egg';
      } else if (this.state.storyBook.unlockedStories[story.id]) {
        this.state.storyBook.unlockedStories[story.id].lastWeek = this.state.week;
      }
      if (isEgg && story.eggId) {
        if (!alreadyEgg) {
          const egg = STORY_COLLECTIBLE_BY_ID[story.eggId] || { title: story.title };
          this.state.storyBook.unlockedEggs[story.eggId] = { id: story.eggId, title: egg.title, firstUnlockedAt: now, lastWeek: this.state.week };
          unlocked.egg = true;
        } else if (this.state.storyBook.unlockedEggs[story.eggId]) {
          this.state.storyBook.unlockedEggs[story.eggId].lastWeek = this.state.week;
        }
      }
      if (story.character) {
        if (!alreadyCharacter) {
          const character = STORY_CHARACTER_BY_ID[story.character];
          this.state.storyBook.unlockedCharacters[story.character] = { id: story.character, name: character ? character.name : story.character, firstUnlockedAt: now, lastWeek: this.state.week };
          unlocked.character = true;
        } else if (this.state.storyBook.unlockedCharacters[story.character]) {
          this.state.storyBook.unlockedCharacters[story.character].lastWeek = this.state.week;
        }
      }
      if (story.reward && (unlocked.story || unlocked.egg)) {
        changes.push(...this.applyEffects(story.reward, 'story', story.id));
        if (changes.length > 0) this.state.comboMessage = `剧情反馈：${this.formatChangesInline(changes)}`;
      }
      const newCount = (unlocked.story ? 1 : 0) + (unlocked.egg ? 1 : 0) + (unlocked.character ? 1 : 0);
      if (newCount > 0) {
        this.state.storyNewThisRun.push({ id: story.id, count: newCount, week: this.state.week });
      }
      this.state.storyHistory.push({
        id: story.id,
        kind: story.kind,
        week: this.state.week,
        cardId: story.cardId,
        newCount
      });
      this.saveStoryBook(this.state.storyBook);
      story.unlocked = unlocked;
      story.rewardChanges = changes;
      story.stamp = this.getStoryStamp(story, unlocked, alreadyStory, alreadyEgg);
      return story;
    },

    showStoryScene(story, next) {
      this.state.currentStory = { id: story.id, dialogueIndex: 0, canContinue: false, next };
      Loader.play('storyReveal');
      this.renderStoryScene(story, 0);
      if (story.rewardChanges && story.rewardChanges.length > 0) {
        this.showFloatingChanges(story.rewardChanges, null, true);
      }
      if (story.unlocked && (story.unlocked.character || story.unlocked.egg || story.unlocked.story)) {
        this.spawnParticles('habit', CFG.UI.eventParticleX, CFG.UI.eventParticleY);
      }
    },

    renderStoryScene(story, dialogueIndex) {
      const dialogue = story.dialogues[dialogueIndex] || { speaker: '旁白', text: story.narration };
      const textClass = dialogue.text.length > CFG.Story.dialogueTinyTextLimit ? ' tiny' : (dialogue.text.length > CFG.Story.dialogueSmallTextLimit ? ' small' : '');
      const character = story.character ? STORY_CHARACTER_BY_ID[story.character] : null;
      const characterHtml = character ? `
        <div class="story-character ${story.characterSide === 'right' ? 'right' : 'left'}">
          ${Loader.imageHtml(character.asset, 'story-character-img', character.name)}
        </div>
      ` : '';
      const illustrationHtml = story.illustration ? `
        <div class="story-illustration">
          ${Loader.imageHtml(story.illustration, 'story-illustration-img', story.title)}
        </div>
      ` : '';
      const progress = this.getStoryProgress(this.state.storyBook);
      this.dom.overlay.innerHTML = `
        <div class="story-layer full" data-story-id="${story.id}" style="--story-wash-top:${CFG.Story.washTopAlpha};--dialogue-bg-alpha:${CFG.Story.dialogueBgAlpha}">
          ${this.storySceneImageHtml(story.scene, 'story-bg-img', story.sceneLabel)}
          <div class="story-wash"></div>
          <div class="ui-stage">
            <div class="story-week-badge">第 ${this.state.week} 周 · ${story.sceneLabel}</div>
            <button class="story-skip" data-action="story-skip" aria-disabled="true">${CFG.Story.skipText}</button>
            ${characterHtml}
            ${illustrationHtml}
            <div class="story-stamp ${story.unlocked && (story.unlocked.character || story.unlocked.egg || story.unlocked.story) ? 'new' : ''}">${story.stamp}</div>
            <div class="story-progress-mini">${CFG.Story.progressTitle} ${progress.characters}/${CFG.Story.totalCharacters} · ${progress.stories}/${CFG.Story.totalStories} · ${progress.eggs}/${CFG.Story.totalEggs}</div>
            <div class="dialogue-note">
              <div class="dialogue-head">
                <span>${dialogue.speaker}</span>
                <span>${dialogueIndex + 1}/${story.dialogues.length}</span>
              </div>
              <div class="dialogue-body${textClass}">${dialogue.text}</div>
              <button class="dialogue-next" data-action="story-next" disabled>${CFG.Story.continueText}</button>
            </div>
          </div>
        </div>
      `;
      const nextButton = this.dom.overlay.querySelector('[data-action="story-next"]');
      const skipButton = this.dom.overlay.querySelector('[data-action="story-skip"]');
      const layer = this.dom.overlay.querySelector('.story-layer');
      const unlockContinue = () => {
        const current = this.state.currentStory;
        if (!current || current.id !== story.id) return;
        current.canContinue = true;
        if (nextButton !== null) nextButton.disabled = false;
        if (skipButton !== null) skipButton.setAttribute('aria-disabled', 'false');
      };
      window.setTimeout(unlockContinue, CFG.Story.dialogueContinueMs);
      this.feedbackTimer = window.setTimeout(() => {
        if (nextButton !== null) nextButton.classList.add('pulse');
      }, CFG.Story.dialoguePromptMs);
      Input.bindTap(nextButton, () => this.advanceStoryDialogue(story));
      Input.bindTap(skipButton, () => this.skipStory(story));
      Input.bindTap(layer, (event) => {
        const target = event && event.target ? event.target : null;
        if (target && (target.closest('.dialogue-next') || target.closest('.story-skip'))) return;
        this.advanceStoryDialogue(story);
      });
    },

    advanceStoryDialogue(story) {
      const current = this.state.currentStory;
      if (!current || current.id !== story.id || current.canContinue !== true) return;
      if (this.feedbackTimer !== 0) window.clearTimeout(this.feedbackTimer);
      current.dialogueIndex += 1;
      current.canContinue = false;
      if (current.dialogueIndex >= story.dialogues.length) {
        this.endStoryScene(current.next);
        return;
      }
      this.renderStoryScene(story, current.dialogueIndex);
    },

    skipStory(story) {
      const current = this.state.currentStory;
      if (!current || current.id !== story.id || current.canContinue !== true) return;
      this.endStoryScene(current.next);
    },

    endStoryScene(next) {
      if (this.feedbackTimer !== 0) window.clearTimeout(this.feedbackTimer);
      this.state.currentStory = null;
      const layer = this.dom.overlay.querySelector('.story-layer');
      if (layer !== null) layer.classList.add('leaving');
      window.setTimeout(() => this.completeActionFlow(next), CFG.Story.sceneFadeMs);
    },

    endNarration(next) {
      if (this.feedbackTimer !== 0) window.clearTimeout(this.feedbackTimer);
      const layer = this.dom.overlay.querySelector('.story-layer');
      if (layer !== null) layer.classList.add('leaving');
      window.setTimeout(() => this.completeActionFlow(next), CFG.Story.sceneFadeMs);
    },

    pickStoryCandidate(card, newHabits) {
      const forced = this.getForcedStory(card, newHabits);
      if (forced) {
        this.state.storyMisses = 0;
        this.incrementWeeklyStory(forced);
        return { entry: forced, card, forced: true };
      }

      const eligible = this.getEligibleStories(card, false);
      if (!eligible.length) {
        this.state.storyMisses += 1;
        return { entry: null, card };
      }
      const hasEgg = eligible.some((entry) => entry.kind === 'egg');
      let rate = CFG.Story.baseRate;
      if (hasEgg) rate += CFG.Story.eggRate;
      rate += this.getStoryCharacterBoost(eligible);
      if (this.state.storyMisses >= CFG.Story.pityMisses) rate = Math.max(rate, CFG.Story.pityRate);
      if (Math.random() > Math.min(rate, CFG.Story.maxTriggerRate)) {
        this.state.storyMisses += 1;
        return { entry: null, card };
      }
      const picked = weightedPick(eligible, (entry) => this.getStoryWeight(entry, card));
      this.state.storyMisses = 0;
      this.incrementWeeklyStory(picked);
      return { entry: picked, card };
    },

    getForcedStory(card, newHabits) {
      const forced = this.getEligibleStories(card, true).sort((a, b) => b.priority - a.priority)[0];
      if (forced) return forced;
      if (newHabits && newHabits.length) {
        const key = newHabits.indexOf('projectBurn') >= 0 ? 'story_deadline_light' : null;
        if (key && this.checkStoryCondition(STORY_BY_ID[key], card, true)) return STORY_BY_ID[key];
      }
      return null;
    },

    getEligibleStories(card, forcedOnly) {
      return (CFG.StoryEntries || [])
        .filter((entry) => this.isStoryKey(entry) === forcedOnly)
        .filter((entry) => this.checkStoryCondition(entry, card, forcedOnly))
        .filter((entry) => this.canShowStory(entry, forcedOnly));
    },

    getWeeklyStoryLimit() {
      return CFG.Story.weeklyExtendedLimit;
    },

    canShowStory(entry, forcedOnly) {
      if (!entry) return false;
      if (forcedOnly !== true && entry.kind !== 'key' && this.state.weeklyStoryCount >= this.getWeeklyStoryLimit()) return false;
      if (this.state.storyHistory.some((item) => item.id === entry.id)) return false;
      if (entry.kind === 'egg' && forcedOnly !== true && this.isEggUnlocked(entry.eggId) && Math.random() > CFG.Story.conditionBoostRate) return false;
      return true;
    },

    isStoryKey(entry) {
      return entry && (entry.kind === 'key' || entry.condition === 'firstClass' || entry.condition === 'midtermEcho');
    },

    incrementWeeklyStory(entry) {
      if (entry && entry.kind !== 'key') this.state.weeklyStoryCount += 1;
    },

    getStoryWeight(entry, card) {
      let weight = entry.priority || 10;
      if (entry.kind === 'egg') weight += Math.round(CFG.Story.eggRate * 100);
      if (entry.character && this.isCharacterUnlocked(entry.character)) weight += Math.round(CFG.Story.unlockedCharacterBoost * 100);
      if (card && entry.condition && entry.condition.toLowerCase().indexOf(card.id) >= 0) weight += CFG.Story.conditionNameBoost;
      return Math.max(weight, 1);
    },

    getStoryCharacterBoost(entries) {
      const hasUnlocked = entries.some((entry) => entry.character && this.isCharacterUnlocked(entry.character));
      return hasUnlocked ? CFG.Story.unlockedCharacterBoost : 0;
    },

    checkStoryCondition(entry, card, forcedOnly) {
      if (!entry || !card) return false;
      const week = this.state.week;
      switch (entry.condition) {
        case 'firstClass': return week === 1 && this.state.totalActionsTaken >= 2;
        case 'libraryNote': return card.id === 'library' && (this.state.attrs.academic >= 55 || this.lastSelectionsInGroup('study', 2));
        case 'dormTalkStory': return ['dinner', 'sleep', 'video', 'game'].indexOf(card.id) >= 0;
        case 'clubBooth': return ['club', 'chat'].indexOf(card.id) >= 0 || this.state.attrs.social >= 55;
        case 'deadlineLight': return this.countGroup('projectCompetitionStartup') >= 3;
        case 'skipRescue': return this.getCardCount('sleep') >= 2 || this.state.attrs.academic < 45;
        case 'loveMixup': return this.getCardCount('love') >= 2;
        case 'workShiftStory': return this.countGroup('workIntern') >= 2;
        case 'snackCache': return this.state.attrs.mood < 45 && ['dinner', 'video', 'sleep'].indexOf(card.id) >= 0;
        case 'campusCat': return (this.cardInGroup(card, 'social') || card.id === 'sport') && (forcedOnly || Math.random() < CFG.Story.conditionBoostRate);
        case 'finalPacketEgg': return week >= 13 && (card.id === 'review' || card.id === 'graduate' || this.state.attrs.academic < 50);
        case 'midtermEcho': return week === 8 && this.state.midtermShown === true;
        default: return false;
      }
    },

    getStoryStamp(story, unlocked, alreadyStory, alreadyEgg) {
      if (unlocked.character) {
        const character = STORY_CHARACTER_BY_ID[unlocked.characterId];
        return `${CFG.Story.characterStamp} · ${character ? character.name : ''}`;
      }
      if (story.kind === 'egg') return unlocked.egg ? CFG.Story.newEggStamp : CFG.Story.knownEggStamp;
      if (story.kind === 'key') return alreadyStory ? CFG.Story.knownStoryStamp : CFG.Story.newStoryStamp;
      return alreadyStory ? CFG.Story.knownStoryStamp : CFG.Story.newStoryStamp;
    },

    resolveStoryDialogues(dialogues) {
      const top = this.getTopEndingScores()[0];
      const weakest = this.getWeakestAttribute();
      return dialogues.map((line) => ({
        speaker: line.speaker,
        text: line.text
          .replace('{route}', top ? top.ending.name : '迷茫新生')
          .replace('{weak}', weakest ? CFG.Attributes[weakest.key].label : '短板')
      }));
    },

    showEvent(event) {
      Loader.play('eventPopup');
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="dialog-card">
            <h2 class="dialog-title">${event.title}</h2>
            <p class="dialog-text">${event.description}</p>
            ${this.state.lastWeeklySummary ? `<div class="note-line">${this.state.lastWeeklySummary}</div>` : ''}
            <div class="option-list">
              ${event.options.map((option, index) => `
                <button class="option-btn" data-option-index="${index}">
                  <div class="option-name">${option.label}</div>
                  <div class="option-hint">${option.hint}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div></div>
      `;
      event.options.forEach((option, index) => {
        const button = this.dom.overlay.querySelector(`[data-option-index="${index}"]`);
        Input.bindTap(button, () => this.resolveEvent(event, option));
      });
    },

    resolveEvent(event, option) {
      Loader.play('cardSelect');
      const changes = this.applyEffects(option.effects, 'event', event.id);
      this.state.eventHistory.push({
        week: this.state.week,
        eventId: event.id,
        option: option.label,
        effects: changes.map((item) => ({ attr: item.attr, delta: item.delta }))
      });
      this.recordRoast(this.pickEventRoast(event, changes));
      this.state.comboMessage = `周末事件完成：${option.hint}`;
      this.renderPlay();
      this.showEventResult(event, option, changes);
      this.showFloatingChanges(changes, null, true);
      this.spawnParticles('event', CFG.UI.eventParticleX, CFG.UI.eventParticleY);
      this.handleImpactFeedback(changes);
    },

    showEventResult(event, option, changes) {
      const changeText = changes.length ? changes.map((item) => `${CFG.Attributes[item.attr].label} ${formatSigned(item.delta)}`).join(' / ') : '属性没有变化';
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="dialog-card">
            <h2 class="dialog-title">${event.title}</h2>
            <p class="dialog-text">你选择了「${option.label}」。</p>
            <div class="note-line">${changeText}</div>
            <button class="btn primary" data-action="event-continue">继续</button>
          </div>
        </div></div>
      `;
      this.bindOverlayButton('event-continue', () => this.afterWeekendEvent());
    },

    showNoEventDialog() {
      const roast = this.pickRoast(null, [], []);
      this.recordRoast(roast);
      this.renderPlay();
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="dialog-card">
            <h2 class="dialog-title">${CFG.Game.weekendNoEventTitle}</h2>
            <p class="dialog-text">${CFG.Game.weekendNoEventText}</p>
            ${this.state.lastWeeklySummary ? `<div class="note-line">${this.state.lastWeeklySummary}</div>` : `<div class="note-line">${roast.text}</div>`}
            <button class="btn primary" data-action="event-continue">进入下一周</button>
          </div>
        </div></div>
      `;
      this.bindOverlayButton('event-continue', () => this.afterWeekendEvent());
    },

    afterWeekendEvent() {
      this.clearOverlay();
      if (this.state.week === 8 && !this.state.midtermShown) {
        this.showMidtermFeedback();
        return;
      }
      this.advanceWeekOrFinish();
    },

    showMidtermFeedback() {
      this.state.midtermShown = true;
      Loader.play('eventPopup');
      const top = this.getTopEndingScores()[0];
      const weakest = this.getWeakestAttribute();
      const advice = CFG.Midterm.advice[weakest.key] || CFG.Midterm.advice.identity;
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="dialog-card">
            <h2 class="dialog-title">${CFG.Midterm.title}</h2>
            <div class="midterm-list">
              <div class="note-line">${CFG.Midterm.strongestPrefix}${top.ending.name}预备役</div>
              <div class="note-line">${CFG.Midterm.weakPrefix}${CFG.Attributes[weakest.key].label}正在请求下线</div>
            </div>
            <p class="dialog-text">${CFG.Midterm.adviceTitle}</p>
            <div class="note-line">1. ${advice[0]}</div>
            <div class="note-line">2. ${advice[1]}</div>
            <button class="btn primary" data-action="midterm-continue">继续下半学期</button>
          </div>
        </div></div>
      `;
      this.bindOverlayButton('midterm-continue', () => {
        const entry = STORY_BY_ID.story_midterm_echo;
        if (entry && !this.state.storyHistory.some((item) => item.id === entry.id)) {
          const lastSelection = this.state.selectedHistory[this.state.selectedHistory.length - 1];
          const card = lastSelection ? CARD_BY_ID[lastSelection.cardId] : CARD_BY_ID.class;
          const story = this.prepareStory(entry, card || CARD_BY_ID.class);
          this.showStoryScene(story, { type: 'advance-week' });
        } else {
          this.clearOverlay();
          this.advanceWeekOrFinish();
        }
      });
    },

    advanceWeekOrFinish() {
      if (this.state.week >= CFG.Game.totalWeeks) {
        this.finishGame();
        return;
      }
      this.state.week += 1;
      this.state.actionIndexInWeek = 0;
      this.state.stage = this.getStage(this.state.week).id;
      this.state.weekCategories = [];
      this.state.weekPressureCount = 0;
      this.state.weeklyStoryCount = 0;
      this.state.lastWeeklySummary = '';
      this.state.pendingNext = null;
      this.state.cardLocked = false;
      this.state.selectedVisual = null;
      this.state.currentCards = this.generateCards();
      this.showPlayScreen();
    },

    finishGame() {
      this.clearOverlay();
      this.removeSavedGame();
      const route = this.determineEnding();
      const representativeRoasts = this.getRepresentativeRoasts();
      const isCollectible = route.ending.id !== CFG.FallbackEnding.id;
      const dexBefore = this.loadDex();
      const isNew = isCollectible && !dexBefore.items[route.ending.id];
      const score = this.calculateFinalScore(route.score, isNew);
      const star = this.getStarInfo(score);
      const dexAfter = isCollectible ? this.updateDex(route.ending, star, representativeRoasts[0]) : dexBefore;
      this.state.dex = dexAfter;
      this.state.lastResult = { route, score, star, representativeRoasts, isNew };
      this.state.screen = 'result';
      this.renderResult();
      Loader.play('endingFanfare');
      this.spawnParticles('ending', CFG.UI.endingParticleX, CFG.UI.endingParticleY);
      if (route.ending.rarityRank >= 2 || isNew) this.shake(CFG.UI.shakeMinorPower);
    },

    renderResult() {
      const result = this.state.lastResult;
      const ending = result.route.ending;
      const progress = this.getDexProgress(this.state.dex);
      this.dom.scene.innerHTML = `
        <section class="scene report-scene">
          <div class="ui-stage">
          <div class="report-card">
            <div class="report-head">
              <div class="avatar-frame">${Loader.imageHtml(ending.avatar, 'avatar-img', ending.name)}</div>
              <div>
                <div class="report-kicker">${result.isNew ? '新人格解锁' : '期末人格结算'}</div>
                <h1 class="ending-name">${ending.name}</h1>
                <div class="rarity-line">稀有度：${ending.rarity} <span class="stars">${renderStars(result.star.stars)}</span></div>
                <div class="score-line">总分：${result.score} / 100</div>
                <div class="dex-progress">已收集 ${progress.count}/${CFG.Game.dexTotal}</div>
              </div>
            </div>
            <div class="ending-desc">${ending.description}<br>${result.star.text}</div>
            <div class="report-section-title">七项属性变化</div>
            <div class="final-attrs">${this.renderFinalAttributes()}</div>
            <div class="report-section-title">本局习惯标签</div>
            <div class="report-habits">${this.renderReportHabits()}</div>
            <div class="report-section-title">代表吐槽画像</div>
            <div class="report-roasts">${result.representativeRoasts.map((text) => `<div class="note-line">${text}</div>`).join('')}</div>
            <div class="report-section-title">校园纪事</div>
            <div class="note-line story-result-line">本局新增校园纪事 ${this.getStoryNewCountThisRun()} 条 · ${this.renderStoryProgressText()}</div>
            <div class="report-actions">
              <button class="btn primary" data-action="again">再来一局</button>
              <button class="btn secondary" data-action="dex">查看图鉴</button>
              <button class="btn secondary" data-action="home">返回首页</button>
            </div>
          </div>
          </div>
        </section>
      `;
      this.bindSceneButton('again', () => {
        Loader.startMusic();
        this.startNewGame();
      });
      this.bindSceneButton('dex', () => this.showDexScreen());
      this.bindSceneButton('home', () => this.showStartScreen());
    },

    renderFinalAttributes() {
      return ATTR_KEYS.map((key) => {
        const value = this.state.attrs[key];
        const delta = value - this.state.initialAttrs[key];
        return `<div class="final-attr ${key}">${CFG.Attributes[key].label}<span>${value} (${formatSigned(delta)})</span></div>`;
      }).join('');
    },

    renderReportHabits() {
      if (!this.state.habits.length) return '<span class="tag-chip">本局还没有稳定习惯</span>';
      return this.state.habits.map((id, index) => `<span class="tag-chip" style="--rot:${this.getChipRotation(index)}deg">${HABIT_BY_ID[id].name}</span>`).join('');
    },

    showDexScreen(section, storyTab) {
      this.clearTimers();
      this.clearOverlay();
      const view = section || 'persona';
      const activeStoryTab = storyTab || 'characters';
      this.state.screen = 'dex';
      this.state.dex = this.loadDex();
      this.state.storyBook = this.loadStoryBook();
      const progress = this.getDexProgress(this.state.dex);
      const storyProgress = this.getStoryProgress(this.state.storyBook);
      const body = view === 'story'
        ? this.renderStoryBookPanel(activeStoryTab, storyProgress)
        : `
          <div class="dex-grid">${CFG.Endings.map((ending, index) => this.renderDexItem(ending, index)).join('')}</div>
          <div class="dex-actions">
            <button class="btn secondary" data-action="home">返回首页</button>
            <button class="btn secondary" data-action="story-book">校园纪事</button>
            <button class="btn danger" data-action="reset-dex">重置图鉴</button>
          </div>
        `;
      this.dom.scene.innerHTML = `
        <section class="scene dex-scene">
          <div class="ui-stage">
          <div class="dex-panel ${view === 'story' ? 'story-book-panel' : ''}">
            <div class="dex-header">
              <div>
                <div class="dex-title">${view === 'story' ? '校园纪事' : '人格图鉴'}</div>
                <div class="story-progress-line">人物 ${storyProgress.characters}/${CFG.Story.totalCharacters} · 剧情 ${storyProgress.stories}/${CFG.Story.totalStories} · 彩蛋 ${storyProgress.eggs}/${CFG.Story.totalEggs}</div>
              </div>
              <div class="dex-count">${progress.count}/${CFG.Game.dexTotal}</div>
            </div>
            ${body}
          </div>
          </div>
        </section>
      `;
      if (view === 'story') {
        this.bindSceneButton('dex-persona', () => this.showDexScreen('persona'));
        CFG.Story.tabs.forEach((tab) => this.bindSceneButton(`story-tab-${tab.id}`, () => this.showDexScreen('story', tab.id)));
        this.bindSceneButton('home', () => this.showStartScreen());
      } else {
        this.bindSceneButton('home', () => this.showStartScreen());
        this.bindSceneButton('story-book', () => this.showDexScreen('story', 'characters'));
        this.bindSceneButton('reset-dex', () => this.confirmResetDex());
      }
    },

    renderStoryBookPanel(activeTab, progress) {
      return `
        <div class="story-tabs">
          <button class="btn small secondary" data-action="dex-persona">人格</button>
          ${CFG.Story.tabs.map((tab) => `<button class="btn small ${tab.id === activeTab ? 'primary' : 'secondary'}" data-action="story-tab-${tab.id}">${tab.label}</button>`).join('')}
        </div>
        <div class="story-progress-card">
          <span>人物 ${progress.characters}/${CFG.Story.totalCharacters}</span>
          <span>剧情 ${progress.stories}/${CFG.Story.totalStories}</span>
          <span>彩蛋 ${progress.eggs}/${CFG.Story.totalEggs}</span>
        </div>
        <div class="story-book-grid ${activeTab}" style="--story-line-min-height:${CFG.Story.storyLineMinHeight}px;--story-book-grid-height:${CFG.Story.storyBookGridHeight}px">${this.renderStoryBookItems(activeTab)}</div>
        <div class="dex-actions story-actions">
          <button class="btn secondary" data-action="home">返回首页</button>
          <button class="btn secondary" data-action="dex-persona">人格图鉴</button>
        </div>
      `;
    },

    renderStoryBookItems(tab) {
      if (tab === 'characters') {
        return CFG.StoryCharacters.map((character) => {
          const entry = this.state.storyBook.unlockedCharacters[character.id];
          const unlocked = Boolean(entry);
          return `
            <div class="story-book-item ${unlocked ? '' : 'locked'}">
              ${Loader.imageHtml(character.asset, 'story-book-img', character.name)}
              <div class="story-book-name">${unlocked ? character.name : '未遇见'}</div>
              <div class="story-book-meta">${unlocked ? character.profile : character.hint}</div>
            </div>
          `;
        }).join('');
      }
      if (tab === 'eggs') {
        return CFG.StoryCollectibles.map((egg) => {
          const entry = this.state.storyBook.unlockedEggs[egg.id];
          const unlocked = Boolean(entry);
          return `
            <div class="story-book-item ${unlocked ? '' : 'locked'}">
              ${Loader.imageHtml(egg.asset, 'story-book-img', egg.title)}
              <div class="story-book-name">${unlocked ? egg.title : '未发现彩蛋'}</div>
              <div class="story-book-meta">${unlocked ? egg.description : egg.hint}</div>
            </div>
          `;
        }).join('');
      }
      return CFG.StoryEntries.filter((entry) => entry.kind !== 'egg').map((entry) => {
        const unlocked = Boolean(this.state.storyBook.unlockedStories[entry.id]);
        return `
          <div class="story-book-item story-line ${unlocked ? '' : 'locked'}">
            <div class="story-book-badge">${entry.kind === 'key' ? '关键' : '剧情'}</div>
            <div class="story-book-name">${unlocked ? entry.title : '未收录剧情'}</div>
            <div class="story-book-meta">${unlocked ? entry.narration : this.getStoryHint(entry)}</div>
          </div>
        `;
      }).join('');
    },

    getStoryHint(entry) {
      const hints = {
        firstClass: '第 1 周第 2 次行动保底出现。',
        dormTalkStory: '宿舍放松后可能触发。',
        clubBooth: '参加社团或社交活跃时触发。',
        deadlineLight: '项目、比赛、创业累计较多时触发。',
        skipRescue: '逃课较多或学业偏低时触发。',
        loveMixup: '恋爱路线升温后触发。',
        workShiftStory: '打工或实习累计后触发。',
        midtermEcho: '期中反馈后触发。'
      };
      return hints[entry.condition] || '继续选择相关行为后可能出现。';
    },

    renderDexItem(ending, index) {
      const entry = this.state.dex.items[ending.id];
      const unlocked = Boolean(entry);
      const lockKey = `lock_${(index % 3) + 1}`;
      const avatar = unlocked ? ending.avatar : lockKey;
      const name = unlocked ? ending.name : '待解锁';
      const meta = unlocked ? `${ending.rarity} / 最高 ${renderStars(entry.highestStars)}` : ending.hint;
      return `
        <div class="dex-item ${unlocked ? '' : 'locked'}">
          ${Loader.imageHtml(avatar, 'dex-avatar', name)}
          <div class="dex-name">${name}</div>
          <div class="dex-meta">${meta}</div>
        </div>
      `;
    },

    confirmResetDex() {
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="dialog-card">
            <h2 class="dialog-title">重置图鉴？</h2>
            <p class="dialog-text">已经解锁的人格会被清空，但校园纪事会保留，不会影响当前新开一局。</p>
            <div class="option-list">
              <button class="btn danger" data-action="confirm-reset">确认重置</button>
              <button class="btn secondary" data-action="cancel-reset">先留着</button>
            </div>
          </div>
        </div></div>
      `;
      this.bindOverlayButton('confirm-reset', () => {
        this.saveDex({ items: {} });
        this.state.dex = this.loadDex();
        this.clearOverlay();
        this.showDexScreen();
        this.showToast('人格图鉴已重置。');
      });
      this.bindOverlayButton('cancel-reset', () => this.clearOverlay());
    },

    showPauseMenu() {
      if (this.state.screen !== 'play') return;
      if (this.state.currentStory || this.state.resumeNextAfterStory || (this.state.cardLocked && !this.state.pendingNext)) return;
      if (this.state.cardLocked && !this.state.pendingNext) {
        const weekDone = this.state.actionIndexInWeek >= this.getActionsThisWeek();
        this.state.pendingNext = {
          type: weekDone ? 'weekend' : 'action',
          label: weekDone ? '进入周末事件' : '下一次选择'
        };
      }
      this.saveGame();
      this.dom.overlay.innerHTML = `
        <div class="overlay-dim"><div class="ui-stage">
          <div class="pause-card">
            <div class="pause-title">暂停一下</div>
            <div class="pause-actions">
              <button class="btn primary" data-action="resume">继续</button>
              <button class="btn secondary" data-action="restart">重新开始</button>
              <button class="btn secondary" data-action="mute">${this.isMuted() ? '打开音效' : '关闭音效'}</button>
              <button class="btn secondary" data-action="home">返回首页</button>
            </div>
          </div>
        </div></div>
      `;
      this.bindOverlayButton('resume', () => {
        this.clearOverlay();
        Loader.startMusic();
      });
      this.bindOverlayButton('restart', () => {
        Loader.startMusic();
        this.startNewGame();
      });
      this.bindOverlayButton('mute', () => {
        this.setMuted(!this.isMuted());
        this.showPauseMenu();
      });
      this.bindOverlayButton('home', () => this.showStartScreen());
    },

    formatChangesInline(changes) {
      return changes.map((item) => `${CFG.Attributes[item.attr].label} ${formatSigned(item.delta)}`).join(' / ');
    },

    buildComboMessage(comboText, newHabits) {
      const pieces = [];
      if (comboText) pieces.push(comboText);
      if (newHabits.length) pieces.push(`新习惯解锁：${newHabits.map((id) => HABIT_BY_ID[id].name).join('、')}`);
      if (this.state.totalActionsTaken === CFG.Game.comboCount) pieces.push(CFG.Game.firstRouteHint);
      const shortfall = this.getShortfallText();
      if (shortfall) pieces.push(shortfall);
      if (!pieces.length) {
        const top = this.getTopEndingScores()[0];
        pieces.push(`路线预兆：${top.ending.name}气息 +1`);
      }
      return pieces.join('；');
    },

    applyEffects(effects, source, sourceId) {
      const changes = [];
      ATTR_KEYS.forEach((key) => {
        const raw = effects[key] || 0;
        if (raw === 0) return;
        const before = this.state.attrs[key];
        const after = clamp(before + raw, CFG.Game.minAttribute, CFG.Game.maxAttribute);
        const delta = after - before;
        this.state.attrs[key] = after;
        if (delta !== 0) {
          changes.push({ attr: key, delta, source, sourceId });
          if (key === 'health' && delta < 0) this.state.healthDropTotal += Math.abs(delta);
        }
      });
      if (changes.length > 0) {
        this.state.attrHistory.push({
          week: this.state.week,
          actionIndexInWeek: this.state.actionIndexInWeek,
          source,
          sourceId,
          changes: changes.map((item) => ({ attr: item.attr, delta: item.delta }))
        });
      }
      return changes;
    },

    checkHabits() {
      const unlocked = [];
      const tryUnlock = (id) => {
        if (this.hasHabit(id)) return;
        this.state.habits.push(id);
        this.state.habitUnlockHistory.push({ id, atAction: this.state.totalActionsTaken, week: this.state.week });
        if (id === 'procrastination') this.state.procrastinationStudyPenalty = true;
        unlocked.push(id);
      };

      if (this.lastSelectionsInGroup('study', CFG.Game.habitStreakCount)) tryUnlock('selfDiscipline');
      if (this.lastSelectionsInGroup('fishRest', CFG.Game.habitStreakCount)) tryUnlock('procrastination');
      if (this.countGroup('social') >= 5) tryUnlock('networkRadar');
      if (this.countNightBehaviors() >= 4 && this.state.healthDropTotal >= 12) tryUnlock('nightEnergy');
      if (this.getCardCount('reject') >= 3 || (this.state.attrs.social < CFG.Game.lowAttributeThreshold && this.getCardCount('reject') >= 2)) tryUnlock('socialShield');
      if (this.getCardCount('love') >= 3) tryUnlock('loveFilter');
      if (this.countGroup('workIntern') >= 4) tryUnlock('workerAwake');
      if (this.countGroup('projectCompetitionStartup') >= 3) tryUnlock('projectBurn');
      if (this.getCardCount('game') >= 3) tryUnlock('esportsSense');
      if (this.countGroup('sleepVideoDinner') >= 5) tryUnlock('dormAura');
      return unlocked;
    },

    generateCards() {
      const available = CFG.Cards.filter((card) => card.unlockWeek <= this.state.week);
      if (this.state.week === 1 && this.state.actionIndexInWeek === 0) {
        const firstCards = CFG.Game.firstChoiceCardIds.map((id) => CARD_BY_ID[id]);
        this.updateOfferMisses(firstCards);
        return firstCards;
      }

      const selected = [];
      const pushGuaranteed = (groupKey) => {
        const pool = available.filter((card) => this.cardInGroup(card, groupKey) && !selected.find((item) => item.id === card.id));
        if (pool.length) selected.push(weightedPick(pool, (card) => this.getCardWeight(card)));
      };
      if (this.state.noStudyMisses >= CFG.Game.studyGuaranteeMisses) pushGuaranteed('study');
      if (this.state.noRelaxMisses >= CFG.Game.relaxGuaranteeMisses && selected.length < CFG.Game.visibleCardCount) pushGuaranteed('relax');

      while (selected.length < CFG.Game.visibleCardCount) {
        const pool = available.filter((card) => !selected.find((item) => item.id === card.id));
        if (!pool.length) break;
        selected.push(weightedPick(pool, (card) => this.getCardWeight(card)));
      }
      this.updateOfferMisses(selected);
      return selected;
    },

    getCardWeight(card) {
      let weight = CFG.Game.baseCardWeight;
      const stage = this.getStage(this.state.week);
      if (card.unlockWeek >= stage.startWeek && card.unlockWeek <= stage.endWeek) weight += CFG.Game.stageCardBoost;
      if (stage.id >= 3 && this.cardInGroup(card, 'pressure')) weight += CFG.Game.stageCardBoost;
      const top = this.getTopEndingScores()[0];
      if (top && this.cardMatchesEnding(card, top.ending)) weight += CFG.Game.routeCardBoost;
      if (this.state.attrs.academic < CFG.Game.lowAttributeThreshold && this.cardInGroup(card, 'study')) weight += CFG.Game.stageCardBoost * 2;
      if (this.state.attrs.health < CFG.Game.lowAttributeThreshold && (card.id === 'sport' || this.cardInGroup(card, 'relax'))) weight += CFG.Game.stageCardBoost * 2;
      if (this.state.attrs.mood < CFG.Game.lowAttributeThreshold && this.cardInGroup(card, 'relax')) weight += CFG.Game.stageCardBoost;
      if (this.state.attrs.money < 15 && (card.id === 'work' || card.id === 'intern')) weight += CFG.Game.stageCardBoost * 2;
      if (this.state.attrs.social < CFG.Game.lowAttributeThreshold && this.cardInGroup(card, 'social')) weight += CFG.Game.stageCardBoost;
      if (this.state.attrs.skill < CFG.Game.lowAttributeThreshold && this.cardInGroup(card, 'skill')) weight += CFG.Game.stageCardBoost;
      if (this.state.attrs.identity < CFG.Game.lowAttributeThreshold && card.primary === 'identity') weight += CFG.Game.stageCardBoost;
      return Math.max(weight, 1);
    },

    updateOfferMisses(cards) {
      const hasStudy = cards.some((card) => this.cardInGroup(card, 'study'));
      const hasRelax = cards.some((card) => this.cardInGroup(card, 'relax'));
      this.state.noStudyMisses = hasStudy ? 0 : this.state.noStudyMisses + 1;
      this.state.noRelaxMisses = hasRelax ? 0 : this.state.noRelaxMisses + 1;
    },

    determineEnding() {
      const scores = this.getTopEndingScores();
      const best = scores[0];
      if (!best || best.score < CFG.Game.fallbackRouteScore) {
        return { ending: CFG.FallbackEnding, score: best ? best.score : 0, allScores: scores };
      }
      return { ending: best.ending, score: best.score, allScores: scores };
    },

    getTopEndingScores() {
      return CFG.Endings.map((ending) => ({ ending, score: this.scoreEnding(ending) }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.ending.rarityRank !== a.ending.rarityRank) return b.ending.rarityRank - a.ending.rarityRank;
          return b.ending.priority - a.ending.priority;
        });
    },

    scoreEnding(ending) {
      const scoring = ending.scoring || {};
      let score = ending.priority || 0;
      (scoring.attrs || []).forEach((rule) => {
        const value = this.state.attrs[rule.key];
        if (typeof rule.min === 'number' && value >= rule.min) score += rule.points;
        if (typeof rule.max === 'number' && value <= rule.max) score += rule.points;
        if (typeof rule.min === 'number' && value < 35) score -= 20;
      });
      (scoring.groups || []).forEach((rule) => {
        score += Math.min(this.countGroup(rule.key) * rule.per, rule.max);
      });
      (scoring.cards || []).forEach((rule) => {
        score += Math.min(this.getCardCount(rule.id) * rule.per, rule.max);
      });
      (scoring.habits || []).forEach((rule) => {
        if (this.hasHabit(rule.id)) score += rule.points;
      });
      (scoring.specials || []).forEach((rule) => {
        if (rule.type === 'allCoreAttrs') {
          const coreOk = ['academic', 'social', 'skill', 'identity'].every((key) => this.state.attrs[key] >= 65);
          const noShort = ATTR_KEYS.every((key) => this.state.attrs[key] >= 45);
          if (coreOk && noShort) score += rule.points;
        }
        if (rule.type === 'balancedWeeks' && this.state.balancedWeeks >= rule.count) score += rule.points;
      });
      if (this.hasHabit('dormAura') && (ending.id === 'study_king' || ending.id === 'gpa_machine' || ending.id === 'project_burner')) score -= 8;
      return clamp(Math.round(score), 0, CFG.Game.routeScoreCap);
    },

    calculateFinalScore(routeScore, isNew) {
      const attrAvg = ATTR_KEYS.reduce((sum, key) => sum + this.state.attrs[key], 0) / ATTR_KEYS.length;
      const habitRaw = this.state.habits.reduce((sum, id) => {
        const habit = HABIT_BY_ID[id];
        return sum + (habit.quality > 0 ? CFG.Game.positiveHabitScore : CFG.Game.negativeHabitScore);
      }, 0);
      const habitScore = clamp(habitRaw, 0, CFG.Game.habitScoreCap);
      const total = attrAvg * 0.5 + clamp(routeScore, 0, CFG.Game.routeScoreCap) * 0.3 + habitScore + (isNew ? CFG.Game.newCollectionBonus : 0);
      return clamp(Math.round(total), 0, CFG.Game.routeScoreCap);
    },

    getStarInfo(score) {
      return CFG.Stars.find((item) => score >= item.min) || CFG.Stars[CFG.Stars.length - 1];
    },

    pickRoast(card, newHabits, changes) {
      if (newHabits && newHabits.length) {
        const habit = HABIT_BY_ID[newHabits[0]];
        return { id: `habit-${habit.id}`, text: habit.roast, type: 'habit' };
      }
      const types = [];
      if (this.state.attrs.health < CFG.Game.lowAttributeThreshold) types.push('healthLow');
      if (this.state.attrs.money < 15) types.push('moneyLow');
      if (this.state.attrs.social < CFG.Game.lowAttributeThreshold) types.push('socialLow');
      if (this.state.attrs.identity < CFG.Game.identityLostThreshold) types.push('lost');
      if (card) {
        if (card.id === 'class') types.push('class', 'study');
        if (card.id === 'library') types.push('library', 'study');
        if (card.id === 'sport') types.push('sport');
        if (card.id === 'game') types.push('game');
        if (card.id === 'love') types.push('love');
        if (card.id === 'work' || card.id === 'intern') types.push('work');
        if (card.id === 'graduate' || card.id === 'review') types.push('graduate', 'study');
        if (card.id === 'project' || card.id === 'competition' || card.id === 'startup') types.push('project', 'identity');
        if (card.id === 'club' || card.id === 'chat') types.push('social');
        if (card.id === 'dinner') types.push('social', 'dorm');
        if (card.id === 'sleep' || card.id === 'video') types.push('fish', 'dorm');
      }
      if (this.state.balancedWeeks > 0) types.push('balanced');
      if (!types.length && changes && changes.some((item) => item.delta > 0)) types.push('identity');
      if (!types.length) types.push('lost');
      return this.pickRoastByTypes(types);
    },

    pickEventRoast(event, changes) {
      const negative = changes.some((item) => item.delta <= CFG.Game.majorNegativeThreshold || (item.attr === 'health' && item.delta < 0));
      if (event.id === 'overnightBackfire' || negative) return this.pickRoastByTypes(['healthLow', 'project']);
      if (event.id === 'midtermWarning') return this.pickRoastByTypes(['study', 'graduate', 'lost']);
      if (event.id === 'dormTalk') return this.pickRoastByTypes(['dorm', 'social']);
      if (event.id === 'startupPitch') return this.pickRoastByTypes(['project', 'identity']);
      return this.pickRoastByTypes(['balanced', 'identity', 'social']);
    },

    pickRoastByTypes(types) {
      const recent = this.state.recentRoastIds;
      let pool = CFG.Roasts.filter((item) => types.indexOf(item.type) >= 0 && recent.indexOf(item.id) < 0);
      if (!pool.length) pool = CFG.Roasts.filter((item) => types.indexOf(item.type) >= 0);
      if (!pool.length) pool = CFG.Roasts;
      return pool[Math.floor(Math.random() * pool.length)];
    },

    recordRoast(roast) {
      const item = roast || { id: 'default', text: CFG.Game.defaultRoast, type: 'default' };
      this.state.currentRoast = item.text;
      this.state.roasts.push({
        id: item.id,
        text: item.text,
        type: item.type,
        week: this.state.week,
        action: this.state.totalActionsTaken
      });
      this.state.recentRoastIds.push(item.id);
      while (this.state.recentRoastIds.length > CFG.Game.recentRoastWindow) this.state.recentRoastIds.shift();
    },

    getRepresentativeRoasts() {
      const texts = [];
      for (let index = this.state.roasts.length - 1; index >= 0; index -= 1) {
        const text = this.state.roasts[index].text;
        if (texts.indexOf(text) < 0) texts.unshift(text);
        if (texts.length >= CFG.Game.maxRepresentativeRoasts) break;
      }
      while (texts.length < CFG.Game.maxRepresentativeRoasts) texts.push(CFG.Game.defaultRoast);
      return texts.slice(0, CFG.Game.maxRepresentativeRoasts);
    },

    showFloatingChanges(changes, primaryAttr, habitColor) {
      if (changes === undefined || changes === null || changes.length === 0) return;
      if (changes.length > CFG.Game.maxFloatingTexts) {
        this.addFloatText(this.getStageOffset().width / 2, CFG.UI.attrFloatStartY, '多项属性变化', CFG.Colors.habit, CFG.UI.floatPrimarySize, CFG.UI.floatPrimaryRise);
        return;
      }
      changes.forEach((change) => {
        const attrIndex = ATTR_KEYS.indexOf(change.attr);
        const col = attrIndex % 2;
        const row = Math.floor(attrIndex / 2);
        const x = col ? CFG.UI.attrFloatSecondX : CFG.UI.attrFloatStartX;
        const y = CFG.UI.attrFloatStartY + row * CFG.UI.attrFloatRowGap;
        const isPrimary = change.attr === primaryAttr || Math.abs(change.delta) >= 8;
        const color = habitColor ? CFG.Colors.habit : (change.delta > 0 ? CFG.Colors.positive : CFG.Colors.negative);
        const size = isPrimary ? CFG.UI.floatPrimarySize : CFG.UI.floatSecondarySize;
        const rise = isPrimary ? CFG.UI.floatPrimaryRise : CFG.UI.floatSecondaryRise;
        this.addFloatText(x, y, `${CFG.Attributes[change.attr].label} ${formatSigned(change.delta)}`, color, size, rise);
      });
    },

    addFloatText(x, y, text, color, size, rise) {
      const el = document.createElement('div');
      el.className = 'float-text';
      el.textContent = text;
      const layout = this.getStageOffset();
      el.style.left = `${x + layout.offsetX}px`;
      el.style.top = `${y + layout.offsetY}px`;
      el.style.color = color;
      el.style.fontSize = `${size}px`;
      el.style.setProperty('--rise', `${rise}px`);
      el.style.setProperty('--float-ms', `${CFG.UI.floatMs}ms`);
      this.dom.overlay.appendChild(el);
      window.setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, CFG.UI.floatMs);
    },

    spawnParticles(type, x, y, extraColors) {
      const cfg = CFG.UI.particles[type];
      if (cfg === undefined) return;
      const layout = this.getStageOffset();
      const originX = x + layout.offsetX;
      const originY = y + layout.offsetY;
      const colors = extraColors && extraColors.length ? cfg.colors.concat(extraColors) : cfg.colors;
      for (let index = 0; index < cfg.count; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = cfg.radius * (0.25 + Math.random() * 0.75);
        this.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed / cfg.ms,
          vy: Math.sin(angle) * speed / cfg.ms,
          color: colors[Math.floor(Math.random() * colors.length)],
          born: performance.now(),
          life: cfg.ms,
          size: 2 + Math.random() * 4
        });
      }
    },

    startParticleLoop() {
      const step = (now) => {
        const ctx = this.dom.ctx;
        if (ctx !== null) {
          ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
          this.particles = this.particles.filter((p) => now - p.born < p.life);
          this.particles.forEach((p) => {
            const age = now - p.born;
            const alpha = 1 - age / p.life;
            p.x += p.vx * 16;
            p.y += p.vy * 16;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;
        }
        this.particleRaf = window.requestAnimationFrame(step);
      };
      this.particleRaf = window.requestAnimationFrame(step);
    },

    handleImpactFeedback(changes) {
      if (changes === undefined || changes === null || changes.length === 0) return;
      const major = changes.some((item) => item.delta <= CFG.Game.majorNegativeThreshold);
      const healthLow = this.state.attrs.health < CFG.Game.healthWarningThreshold;
      if (healthLow === true) {
        this.shake(CFG.UI.shakeHealthPower);
        this.redFlash();
      } else if (major === true) {
        this.shake(CFG.UI.shakeMajorPower);
      }
      const bigGain = changes.find((item) => item.delta >= 8);
      if (bigGain !== undefined) {
        const color = CFG.Attributes[bigGain.attr].color;
        this.spawnParticles('bigGain', CFG.UI.eventParticleX, CFG.UI.habitParticleY, [color]);
      }
    },

    shake(power) {
      this.dom.container.style.setProperty('--shake', `${power}px`);
      this.dom.container.classList.remove('shake');
      void this.dom.container.offsetWidth;
      this.dom.container.classList.add('shake');
      window.setTimeout(() => this.dom.container.classList.remove('shake'), CFG.UI.redFlashMs);
    },

    redFlash() {
      const el = document.createElement('div');
      el.className = 'red-flash';
      this.dom.overlay.appendChild(el);
      window.setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, CFG.UI.redFlashMs);
    },

    getStage(week) {
      return CFG.Game.stages.find((stage) => week >= stage.startWeek && week <= stage.endWeek) || CFG.Game.stages[0];
    },

    getActionsThisWeek() {
      return this.getStage(this.state.week).actionsPerWeek;
    },

    getWeakestAttribute() {
      return ATTR_KEYS.map((key) => ({ key, value: this.state.attrs[key] })).sort((a, b) => a.value - b.value)[0];
    },

    getShortfallText() {
      const item = CFG.Shortfalls.find((shortfall) => this.state.attrs[shortfall.attr] < shortfall.below);
      return item ? item.text : '';
    },

    hasHabit(id) {
      return this.state.habits.indexOf(id) >= 0;
    },

    wasHabitRecentlyUnlocked(id) {
      const latest = this.state.habitUnlockHistory.find((item) => item.id === id);
      return latest && this.state.totalActionsTaken - latest.atAction <= 1;
    },

    getCardCount(id) {
      return this.state.behaviorCounts[id] || 0;
    },

    countGroup(groupKey) {
      const group = CFG.CardGroups[groupKey];
      if (group === undefined) return 0;
      if (group.ids) return group.ids.reduce((sum, id) => sum + this.getCardCount(id), 0);
      if (group.tags) {
        return this.state.selectedHistory.filter((item) => item.tags.some((tag) => group.tags.indexOf(tag) >= 0)).length;
      }
      return 0;
    },

    countNightBehaviors() {
      return ['game', 'project', 'video', 'review'].reduce((sum, id) => sum + this.getCardCount(id), 0);
    },

    lastSelectionsInGroup(groupKey, count) {
      if (this.state.selectedHistory.length < count) return false;
      const recent = this.state.selectedHistory.slice(-count);
      return recent.every((item) => this.cardInGroup(CARD_BY_ID[item.cardId], groupKey));
    },

    cardInGroup(card, groupKey) {
      const group = CFG.CardGroups[groupKey];
      if (card === undefined || group === undefined) return false;
      if (group.ids !== undefined && group.ids.indexOf(card.id) >= 0) return true;
      if (group.tags !== undefined && card.tags.some((tag) => group.tags.indexOf(tag) >= 0)) return true;
      return false;
    },

    cardMatchesEnding(card, ending) {
      const scoring = ending.scoring || {};
      if ((scoring.cards || []).some((rule) => rule.id === card.id)) return true;
      return (scoring.groups || []).some((rule) => this.cardInGroup(card, rule.key));
    },

    hasEventHappened(id) {
      return this.state.eventHistory.some((item) => item.eventId === id);
    },

    getCardCenterX(index) {
      const rowWidth = CFG.UI.cardWidth * CFG.Game.visibleCardCount + CFG.UI.cardGap * (CFG.Game.visibleCardCount - 1);
      const baseLeft = (CFG.Screen.width - rowWidth) / 2;
      return baseLeft + index * (CFG.UI.cardWidth + CFG.UI.cardGap) + CFG.UI.cardWidth / 2;
    },

    getChipRotation(index) {
      const rotations = [-2, 1, -1, 2, 0];
      return rotations[index % rotations.length];
    },

    bindSceneButton(action, handler) {
      const el = this.dom.scene.querySelector(`[data-action="${action}"]`);
      Input.bindTap(el, handler);
    },

    bindOverlayButton(action, handler) {
      const el = this.dom.overlay.querySelector(`[data-action="${action}"]`);
      Input.bindTap(el, handler);
    },

    clearOverlay() {
      if (this.dom.overlay) this.dom.overlay.innerHTML = '';
    },

    clearTimers() {
      if (this.feedbackTimer !== 0) window.clearTimeout(this.feedbackTimer);
      if (this.toastTimer !== 0) window.clearTimeout(this.toastTimer);
      this.feedbackTimer = 0;
      this.toastTimer = 0;
    },

    showToast(text) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = text;
      this.dom.overlay.appendChild(toast);
      if (this.toastTimer !== 0) window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        if (toast.parentNode !== null) toast.parentNode.removeChild(toast);
      }, CFG.Game.roastHoldMs);
    },

    isMuted() {
      return Boolean(this.state && this.state.muted);
    },

    setMuted(muted) {
      this.state.muted = Boolean(muted);
      try {
        localStorage.setItem(CFG.Storage.mutedKey, this.state.muted ? '1' : '0');
      } catch (err) {}
      Loader.syncMuted();
      if (this.state.muted) Loader.stopMusic();
      else Loader.startMusic();
    },

    loadMuted() {
      try {
        return localStorage.getItem(CFG.Storage.mutedKey) === '1';
      } catch (err) {
        return false;
      }
    },

    loadStoryBook() {
      try {
        const raw = localStorage.getItem(CFG.Storage.storyBookKey);
        if (!raw) return createEmptyStoryBook();
        return normalizeStoryBook(JSON.parse(raw));
      } catch (err) {
        return createEmptyStoryBook();
      }
    },

    saveStoryBook(book) {
      try {
        localStorage.setItem(CFG.Storage.storyBookKey, JSON.stringify(normalizeStoryBook(book)));
      } catch (err) {}
    },

    isStoryUnlocked(id) {
      this.state.storyBook = normalizeStoryBook(this.state.storyBook);
      return Boolean(this.state.storyBook.unlockedStories[id]);
    },

    isCharacterUnlocked(id) {
      this.state.storyBook = normalizeStoryBook(this.state.storyBook);
      return Boolean(this.state.storyBook.unlockedCharacters[id]);
    },

    isEggUnlocked(id) {
      this.state.storyBook = normalizeStoryBook(this.state.storyBook);
      return Boolean(this.state.storyBook.unlockedEggs[id]);
    },

    getStoryProgress(book) {
      const data = normalizeStoryBook(book || this.loadStoryBook());
      const characters = CFG.StoryCharacters.filter((item) => data.unlockedCharacters[item.id]).length;
      const stories = CFG.StoryEntries.filter((item) => item.kind !== 'egg' && data.unlockedStories[item.id]).length;
      const eggs = CFG.StoryCollectibles.filter((item) => data.unlockedEggs[item.id]).length;
      return { characters, stories, eggs };
    },

    renderStoryProgressText() {
      const progress = this.getStoryProgress(this.state.storyBook);
      return `人物 ${progress.characters}/${CFG.Story.totalCharacters} · 剧情 ${progress.stories}/${CFG.Story.totalStories} · 彩蛋 ${progress.eggs}/${CFG.Story.totalEggs}`;
    },

    getStoryNewCountThisRun() {
      return this.state.storyNewThisRun.reduce((sum, item) => sum + item.count, 0);
    },

    loadDex() {
      try {
        const raw = localStorage.getItem(CFG.Storage.dexKey);
        if (!raw) return { items: {} };
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.items) return { items: {} };
        return parsed;
      } catch (err) {
        return { items: {} };
      }
    },

    saveDex(dex) {
      try {
        localStorage.setItem(CFG.Storage.dexKey, JSON.stringify(dex));
      } catch (err) {}
    },

    updateDex(ending, star, representativeRoast) {
      const dex = this.loadDex();
      if (!dex.items[ending.id]) {
        dex.items[ending.id] = {
          id: ending.id,
          name: ending.name,
          rarity: ending.rarity,
          firstUnlockedAt: new Date().toISOString(),
          highestStars: star.stars,
          roast: representativeRoast || CFG.Game.defaultRoast
        };
      } else {
        dex.items[ending.id].highestStars = Math.max(dex.items[ending.id].highestStars || 0, star.stars);
        if (representativeRoast) dex.items[ending.id].roast = representativeRoast;
      }
      this.saveDex(dex);
      return dex;
    },

    getDexProgress(dex) {
      const data = dex || this.loadDex();
      const count = CFG.Endings.filter((ending) => data.items && data.items[ending.id]).length;
      return { count, total: CFG.Game.dexTotal };
    },

    saveGame() {
      const data = clone(this.state);
      data.currentCardIds = this.state.currentCards.map((card) => card.id);
      delete data.currentCards;
      data.currentStory = null;
      data.resumeNextAfterStory = null;
      data.pendingStoryResume = null;
      data.storyCandidate = null;
      data.screen = 'play';
      try {
        localStorage.setItem(CFG.Storage.saveKey, JSON.stringify(data));
        this.showToast('已保存当前学期进度。');
      } catch (err) {
        this.showToast('存档空间有点挤，保存失败。');
      }
    },

    getSavedGame() {
      try {
        const raw = localStorage.getItem(CFG.Storage.saveKey);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        if (parsed === null || parsed.attrs === undefined || parsed.week < 1 || parsed.week > CFG.Game.totalWeeks) return null;
        return parsed;
      } catch (err) {
        return null;
      }
    },

    loadSavedGame() {
      const saved = this.getSavedGame();
      if (saved === null) return false;
      const dex = this.loadDex();
      const muted = this.loadMuted();
      const storyBook = this.loadStoryBook();
      const restored = Object.assign(this.createInitialState(), saved);
      restored.dex = dex;
      restored.storyBook = storyBook;
      restored.muted = muted;
      restored.currentCards = (saved.currentCardIds || []).map((id) => CARD_BY_ID[id]).filter(Boolean);
      if (restored.currentCards.length === 0 && restored.pendingNext === null && restored.cardLocked === false) restored.currentCards = this.generateCardsForState(restored);
      this.state = restored;
      Loader.syncMuted();
      return true;
    },

    generateCardsForState(tempState) {
      const old = this.state;
      this.state = tempState;
      const cards = this.generateCards();
      this.state = old;
      return cards;
    },

    removeSavedGame() {
      try {
        localStorage.removeItem(CFG.Storage.saveKey);
      } catch (err) {}
    }
  };

  function createEmptyStoryBook() {
    return {
      unlockedStories: {},
      unlockedCharacters: {},
      unlockedEggs: {}
    };
  }

  function normalizeStoryBook(book) {
    const empty = createEmptyStoryBook();
    if (!book || typeof book !== 'object') return empty;
    return {
      unlockedStories: book.unlockedStories || {},
      unlockedCharacters: book.unlockedCharacters || {},
      unlockedEggs: book.unlockedEggs || {}
    };
  }

  function indexBy(list, key) {
    return list.reduce((map, item) => {
      map[item[key]] = item;
      return map;
    }, {});
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function addEffect(effects, key, value) {
    effects[key] = (effects[key] || 0) + value;
  }

  function mergeEffects(target, source) {
    Object.keys(source).forEach((key) => addEffect(target, key, source[key]));
  }

  function unique(list) {
    return list.filter((item, index) => list.indexOf(item) === index);
  }

  function weightedPick(list, weightGetter) {
    const weights = list.map((item) => Math.max(0, weightGetter(item)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total === 0) return list[Math.floor(Math.random() * list.length)];
    let roll = Math.random() * total;
    for (let index = 0; index < list.length; index += 1) {
      roll -= weights[index];
      if (roll <= 0) return list[index];
    }
    return list[list.length - 1];
  }

  function formatSigned(value) {
    return value > 0 ? `+${value}` : `${value}`;
  }

  function drawRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  function hashText(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  }

  function renderStars(count) {
    let text = '';
    for (let index = 0; index < count; index += 1) text += '★';
    return text;
  }

  window.Loader = Loader;
  window.Game = Game;
}());
