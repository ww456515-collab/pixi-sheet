import { ISpreadsheetController } from './interfaces';
import { DataModel } from './DataModel';
import { CONFIG } from './Config';
import { LayoutState } from './LayoutState';

export class Editor {
  private controller: ISpreadsheetController;
  private dataModel: DataModel;
  private layout: LayoutState;
  private input: HTMLInputElement;
  private activeCell: { col: number, row: number } | null = null;
  private isEditing = false;

  constructor(controller: ISpreadsheetController, dataModel: DataModel, layout: LayoutState) {
    this.controller = controller;
    this.dataModel = dataModel;
    this.layout = layout;
    
    // Create hidden input
    this.input = document.createElement('input');
    this.input.style.position = 'absolute';
    this.input.style.display = 'none';
    this.input.style.zIndex = '1000';
    this.input.style.border = '2px solid #4285f4';
    this.input.style.outline = 'none';
    this.input.style.padding = '0 4px';
    this.input.style.boxSizing = 'border-box';
    this.input.style.fontFamily = CONFIG.FONT_FAMILY;
    this.input.style.fontSize = `${CONFIG.FONT_SIZE}px`;
    
    // Bind input events
    this.input.addEventListener('blur', () => this.finishEditing());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishEditing();
      } else if (e.key === 'Escape') {
        this.cancelEditing();
      }
    });

    document.body.appendChild(this.input);
  }

  startEditing(col: number, row: number) {
    console.log(`Start Editing: col=${col}, row=${row}`);
    if (this.isEditing) this.finishEditing();

    this.isEditing = true;
    this.activeCell = { col, row };

    // Get current value
    const cellData = this.dataModel.getValue(col, row);
    this.input.value = cellData ? cellData.value : '';

    this.updatePosition();
    
    this.input.style.display = 'block';
    this.input.focus();
  }

  updatePosition() {
    if (!this.isEditing || !this.activeCell) return;

    const { col, row } = this.activeCell;
    const { scrollX, scrollY } = this.controller.getScrollPosition();
    
    // We need the canvas position relative to the viewport to position the DOM element correctly
    const canvasRect = this.controller.getCanvas().getBoundingClientRect();
    
    const colWidth = this.layout.getColWidth(col);
    const rowHeight = this.layout.getRowHeight(row);
    const startX = this.layout.getColX(col);
    const startY = this.layout.getRowY(row);

    // Grid coordinates
    const gridX = startX - scrollX;
    const gridY = startY - scrollY;

    // Header offset
    const headerWidth = this.controller.getHeaderWidth();
    const headerHeight = this.controller.getHeaderHeight();

    // Final screen coordinates
    const left = canvasRect.left + headerWidth + gridX;
    const top = canvasRect.top + headerHeight + gridY;

    this.input.style.left = `${left}px`;
    this.input.style.top = `${top}px`;
    this.input.style.width = `${colWidth}px`;
    this.input.style.height = `${rowHeight}px`;
  }

  private finishEditing() {
    if (!this.isEditing || !this.activeCell) return;

    const value = this.input.value;
    const { col, row } = this.activeCell;

    // Update DataModel
    this.dataModel.setValue(col, row, value);

    // Reset state
    this.isEditing = false;
    this.activeCell = null;
    this.input.style.display = 'none';

    // Notify spreadsheet to re-render
    this.controller.requestRender();
    this.controller.emit('cell-edited', { col, row, value });
  }


  private cancelEditing() {
    this.isEditing = false;
    this.activeCell = null;
    this.input.style.display = 'none';
  }
}
