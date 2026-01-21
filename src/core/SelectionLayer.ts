import { Container, Graphics } from 'pixi.js';
import { LayoutState } from './LayoutState';

export interface SelectionRange {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export class SelectionLayer extends Container {
  private graphics: Graphics;
  private layout: LayoutState;

  constructor(layout: LayoutState) {
    super();
    this.layout = layout;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    // Ensure selection is always above grid but below headers
    this.zIndex = 10; 
  }

  draw(range: SelectionRange | null, scrollX: number, scrollY: number) {
    this.graphics.clear();
    
    if (!range) return;

    // Calculate bounding box
    const minCol = Math.min(range.startCol, range.endCol);
    const maxCol = Math.max(range.startCol, range.endCol);
    const minRow = Math.min(range.startRow, range.endRow);
    const maxRow = Math.max(range.startRow, range.endRow);

    const startX = this.layout.getColX(minCol);
    const startY = this.layout.getRowY(minRow);
    
    const endX = this.layout.getColX(maxCol) + this.layout.getColWidth(maxCol);
    const endY = this.layout.getRowY(maxRow) + this.layout.getRowHeight(maxRow);

    const x = startX - scrollX;
    const y = startY - scrollY;
    const width = endX - startX;
    const height = endY - startY;

    // Draw Selection Box
    this.graphics.rect(x, y, width, height);
    this.graphics.fill({ color: 0x4285f4, alpha: 0.1 }); // Light blue fill
    this.graphics.stroke({ width: 2, color: 0x4285f4 }); // Blue border
    
    // Draw "Handle" (bottom-right corner)
    // this.graphics.beginFill(0xffffff);
    // this.graphics.lineStyle(1, 0x4285f4);
    // this.graphics.drawRect(x + width - 6, y + height - 6, 6, 6);
    // this.graphics.endFill();
  }
}
