/**
 * 网格层，负责绘制电子表格的网格线。
 * 继承自 PIXI.Container。
 */
import { Container, Graphics } from 'pixi.js';
import { CONFIG } from './Config';
import { LayoutState } from './LayoutState';

export class Grid extends Container {
  private graphics: Graphics;
  private layout: LayoutState;

  constructor(layout: LayoutState) {
    super();
    this.layout = layout;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this.draw();
  }

  /**
   * 绘制网格线。
   * @param offsetX 水平滚动偏移量
   * @param offsetY 垂直滚动偏移量
   * @param width 视口宽度
   * @param height 视口高度
   */
  draw(offsetX: number = 0, offsetY: number = 0, width: number = 2000, height: number = 1000) {
    this.graphics.clear();
    
    // Draw transparent background to capture hits
    this.graphics.rect(0, 0, width, height);
    this.graphics.fill({ color: 0xffffff, alpha: 0.001 }); // Almost transparent but hit-testable

    // Calculate visible range
    const { startCol, endCol, startX } = this.layout.getColRange(offsetX, width);
    const { startRow, endRow, startY } = this.layout.getRowRange(offsetY, height);

    // Grid Lines
    this.graphics.beginPath();
    this.graphics.setStrokeStyle({ width: 1, color: CONFIG.GRID_COLOR });

    // Vertical lines
    let currentX = startX;
    for (let c = startCol; c <= endCol; c++) {
      const colWidth = this.layout.getColWidth(c);
      const x = currentX - offsetX;
      
      // Draw line at the end of the column? 
      // Usually grid lines are at x=0, x=width, etc.
      // Standard: line at left of cell? Or right?
      // Standard spreadsheet: Lines are between cells.
      // Let's draw line at right edge of column.
      
      this.graphics.moveTo(x + colWidth, 0);
      this.graphics.lineTo(x + colWidth, height);
      
      // Also draw first line if c == 0? 
      // Usually header has border. 
      if (c === 0 && x >= 0) {
         this.graphics.moveTo(x, 0);
         this.graphics.lineTo(x, height);
      }

      currentX += colWidth;
    }

    // Horizontal lines
    let currentY = startY;
    for (let r = startRow; r <= endRow; r++) {
      const rowHeight = this.layout.getRowHeight(r);
      const y = currentY - offsetY;
      
      this.graphics.moveTo(0, y + rowHeight);
      this.graphics.lineTo(width, y + rowHeight);

      if (r === 0 && y >= 0) {
        this.graphics.moveTo(0, y);
        this.graphics.lineTo(width, y);
      }

      currentY += rowHeight;
    }
    
    this.graphics.stroke();
  }
}
