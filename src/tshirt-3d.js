import { LitElement, html, css } from 'lit';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Tshirt3D extends LitElement {
  static properties = {
    clothingType: { type: String },
    imageSrc: { type: String },
    printText: { type: String }, // new property for text to print
  };

  static styles = css`
    :host {
      display: block;
      width: 400px;
      height: 500px;
      position: relative;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 8px;
      overflow: hidden;
    }
    .menu {
      display: flex;
      justify-content: space-around;
      margin: 10px 0;
    }
    .menu button {
      background: none;
      border: 1px solid #ccc;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .menu button.active {
      border-color: #007bff;
      color: #007bff;
      font-weight: bold;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      margin-top: 10px;
      cursor: pointer;
      color: #666;
    }
    .upload-area.dragover {
      border-color: #007bff;
      color: #007bff;
    }
    canvas {
      width: 100%;
      height: 400px;
      display: block;
      background: white;
    }
  `;

  constructor() {
    super();
    this.clothingType = 'tshirt';
    this.imageSrc = '';
    this.printText = ''; // initialize printText
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.texture = null;
    this.textTexture = null; // new texture for text
    this.animationFrameId = null;

    // create offscreen canvas for text texture
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.width = 512;
    this.textCanvas.height = 512;
    this.textCtx = this.textCanvas.getContext('2d');
  }

  render() {
    return html`
      <div class="menu">
        <button
          class=${this.clothingType === 'tshirt' ? 'active' : ''}
          @click=${() => this._changeClothing('tshirt')}
        >
          T-shirt
        </button>
        <button
          class=${this.clothingType === 'hoodie' ? 'active' : ''}
          @click=${() => this._changeClothing('hoodie')}
        >
          Hoodie
        </button>
        <button
          class=${this.clothingType === 'sleevie' ? 'active' : ''}
          @click=${() => this._changeClothing('sleevie')}
        >
          Sleevie
        </button>
        <button
          class=${this.clothingType === 'cap' ? 'active' : ''}
          @click=${() => this._changeClothing('cap')}
        >
          Cap
        </button>
      </div>

      <div
        class="upload-area"
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
        @click=${this._onClickUpload}
      >
        Drag & Drop or Click to Upload Image
        <input
          type="file"
          accept="image/*"
          style="display:none"
          @change=${this._onFileChange}
          id="fileInput"
        />
      </div>

      <canvas id="tshirtCanvas"></canvas>
    `;
  }

  firstUpdated() {
    this._initThree();
    this._loadModel(this.clothingType);
  }

  _initThree() {
    const canvas = this.shadowRoot.getElementById('tshirtCanvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0xffffff, 0);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this._animate();
  }

  _animate() {
    this.animationFrameId = requestAnimationFrame(() => this._animate());
    if (this.model) {
      this.model.rotation.y += 0.01;
    }
    this.renderer.render(this.scene, this.camera);
  }

  _loadModel(type) {
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.model = null;
    }

    const loader = new GLTFLoader();
    let modelPath = '';
    switch (type) {
      case 'tshirt':
        modelPath = 'assets/models/tshirt.glb';
        break;
      case 'hoodie':
        modelPath = 'assets/models/hoodie.glb';
        break;
      case 'sleevie':
        modelPath = 'assets/models/sleevie.glb';
        break;
      case 'cap':
        modelPath = 'assets/models/cap.glb';
        break;
      default:
        modelPath = 'assets/models/tshirt.glb';
    }

    loader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);
        this._applyTexture();
        this._applyTextTexture(); // apply text texture after model load
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  _applyTexture() {
    if (!this.model) return;
    if (!this.imageSrc) return;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.imageSrc, (texture) => {
      this.texture = texture;
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.material.map = this.texture;
          child.material.needsUpdate = true;
        }
      });
    });
  }

  _applyTextTexture() {
    if (!this.model) return;
    if (!this.printText) return;

    // Clear canvas
    this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);

    // Background transparent
    this.textCtx.fillStyle = 'rgba(0,0,0,0)';
    this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);

    // Text style
    this.textCtx.fillStyle = 'black';
    this.textCtx.font = 'bold 48px Arial';
    this.textCtx.textAlign = 'center';
    this.textCtx.textBaseline = 'middle';

    // Split text into lines (max 3 lines)
    const lines = this.printText.split('\n').slice(0, 3);
    const lineHeight = 60;
    const startY = this.textCanvas.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
      this.textCtx.fillText(line, this.textCanvas.width / 2, startY + index * lineHeight);
    });

    // Create texture from canvas
    if (this.textTexture) {
      this.textTexture.dispose();
    }
    this.textTexture = new THREE.CanvasTexture(this.textCanvas);

    // Apply text texture to model material
    this.model.traverse((child) => {
      if (child.isMesh) {
        // Combine image texture and text texture if imageSrc exists
        if (this.texture) {
          // Create a new canvas to combine image and text textures
          const combinedCanvas = document.createElement('canvas');
          combinedCanvas.width = this.textCanvas.width;
          combinedCanvas.height = this.textCanvas.height;
          const ctx = combinedCanvas.getContext('2d');

          // Draw image texture
          const image = new Image();
          image.src = this.imageSrc;
          image.onload = () => {
            ctx.drawImage(image, 0, 0, combinedCanvas.width, combinedCanvas.height);
            // Draw text on top
            ctx.drawImage(this.textCanvas, 0, 0);

            // Create combined texture
            const combinedTexture = new THREE.CanvasTexture(combinedCanvas);
            child.material.map = combinedTexture;
            child.material.needsUpdate = true;
          };
        } else {
          // No image texture, just use text texture
          child.material.map = this.textTexture;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  _changeClothing(type) {
    this.clothingType = type;
    this._loadModel(type);
  }

  _onDragOver(e) {
    e.preventDefault();
    this.shadowRoot.querySelector('.upload-area').classList.add('dragover');
  }

  _onDragLeave(e) {
    e.preventDefault();
    this.shadowRoot.querySelector('.upload-area').classList.remove('dragover');
  }

  _onDrop(e) {
    e.preventDefault();
    this.shadowRoot.querySelector('.upload-area').classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this._loadImage(files[0]);
    }
  }

  _onClickUpload() {
    this.shadowRoot.getElementById('fileInput').click();
  }

  _onFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      this._loadImage(file);
    }
  }

  _loadImage(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.imageSrc = event.target.result;
      this._applyTexture();
      this._applyTextTexture(); // reapply text texture after image change
      this.dispatchEvent(new CustomEvent('image-changed', { detail: { src: this.imageSrc } }));
    };
    reader.readAsDataURL(file);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('printText')) {
      this._applyTextTexture();
    }
  }

  // Public method to update printText from outside
  setPrintText(text) {
    this.printText = text;
  }
}

customElements.define('tshirt-3d', Tshirt3D);
