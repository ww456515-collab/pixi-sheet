import './style.css'
import { Spreadsheet } from './core/Spreadsheet';

const appElement = document.getElementById('app');
if (appElement) {
  // 启用内置 Toolbar
  const sheet = new Spreadsheet({
    view: {
      showToolbar: true
    }
  });
  
  // Example of Event System
  sheet.on('scroll', (pos) => {
    console.log(`Scrolled to: x=${pos.x.toFixed(0)}, y=${pos.y.toFixed(0)}`);
  });

  sheet.on('view-change', (state) => {
    console.log('View options changed:', state);
  });

  sheet.init(appElement);
}
