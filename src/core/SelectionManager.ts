import { FederatedPointerEvent } from 'pixi.js';
import { ISpreadsheetController } from './interfaces';
import { SelectionLayer, SelectionRange } from './SelectionLayer';
import { LayoutState } from './LayoutState';
import { DataModel } from './DataModel';

export class SelectionManager {
  private controller: ISpreadsheetController;
  private layer: SelectionLayer;
  private layout: LayoutState;
  private dataModel: DataModel;
  
  private isSelecting = false;
  private startCell = { col: 0, row: 0 };
  private currentCell = { col: 0, row: 0 };
  
  // Publicly accessible current selection
  public selection: SelectionRange | null = null;

  constructor(controller: ISpreadsheetController, layout: LayoutState, dataModel: DataModel) {
    this.controller = controller;
    this.layout = layout;
    this.dataModel = dataModel;
    this.layer = new SelectionLayer(layout);
    // Add layer to spreadsheet container
    // We'll let spreadsheet handle adding it to the display list to control order
  }

  getLayer() {
    return this.layer;
  }

  // Convert screen coordinates to grid coordinates
  private getCellAt(x: number, y: number) {
    // Need to account for scroll position
    const { scrollX, scrollY } = this.controller.getScrollPosition();
    
    const col = this.layout.getColIndexAt(x + scrollX);
    const row = this.layout.getRowIndexAt(y + scrollY);
    
    return { 
      col: Math.max(0, col), 
      row: Math.max(0, row) 
    };
  }

  onPointerDown(e: FederatedPointerEvent) {
    // Only handle left click (button 0)
    if (e.button !== 0) return;

    this.isSelecting = true;
    
    const point = this.controller.getViewportPoint(e);
    
    const cell = this.getCellAt(point.x, point.y);
    console.log('Selection Start:', cell);
    
    this.startCell = cell;
    this.currentCell = cell;
    
    this.updateSelection();
  }

  onPointerMove(e: FederatedPointerEvent) {
    if (!this.isSelecting) return;

    // Use getViewportPoint consistent with onPointerDown
    const point = this.controller.getViewportPoint(e);
    const cell = this.getCellAt(point.x, point.y);
    
    if (cell.col !== this.currentCell.col || cell.row !== this.currentCell.row) {
      this.currentCell = cell;
      console.log('Selection Update:', this.currentCell);
      this.updateSelection();
      // Ensure we request a render when selection changes
      this.controller.requestRender();
    }
  }

  onPointerUp() {
    if (this.isSelecting) {
      this.isSelecting = false;
      this.controller.emit('selection-change', this.selection);
    }
  }

  private updateSelection() {
    let range: SelectionRange = {
      startCol: Math.min(this.startCell.col, this.currentCell.col),
      startRow: Math.min(this.startCell.row, this.currentCell.row),
      endCol: Math.max(this.startCell.col, this.currentCell.col),
      endRow: Math.max(this.startCell.row, this.currentCell.row)
    };
    
    // Expand selection to include merged cells
    range = this.expandSelectionToMerges(range);

    this.selection = range;
    
    this.controller.requestRender();
  }

  private expandSelectionToMerges(range: SelectionRange): SelectionRange {
    const merges = this.dataModel.getMerges();
    let changed = true;

    while (changed) {
        changed = false;
        for (const merge of merges) {
            // Check intersection
            // !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)
            const isIntersecting = !(
                merge.startCol > range.endCol ||
                merge.endCol < range.startCol ||
                merge.startRow > range.endRow ||
                merge.endRow < range.startRow
            );

            if (isIntersecting) {
                // Check if range needs expansion
                if (merge.startCol < range.startCol) {
                    range.startCol = merge.startCol;
                    changed = true;
                }
                if (merge.endCol > range.endCol) {
                    range.endCol = merge.endCol;
                    changed = true;
                }
                if (merge.startRow < range.startRow) {
                    range.startRow = merge.startRow;
                    changed = true;
                }
                if (merge.endRow > range.endRow) {
                    range.endRow = merge.endRow;
                    changed = true;
                }
            }
        }
    }
    return range;
  }



  selectRow(row: number) {
    this.selection = {
      startCol: 0,
      startRow: row,
      endCol: 10000,
      endRow: row
    };
    this.controller.requestRender();
    this.controller.emit('selection-change', this.selection);
  }

  selectColumn(col: number) {
    this.selection = {
      startCol: col,
      startRow: 0,
      endCol: col,
      endRow: 10000
    };
    this.controller.requestRender();
    this.controller.emit('selection-change', this.selection);
  }

  draw(scrollX: number, scrollY: number) {
    this.layer.draw(this.selection, scrollX, scrollY);
  }
}
