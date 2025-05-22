import { LitElement, html, css } from 'lit';
import './repeating-image-transition.js';
import './tshirt-3d.js';

class AppRoot extends LitElement {
  static properties = {
    route: { type: String },
  };

  constructor() {
    super();
    this.route = 'home';
    window.addEventListener('popstate', () => {
      this.route = window.location.pathname === '/product' ? 'product' : 'home';
    });
  }

  navigate(route) {
    if (this.route !== route) {
      this.route = route;
      window.history.pushState({}, '', route === 'home' ? '/' : '/product');
    }
  }

  render() {
    return html`
      <nav>
        <button @click=${() => this.navigate('home')}>Home</button>
        <button @click=${() => this.navigate('product')}>Product</button>
      </nav>
      <main>
        ${this.route === 'home'
          ? html`<repeating-image-transition></repeating-image-transition>`
          : html`<repeating-image-transition .isProductPage=${true}></repeating-image-transition>`}
      </main>
    `;
  }
}

customElements.define('app-root', AppRoot);
