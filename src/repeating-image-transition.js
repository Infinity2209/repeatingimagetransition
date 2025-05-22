import { LitElement, html, css } from 'lit';
import { gsap } from 'gsap';
import { preloadImages } from '../js/utils.js';

class GridItem extends LitElement {
  static properties = {
    imgUrl: { type: String },
    title: { type: String },
    description: { type: String },
    config: { type: Object },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      cursor: pointer;
      will-change: transform, clip-path;
      overflow: hidden;
    }
    .grid__item-image {
      width: 100%;
      aspect-ratio: 4 / 5;
      background-size: 100%;
      background-position: 50% 50%;
      transition: opacity 0.15s cubic-bezier(0.2, 0, 0.2, 1);
    }
    :host(:hover) .grid__item-image {
      opacity: 0.7;
    }
    figcaption h3 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
      text-align: right;
    }
    figcaption p {
      display: none;
    }
  `;

  constructor() {
    super();
    this.imgUrl = '';
    this.title = '';
    this.description = '';
    this.config = {};
  }

  render() {
    return html`
      <figure
        class="grid__item"
        role="img"
        aria-labelledby="caption-${this.title}"
        @click=${this._onClick}
        data-steps=${this.config.steps || ''}
        data-rotation-range=${this.config.rotationRange || ''}
        data-step-interval=${this.config.stepInterval || ''}
        data-mover-pause-before-exit=${this.config.moverPauseBeforeExit || ''}
        data-mover-enter-ease=${this.config.moverEnterEase || ''}
        data-mover-exit-ease=${this.config.moverExitEase || ''}
        data-panel-reveal-ease=${this.config.panelRevealEase || ''}
      >
        <div
          class="grid__item-image"
          style="background-image: url(${this.imgUrl})"
        ></div>
        <figcaption class="grid__item-caption" id="caption-${this.title}">
          <h3>${this.title}</h3>
          <p>${this.description}</p>
        </figcaption>
      </figure>
    `;
  }

  _onClick() {
    this.dispatchEvent(
      new CustomEvent('grid-item-click', {
        detail: { imgUrl: this.imgUrl, title: this.title, description: this.description, config: this.config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('grid-item', GridItem);

class PreviewPanel extends LitElement {
  static properties = {
    imgUrl: { type: String },
    title: { type: String },
    description: { type: String },
    open: { type: Boolean },
    panelRight: { type: Boolean },
  };

  static styles = css`
    :host {
      position: fixed;
      margin: 0;
      width: 100%;
      height: 100vh;
      padding: 1.5rem;
      top: 0;
      left: 0;
      display: grid;
      gap: 1rem;
      opacity: 0;
      pointer-events: none;
      z-index: 2000;
      will-change: transform, clip-path;
      justify-content: center;
      grid-template-rows: 1fr min-content;
      grid-template-columns: 100%;
      grid-template-areas: 'panel-image' 'panel-content';
      transition: opacity 0.3s ease;
    }
    :host([open]) {
      opacity: 1;
      pointer-events: auto;
    }
    :host([panelRight]) {
      grid-template-columns: var(--panel-img-size) 1fr;
      grid-template-areas: 'panel-content panel-image';
    }
    .panel__img {
      grid-area: panel-image;
      background-size: cover;
      background-position: center;
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
    }
    :host([panelRight]) .panel__img {
      height: 100%;
      width: auto;
      max-width: 100%;
    }
    .panel__content {
      grid-area: panel-content;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: end;
      align-items: end;
      text-align: right;
    }
    :host([panelRight]) .panel__content {
      align-items: start;
      text-align: left;
    }
    .panel__content h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }
    .panel__content p {
      margin: 0;
      max-width: 150px;
      text-wrap: pretty;
    }
    .panel__close {
      background: none;
      border: 0;
      padding: 0;
      margin: 0;
      font: inherit;
      cursor: pointer;
      color: var(--color-close);
    }
    .panel__close:hover,
    .panel__close:focus {
      outline: none;
      color: var(--color-link-hover);
    }
  `;

  constructor() {
    super();
    this.imgUrl = '';
    this.title = '';
    this.description = '';
    this.open = false;
    this.panelRight = false;
  }

  render() {
    return html`
      <figure
        class="panel"
        role="img"
        aria-labelledby="caption"
        ?open=${this.open}
        ?panelRight=${this.panelRight}
      >
        <div
          class="panel__img"
          style="background-image: url(${this.imgUrl})"
        ></div>
        <figcaption class="panel__content" id="caption">
          <h3>${this.title}</h3>
          <p>${this.description}</p>
          <button
            type="button"
            class="panel__close"
            aria-label="Close preview"
            @click=${this._onClose}
          >
            Close
          </button>
        </figcaption>
      </figure>
    `;
  }

  _onClose() {
    this.dispatchEvent(new CustomEvent('panel-close', { bubbles: true, composed: true }));
  }
}

customElements.define('preview-panel', PreviewPanel);

export class RepeatingImageTransition extends LitElement {
  static styles = css`
    /* Import the base.css styles globally or include here */
    @import url('../css/base.css');
  `;

  static properties = {
    items: { type: Array },
    selectedItem: { type: Object },
    isAnimating: { type: Boolean },
    isPanelOpen: { type: Boolean },
    panelRight: { type: Boolean },

    // New properties for Height, Weight, Build
    height: { type: Number },
    weight: { type: Number },
    build: { type: String },

    // New property to toggle between home and product page
    isProductPage: { type: Boolean },
  };

  constructor() {
    super();
    this.items = [];
    this.selectedItem = null;
    this.isAnimating = false;
    this.isPanelOpen = false;
    this.panelRight = false;

    // Initialize new properties with defaults
    this.height = 180;
    this.weight = 80;
    this.build = 'athletic';

    // New properties for 3D tshirt and text
    this.clothingType = 'tshirt';
    this.printText = '';
    this.currentLayout = 1;

    this.isProductPage = false;

    // Bind keyboard handler
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    preloadImages('.grid__item-image, .panel__img').then(() => {
      this.isAnimating = false;
      this.isPanelOpen = false;
      this._init();
    });
    window.addEventListener('keydown', this._onKeyDown);
  }

  render() {
    if (!this.isProductPage) {
      // Render home page UI (grid with images and animation)
      return html`
        <div class="grid">
          ${this.items.map(
            (item) => html`
              <grid-item
                .imgUrl=${item.imgUrl}
                .title=${item.title}
                .description=${item.description}
                .config=${item.config}
              ></grid-item>
            `
          )}
        </div>
      `;
    }

    // Render product page UI
    return html`
      <main class="product-container version${this.currentLayout}">
        <header class="frame">
          <h1 class="frame__title">Product Page - Repeating Image Transition</h1>
          <nav class="frame__links">
            <a class="line" href="https://tympanus.net/codrops/?p=92571">More info,</a>
            <a class="line" href="https://github.com/codrops/RepeatingImageTransition/">Code,</a>
            <a class="line" href="https://tympanus.net/codrops/demos/">All demos</a>
          </nav>
          <nav class="frame__tags">
            <a class="line" href="https://tympanus.net/codrops/demos/?tag=page-transition">page-transition,</a>
            <a class="line" href="https://tympanus.net/codrops/demos/?tag=repetition">repetition,</a>
            <a class="line" href="https://tympanus.net/codrops/demos/?tag=grid">grid</a>
          </nav>
        </header>

        <div>
          <img
            src=${this.selectedItem?.imgUrl || 'assets/img1.webp'}
            alt="Large print image"
            class="large-print-image"
          />

          <section class="product-controls">
            <label>
              Height (cm):
              <input
                type="number"
                .value=${this.height}
                @input=${(e) => (this.height = e.target.valueAsNumber)}
                min="50"
                max="250"
              />
            </label>
            <label>
              Weight (kg):
              <input
                type="number"
                .value=${this.weight}
                @input=${(e) => (this.weight = e.target.valueAsNumber)}
                min="20"
                max="200"
              />
            </label>
            <label>
              Build:
              <select
                .value=${this.build}
                @change=${(e) => (this.build = e.target.value)}
              >
                <option value="lean">Lean</option>
                <option value="reg">Reg</option>
                <option value="athletic">Athletic</option>
                <option value="big">Big</option>
              </select>
            </label>
          </section>

          <tshirt-3d
            id="tshirt3d"
            .clothingType=${this.clothingType}
            .imageSrc=${this.selectedItem?.imgUrl || ''}
            .printText=${this.printText}
            @image-changed=${this._onImageChanged}
            @clothing-changed=${this._onClothingChanged}
          ></tshirt-3d>

          <textarea
            id="tshirtText"
            placeholder="Enter text for the T-shirt here (max 3 lines)..."
            maxlength="100"
            @input=${this._onTextInput}
            .value=${this.printText}
          ></textarea>
        </div>

        <div class="grid">
          ${this.items.map(
            (item) => html`
              <grid-item
                .imgUrl=${item.imgUrl}
                .title=${item.title}
                .description=${item.description}
                .config=${item.config}
              ></grid-item>
            `
          )}
        </div>

        <footer class="frame frame--footer">
          <span>
            Made by
            <a href="https://codrops.com/" class="line">@codrops</a>
          </span>
          <span><a href="https://tympanus.net/codrops/demos/" class="line">All demos</a></span>
        </footer>
      </main>
    `;
  }

  _init() {
    this.items = this._getItemsData();
    this.addEventListener('grid-item-click', this._onGridItemClick.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeyDown);
  }

  _getItemsData() {
    // Hardcoded data extracted from index.html for all grid items
    // For brevity, only a few items are included here; full implementation will include all items
    return [
      {
        imgUrl: 'assets/img1.webp',
        title: 'Drift — A04',
        description: 'Model: Amelia Hart',
        config: {},
      },
      {
        imgUrl: 'assets/img2.webp',
        title: 'Veil — K18',
        description: 'Model: Irina Volkova',
        config: {},
      },
      {
        imgUrl: 'assets/img3.webp',
        title: 'Ember — M45',
        description: 'Model: Charlotte Byrne',
        config: {},
      },
      // ... add all other items similarly
    ];
  }

  _onGridItemClick(e) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    const { imgUrl, title, description, config } = e.detail;
    this.selectedItem = { imgUrl, title, description, config };
    this.printText = ''; // reset print text on new image selection

    // Determine panel side based on clicked item position
    const clickedItemEl = e.composedPath().find((el) => el.tagName === 'GRID-ITEM');
    if (clickedItemEl) {
      const rect = clickedItemEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      this.panelRight = centerX < window.innerWidth / 2;
    } else {
      this.panelRight = false;
    }

    // Implement GSAP animation logic adapted from js/index.js

    const grid = this.renderRoot.querySelector('.grid');
    const panel = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel');
    const panelImg = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel__img');
    const panelContent = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel__content');
    const frame = this.renderRoot.querySelectorAll('.frame, .heading');

    const configDefaults = {
      clipPathDirection: 'top-bottom',
      autoAdjustHorizontalClipPath: true,
      steps: 6,
      stepDuration: 0.35,
      stepInterval: 0.05,
      moverPauseBeforeExit: 0.14,
      rotationRange: 0,
      wobbleStrength: 0,
      panelRevealEase: 'sine.inOut',
      gridItemEase: 'sine',
      moverEnterEase: 'sine.in',
      moverExitEase: 'sine',
      panelRevealDurationFactor: 2,
      clickedItemDurationFactor: 2,
      gridItemStaggerFactor: 0.3,
      moverBlendMode: false,
      pathMotion: 'linear',
      sineAmplitude: 50,
      sineFrequency: Math.PI,
    };

    const mergedConfig = { ...configDefaults, ...config };

    // Helper functions
    const lerp = (a, b, t) => a + (b - a) * t;

    const getClipPathsForDirection = (direction) => {
      switch (direction) {
        case 'bottom-top':
          return {
            from: 'inset(0% 0% 100% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(100% 0% 0% 0%)',
          };
        case 'left-right':
          return {
            from: 'inset(0% 100% 0% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 0% 0% 100%)',
          };
        case 'right-left':
          return {
            from: 'inset(0% 0% 0% 100%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 100% 0% 0%)',
          };
        case 'top-bottom':
        default:
          return {
            from: 'inset(100% 0% 0% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 0% 100% 0%)',
          };
      }
    };

    const hideFrame = () => {
      gsap.to(frame, {
        opacity: 0,
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'none',
      });
    };

    const showFrame = () => {
      gsap.to(frame, {
        opacity: 1,
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'auto',
      });
    };

    const getElementCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const computeStaggerDelays = (clickedItem, items) => {
      const baseCenter = getElementCenter(clickedItem);
      const distances = Array.from(items).map((el) => {
        const center = getElementCenter(el);
        return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
      });
      const max = Math.max(...distances);
      return distances.map((d) => (d / max) * mergedConfig.gridItemStaggerFactor);
    };

    const animateGridItems = (items, clickedItem, delays) => {
      const clipPaths = getClipPathsForDirection(mergedConfig.clipPathDirection);

      gsap.to(items, {
        opacity: 0,
        scale: (i, el) => (el === clickedItem ? 1 : 0.8),
        duration: (i, el) =>
          el === clickedItem
            ? mergedConfig.stepDuration * mergedConfig.clickedItemDurationFactor
            : 0.3,
        ease: mergedConfig.gridItemEase,
        clipPath: (i, el) => (el === clickedItem ? clipPaths.from : 'none'),
        delay: (i) => delays[i],
      });
    };

    const generateMotionPath = (startRect, endRect, steps) => {
      const path = [];
      const fullSteps = steps + 2;
      const startCenter = {
        x: startRect.left + startRect.width / 2,
        y: startRect.top + startRect.height / 2,
      };
      const endCenter = {
        x: endRect.left + endRect.width / 2,
        y: endRect.top + endRect.height / 2,
      };

      for (let i = 0; i < fullSteps; i++) {
        const t = i / (fullSteps - 1);
        const width = lerp(startRect.width, endRect.width, t);
        const height = lerp(startRect.height, endRect.height, t);
        const centerX = lerp(startCenter.x, endCenter.x, t);
        const centerY = lerp(startCenter.y, endCenter.y, t);

        const sineOffset =
          mergedConfig.pathMotion === 'sine'
            ? Math.sin(t * mergedConfig.sineFrequency) * mergedConfig.sineAmplitude
            : 0;

        const wobbleX = (Math.random() - 0.5) * mergedConfig.wobbleStrength;
        const wobbleY = (Math.random() - 0.5) * mergedConfig.wobbleStrength;

        path.push({
          left: centerX - width / 2 + wobbleX,
          top: centerY - height / 2 + sineOffset + wobbleY,
          width,
          height,
        });
      }

      return path.slice(1, -1);
    };

    const createMoverStyle = (step, index, imgURL) => {
      const style = {
        backgroundImage: imgURL,
        position: 'fixed',
        left: step.left,
        top: step.top,
        width: step.width,
        height: step.height,
        clipPath: getClipPathsForDirection(mergedConfig.clipPathDirection).from,
        zIndex: 1000 + index,
        backgroundPosition: '50% 50%',
        rotationZ: gsap.utils.random(-mergedConfig.rotationRange, mergedConfig.rotationRange),
      };
      if (mergedConfig.moverBlendMode) style.mixBlendMode = mergedConfig.moverBlendMode;
      return style;
    };

    const scheduleCleanup = (movers) => {
      const cleanupDelay =
        mergedConfig.steps * mergedConfig.stepInterval +
        mergedConfig.stepDuration * 2 +
        mergedConfig.moverPauseBeforeExit;
      gsap.delayedCall(cleanupDelay, () => movers.forEach((m) => m.remove()));
    };

    const revealPanel = (endImg) => {
      const clipPaths = getClipPathsForDirection(mergedConfig.clipPathDirection);

      gsap.set(panelContent, { opacity: 0 });
      gsap.set(panel, { opacity: 1, pointerEvents: 'auto' });

      gsap
        .timeline({
          defaults: {
            duration: mergedConfig.stepDuration * mergedConfig.panelRevealDurationFactor,
            ease: mergedConfig.panelRevealEase,
          },
        })
        .fromTo(
          endImg,
          { clipPath: clipPaths.hide },
          {
            clipPath: clipPaths.reveal,
            pointerEvents: 'auto',
            delay: mergedConfig.steps * mergedConfig.stepInterval,
          }
        )
        .fromTo(
          panelContent,
          { y: 25 },
          {
            duration: 1,
            ease: 'expo',
            opacity: 1,
            y: 0,
            delay: mergedConfig.steps * mergedConfig.stepInterval,
            onComplete: () => {
              this.isAnimating = false;
              this.isPanelOpen = true;
            },
          },
          '<-=.2'
        );
    };

    const animateTransition = (startEl, endEl, imgURL) => {
      hideFrame();

      const path = generateMotionPath(
        startEl.getBoundingClientRect(),
        endEl.getBoundingClientRect(),
        mergedConfig.steps
      );
      const fragment = document.createDocumentFragment();
      const clipPaths = getClipPathsForDirection(mergedConfig.clipPathDirection);

      path.forEach((step, index) => {
        const mover = document.createElement('div');
        mover.className = 'mover';
        gsap.set(mover, createMoverStyle(step, index, imgURL));
        fragment.appendChild(mover);

        const delay = index * mergedConfig.stepInterval;
        gsap
          .timeline({ delay })
          .fromTo(
            mover,
            { opacity: 0.4, clipPath: clipPaths.hide },
            {
              opacity: 1,
              clipPath: clipPaths.reveal,
              duration: mergedConfig.stepDuration,
              ease: mergedConfig.moverEnterEase,
            }
          )
          .to(
            mover,
            {
              clipPath: clipPaths.from,
              duration: mergedConfig.stepDuration,
              ease: mergedConfig.moverExitEase,
            },
            `+=${mergedConfig.moverPauseBeforeExit}`
          );
      });

      grid.parentNode.insertBefore(fragment, grid.nextSibling);

      scheduleCleanup(document.querySelectorAll('.mover'));
      revealPanel(endEl);
    };

    const allItems = this.renderRoot.querySelectorAll('grid-item');
    const clickedItem = clickedItemEl;

    const delays = computeStaggerDelays(clickedItem, allItems);
    animateGridItems(allItems, clickedItem, delays);
    animateTransition(
      clickedItem.shadowRoot.querySelector('.grid__item-image'),
      panelImg,
      imgUrl
    );
  }

  _onPanelClose() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const grid = this.renderRoot.querySelector('.grid');
    const panel = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel');
    const panelImg = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel__img');
    const panelContent = this.renderRoot.querySelector('preview-panel').shadowRoot.querySelector('.panel__content');
    const frame = this.renderRoot.querySelectorAll('.frame, .heading');

    const configDefaults = {
      clipPathDirection: 'top-bottom',
      autoAdjustHorizontalClipPath: true,
      steps: 6,
      stepDuration: 0.35,
      stepInterval: 0.05,
      moverPauseBeforeExit: 0.14,
      rotationRange: 0,
      wobbleStrength: 0,
      panelRevealEase: 'sine.inOut',
      gridItemEase: 'sine',
      moverEnterEase: 'sine.in',
      moverExitEase: 'sine',
      panelRevealDurationFactor: 2,
      clickedItemDurationFactor: 2,
      gridItemStaggerFactor: 0.3,
      moverBlendMode: false,
      pathMotion: 'linear',
      sineAmplitude: 50,
      sineFrequency: Math.PI,
    };

    const mergedConfig = { ...configDefaults, ...(this.selectedItem?.config || {}) };

    const getClipPathsForDirection = (direction) => {
      switch (direction) {
        case 'bottom-top':
          return {
            from: 'inset(0% 0% 100% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(100% 0% 0% 0%)',
          };
        case 'left-right':
          return {
            from: 'inset(0% 100% 0% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 0% 0% 100%)',
          };
        case 'right-left':
          return {
            from: 'inset(0% 0% 0% 100%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 100% 0% 0%)',
          };
        case 'top-bottom':
        default:
          return {
            from: 'inset(100% 0% 0% 0%)',
            reveal: 'inset(0% 0% 0% 0%)',
            hide: 'inset(0% 0% 100% 0%)',
          };
      }
    };

    const showFrame = () => {
      gsap.to(frame, {
        opacity: 1,
        duration: 0.5,
        ease: 'sine.inOut',
        pointerEvents: 'auto',
      });
    };

    const resetView = () => {
      const allItems = this.renderRoot.querySelectorAll('grid-item');
      const clickedItem = this.renderRoot.querySelector('grid-item[aria-labelledby="caption-' + this.selectedItem.title + '"]');
      const delays = computeStaggerDelays(clickedItem, allItems);

      gsap
        .timeline({
          defaults: { duration: mergedConfig.stepDuration, ease: 'expo' },
          onComplete: () => {
            panel.classList.remove('panel--right');
            this.isAnimating = false;
            this.isPanelOpen = false;
            this.selectedItem = null;
          },
        })
        .to(panel, { opacity: 0 })
        .add(showFrame, 0)
        .set(panel, { opacity: 0, pointerEvents: 'none' })
        .set(panelImg, { clipPath: 'inset(0% 0% 100% 0%)' })
        .set(allItems, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
        .to(
          allItems,
          {
            opacity: 1,
            scale: 1,
            delay: (i) => delays[i],
          },
          '>'
        );
    };

    resetView();
  }

  _onTextInput(e) {
    const value = e.target.value;
    // Limit to max 3 lines
    const lines = value.split('\\n').slice(0, 3);
    this.printText = lines.join('\\n');
    const textarea = this.renderRoot.getElementById('printTextInput');
    if (textarea) {
      textarea.value = this.printText;
    }
  }

  _onImageChanged(e) {
    this.selectedItem = { ...this.selectedItem, imgUrl: e.detail.src };
  }

  _onClothingChanged(e) {
    this.clothingType = e.detail.type;
  }

  _onKeyDown(e) {
    if (e.altKey && e.key.toLowerCase() === 'q') {
      this.currentLayout = (this.currentLayout % 3) + 1;
    }
  }
}

customElements.define('repeating-image-transition', RepeatingImageTransition);
