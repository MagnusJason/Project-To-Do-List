// Main Entry Point
import './styles.css';
import AppController from './modules/AppController';
import DOM from './modules/DOM';

// Initialize the application
const init = () => {
  AppController.init();
  AppController.onChange(() => DOM.render());
  DOM.render();
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

