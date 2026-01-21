import { Spreadsheet } from '../core/Spreadsheet';

export class Toolbar {
  private element: HTMLElement;
  private spreadsheet: Spreadsheet;
  private btnAlignLeft!: HTMLButtonElement;
  private btnAlignCenter!: HTMLButtonElement;
  private btnAlignRight!: HTMLButtonElement;

  constructor(spreadsheet: Spreadsheet) {
    this.spreadsheet = spreadsheet;
    this.element = document.createElement('div');
    this.setupStyles();
    this.render();
    this.bindEvents();
    
    // Listen for state changes
    this.spreadsheet.on('selection-change', () => this.updateUI());
    this.spreadsheet.on('style-change', () => this.updateUI());
  }

  private setupStyles() {
    this.element.style.height = '40px';
    this.element.style.background = '#f8f9fa';
    this.element.style.borderBottom = '1px solid #e0e0e0';
    this.element.style.display = 'flex';
    this.element.style.alignItems = 'center';
    this.element.style.padding = '0 16px';
    this.element.style.gap = '20px';
    this.element.style.fontSize = '14px';
    this.element.style.color = '#333';
    this.element.style.boxSizing = 'border-box';
    this.element.style.fontFamily = 'Inter, system-ui, sans-serif';
  }

  private render() {
    this.element.innerHTML = `
      <div style="font-weight: bold; margin-right: 20px;">PixiSheet</div>
      
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;">
        <input type="checkbox" id="ps-toggle-grid" checked>
        <span>网格线</span>
      </label>

      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;">
        <input type="checkbox" id="ps-toggle-headers" checked>
        <span>标题</span>
      </label>

      <button id="ps-btn-merge" style="
        padding: 4px 12px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <span>合并单元格</span>
      </button>

      <div style="width: 1px; height: 20px; background: #ddd; margin: 0 4px;"></div>

      <div style="display: flex; gap: 4px;">
        <button id="ps-btn-align-left" title="左对齐" style="padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: #fff;">
          L
        </button>
        <button id="ps-btn-align-center" title="居中" style="padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: #fff;">
          C
        </button>
        <button id="ps-btn-align-right" title="右对齐" style="padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: #fff;">
          R
        </button>
      </div>
    `;
  }

  private bindEvents() {
    const toggleGrid = this.element.querySelector('#ps-toggle-grid') as HTMLInputElement;
    const toggleHeaders = this.element.querySelector('#ps-toggle-headers') as HTMLInputElement;
    const btnMerge = this.element.querySelector('#ps-btn-merge') as HTMLButtonElement;
    
    this.btnAlignLeft = this.element.querySelector('#ps-btn-align-left') as HTMLButtonElement;
    this.btnAlignCenter = this.element.querySelector('#ps-btn-align-center') as HTMLButtonElement;
    this.btnAlignRight = this.element.querySelector('#ps-btn-align-right') as HTMLButtonElement;

    if (toggleGrid) {
      toggleGrid.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.spreadsheet.setShowGridLines(target.checked);
      });
    }

    if (toggleHeaders) {
      toggleHeaders.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.spreadsheet.setShowHeaders(target.checked);
      });
    }

    if (btnMerge) {
      btnMerge.addEventListener('click', () => {
        this.spreadsheet.mergeSelectedCells();
      });
    }

    if (this.btnAlignLeft) {
      this.btnAlignLeft.addEventListener('click', () => this.spreadsheet.setAlignment('left'));
    }
    if (this.btnAlignCenter) {
      this.btnAlignCenter.addEventListener('click', () => this.spreadsheet.setAlignment('center'));
    }
    if (this.btnAlignRight) {
      this.btnAlignRight.addEventListener('click', () => this.spreadsheet.setAlignment('right'));
    }
  }

  private updateUI() {
    const selection = this.spreadsheet.getSelection();
    
    // Reset buttons
    const defaultStyle = "padding: 4px 8px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: #fff;";
    const activeStyle = "padding: 4px 8px; cursor: pointer; border: 1px solid #d2e3fc; border-radius: 4px; background: #e8f0fe; color: #1a73e8;";

    this.btnAlignLeft.setAttribute('style', defaultStyle);
    this.btnAlignCenter.setAttribute('style', defaultStyle);
    this.btnAlignRight.setAttribute('style', defaultStyle);

    if (!selection) return;

    const cellData = this.spreadsheet.getCellData(selection.startCol, selection.startRow);
    const align = cellData?.style?.align || 'left';

    if (align === 'left') {
        this.btnAlignLeft.setAttribute('style', activeStyle);
    } else if (align === 'center') {
        this.btnAlignCenter.setAttribute('style', activeStyle);
    } else if (align === 'right') {
        this.btnAlignRight.setAttribute('style', activeStyle);
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }

  mount(container: HTMLElement) {
    container.appendChild(this.element);
  }
}
