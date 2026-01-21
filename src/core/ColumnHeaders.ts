/**
 * 列头层，负责渲染列索引标签（A、B、C...），同样基于视口动态计算渲染范围。
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CONFIG } from './Config';
import { SelectionRange } from './SelectionLayer';
import { LayoutState } from './LayoutState';

export class ColumnHeaders extends Container {
  private graphics: Graphics;
  private labels: Container;
  private layout: LayoutState;

  constructor(layout: LayoutState) {
    super();
    this.layout = layout;
    this.graphics = new Graphics();
    this.labels = new Container();
    this.addChild(this.graphics);
    this.addChild(this.labels);
  }

  // Convert index to column letter (0 -> A, 1 -> B, ..., 26 -> AA)
  private getColumnLabel(index: number): string {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode(65 + (i % 26)) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  }

  draw(offsetX: number, width: number, selection: SelectionRange | null = null) {
    this.graphics.clear();
    this.labels.removeChildren();

    const { startCol, endCol, startX } = this.layout.getColRange(offsetX, width);

    // Background
    this.graphics.rect(0, 0, width, CONFIG.HEADER_HEIGHT);
    this.graphics.fill(CONFIG.HEADER_BG);

    // Selected Column Highlights
    if (selection) {
      const minSel = Math.min(selection.startCol, selection.endCol);
      const maxSel = Math.max(selection.startCol, selection.endCol);

      // Intersection of visible and selected
      const renderStart = Math.max(startCol, minSel);
      const renderEnd = Math.min(endCol, maxSel);

      if (renderStart <= renderEnd) {
        let selX = this.layout.getColX(renderStart) - offsetX;
        for (let c = renderStart; c <= renderEnd; c++) {
           const w = this.layout.getColWidth(c);
           this.graphics.rect(selX, 0, w, CONFIG.HEADER_HEIGHT);
           this.graphics.fill(CONFIG.HEADER_SELECTED_BG);
           selX += w;
        }
      }
    }
    
    // Bottom border
    this.graphics.setStrokeStyle({ width: 1, color: CONFIG.GRID_COLOR });
    this.graphics.moveTo(0, CONFIG.HEADER_HEIGHT);
    this.graphics.lineTo(width, CONFIG.HEADER_HEIGHT);
    this.graphics.stroke();

    // Separators and Text
    const style = new TextStyle({
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: CONFIG.FONT_SIZE,
      fill: CONFIG.TEXT_COLOR,
      align: 'center',
    });
    
    const selectedStyle = new TextStyle({
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: CONFIG.FONT_SIZE,
      fill: CONFIG.HEADER_SELECTED_COLOR,
      align: 'center',
      fontWeight: 'bold',
    });

    this.graphics.beginPath();
    this.graphics.setStrokeStyle({ width: 1, color: CONFIG.GRID_COLOR });

    let currentX = startX;
    for (let c = startCol; c <= endCol; c++) {
      const colWidth = this.layout.getColWidth(c);
      const x = currentX - offsetX;
      
      // Vertical separator
      this.graphics.moveTo(x + colWidth, 0);
      this.graphics.lineTo(x + colWidth, CONFIG.HEADER_HEIGHT);

      // Text
      let isSelected = false;
      if (selection) {
         const minSel = Math.min(selection.startCol, selection.endCol);
         const maxSel = Math.max(selection.startCol, selection.endCol);
         if (c >= minSel && c <= maxSel) {
             isSelected = true;
         }
      }

      const text = new Text({ 
          text: this.getColumnLabel(c), 
          style: isSelected ? selectedStyle : style 
      });
      text.anchor.set(0.5);
      text.x = x + colWidth / 2;
      text.y = CONFIG.HEADER_HEIGHT / 2;
      this.labels.addChild(text);
      
      currentX += colWidth;
    }
    this.graphics.stroke();
  }
}
