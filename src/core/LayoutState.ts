import { CONFIG } from './Config';

export class LayoutState {
  private colWidths = new Map<number, number>();
  private rowHeights = new Map<number, number>();

  // We need to know how far we've cached. 
  // For infinite scrolling, we can't cache everything. 
  // But for now, let's assume we cache up to a reasonable max or dynamically extend.
  // A simple approach is to calculate on demand and cache.
  // But for simplicity in this refactor, let's just use the Map and optimize later if needed.
  // Actually, calculating visible range every frame with a loop is fine for < 1000 cols.
  // Let's implement helper methods that do the math.

  getColWidth(col: number): number {
    return this.colWidths.get(col) ?? CONFIG.CELL_WIDTH;
  }

  getRowHeight(row: number): number {
    return this.rowHeights.get(row) ?? CONFIG.CELL_HEIGHT;
  }

  setColWidth(col: number, width: number) {
    this.colWidths.set(col, Math.max(width, 20)); // Minimum width 20px
  }

  setRowHeight(row: number, height: number) {
    this.rowHeights.set(row, Math.max(height, 20)); // Minimum height 20px
  }

  insertRow(rowIndex: number) {
    const newHeights = new Map<number, number>();
    for (const [r, h] of this.rowHeights.entries()) {
      if (r >= rowIndex) {
        newHeights.set(r + 1, h);
      } else {
        newHeights.set(r, h);
      }
    }
    this.rowHeights = newHeights;
  }

  insertColumn(colIndex: number) {
    const newWidths = new Map<number, number>();
    for (const [c, w] of this.colWidths.entries()) {
      if (c >= colIndex) {
        newWidths.set(c + 1, w);
      } else {
        newWidths.set(c, w);
      }
    }
    this.colWidths = newWidths;
  }

  deleteRow(rowIndex: number) {
    const newHeights = new Map<number, number>();
    for (const [r, h] of this.rowHeights.entries()) {
      if (r === rowIndex) continue;
      if (r > rowIndex) {
        newHeights.set(r - 1, h);
      } else {
        newHeights.set(r, h);
      }
    }
    this.rowHeights = newHeights;
  }

  deleteColumn(colIndex: number) {
    const newWidths = new Map<number, number>();
    for (const [c, w] of this.colWidths.entries()) {
      if (c === colIndex) continue;
      if (c > colIndex) {
        newWidths.set(c - 1, w);
      } else {
        newWidths.set(c, w);
      }
    }
    this.colWidths = newWidths;
  }

  // Calculate X position for a column
  // This is O(N). For high column counts, we need the prefix sum cache.
  // Let's implement a simple version first.
  getColX(col: number): number {
    let x = 0;
    for (let i = 0; i < col; i++) {
      x += this.getColWidth(i);
    }
    return x;
  }

  getRowY(row: number): number {
    let y = 0;
    for (let i = 0; i < row; i++) {
      y += this.getRowHeight(i);
    }
    return y;
  }

  // Get column index at specific X coordinate
  getColIndexAt(x: number): number {
    let currentX = 0;
    let col = 0;
    while (true) {
      const width = this.getColWidth(col);
      if (currentX + width > x) {
        return col;
      }
      currentX += width;
      col++;
      // Safety break
      if (col > 10000) return col;
    }
  }

  getRowIndexAt(y: number): number {
    let currentY = 0;
    let row = 0;
    while (true) {
      const height = this.getRowHeight(row);
      if (currentY + height > y) {
        return row;
      }
      currentY += height;
      row++;
      if (row > 10000) return row;
    }
  }

  // Optimized for rendering: Get range of columns visible in [scrollX, scrollX + width]
  getColRange(scrollX: number, width: number) {
    let startCol = 0;
    let currentX = 0;
    
    // Find start
    while (currentX + this.getColWidth(startCol) <= scrollX) {
      currentX += this.getColWidth(startCol);
      startCol++;
    }
    
    // Find end
    let endCol = startCol;
    let endX = currentX;
    const targetX = scrollX + width;
    
    while (endX < targetX) {
      endX += this.getColWidth(endCol);
      endCol++;
    }
    
    return { startCol, endCol, startX: currentX };
  }

  getRowRange(scrollY: number, height: number) {
    let startRow = 0;
    let currentY = 0;
    
    // Find start
    while (currentY + this.getRowHeight(startRow) <= scrollY) {
      currentY += this.getRowHeight(startRow);
      startRow++;
    }
    
    // Find end
    let endRow = startRow;
    let endY = currentY;
    const targetY = scrollY + height;
    
    while (endY < targetY) {
      endY += this.getRowHeight(endRow);
      endRow++;
    }
    
    return { startRow, endRow, startY: currentY };
  }
}
