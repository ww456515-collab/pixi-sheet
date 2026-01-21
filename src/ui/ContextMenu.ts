
export interface MenuItem {
  label: string;
  action: () => void;
}

export class ContextMenu {
  private element: HTMLElement;
  private isVisible = false;

  constructor() {
    this.element = document.createElement('div');
    this.setupStyles();
    document.body.appendChild(this.element);
    
    // Global click listener to close menu
    document.addEventListener('click', () => {
      if (this.isVisible) {
        this.hide();
      }
    });

    // Prevent context menu on the custom menu itself
    this.element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private setupStyles() {
    this.element.style.position = 'fixed';
    this.element.style.background = 'white';
    this.element.style.border = '1px solid #ccc';
    this.element.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    this.element.style.zIndex = '1000';
    this.element.style.display = 'none';
    this.element.style.borderRadius = '4px';
    this.element.style.padding = '4px 0';
    this.element.style.minWidth = '150px';
    this.element.style.fontFamily = 'Arial, sans-serif';
    this.element.style.fontSize = '14px';
  }

  show(x: number, y: number, items: MenuItem[]) {
    this.element.innerHTML = '';
    
    items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.textContent = item.label;
      itemEl.style.padding = '8px 16px';
      itemEl.style.cursor = 'pointer';
      itemEl.style.color = '#333';
      
      itemEl.addEventListener('mouseenter', () => {
        itemEl.style.background = '#f0f0f0';
      });
      
      itemEl.addEventListener('mouseleave', () => {
        itemEl.style.background = 'transparent';
      });
      
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from firing immediately
        this.hide();
        item.action();
      });
      
      this.element.appendChild(itemEl);
    });

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.display = 'block';
    this.isVisible = true;
  }

  hide() {
    this.element.style.display = 'none';
    this.isVisible = false;
  }
}
