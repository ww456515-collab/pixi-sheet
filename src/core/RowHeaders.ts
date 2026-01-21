/**
 * 行头层，负责渲染行索引标签（1、2、3...），同样基于视口动态计算渲染范围。
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CONFIG } from './Config';
import { SelectionRange } from './SelectionLayer';
import { LayoutState } from './LayoutState';

export class RowHeaders extends Container {
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

  draw(offsetY: number, height: number, selection: SelectionRange | null = null) {
    this.graphics.clear();
    this.labels.removeChildren();

    const { startRow, endRow, startY } = this.layout.getRowRange(offsetY, height);

    // Background
    this.graphics.rect(0, 0, CONFIG.HEADER_WIDTH, height);
    this.graphics.fill(CONFIG.HEADER_BG);
    
    // Selected Row Highlights
    if (selection) {
      const minSel = Math.min(selection.startRow, selection.endRow);
      const maxSel = Math.max(selection.startRow, selection.endRow);

      // Intersection of visible and selected
      const renderStart = Math.max(startRow, minSel);
      const renderEnd = Math.min(endRow, maxSel);

      if (renderStart <= renderEnd) {
        let selY = this.layout.getRowY(renderStart) - offsetY;
        for (let r = renderStart; r <= renderEnd; r++) {
           const h = this.layout.getRowHeight(r);
           this.graphics.rect(0, selY, CONFIG.HEADER_WIDTH, h);
           this.graphics.fill(CONFIG.HEADER_SELECTED_BG);
           selY += h;
        }
      }
    }

    // Right border
    this.graphics.setStrokeStyle({ width: 1, color: CONFIG.GRID_COLOR });
    this.graphics.moveTo(CONFIG.HEADER_WIDTH, 0);
    this.graphics.lineTo(CONFIG.HEADER_WIDTH, height);
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

    let currentY = startY;
    for (let r = startRow; r <= endRow; r++) {
      const rowHeight = this.layout.getRowHeight(r);
      const y = currentY - offsetY;
      
      // Horizontal separator
      this.graphics.moveTo(0, y + rowHeight);
      this.graphics.lineTo(CONFIG.HEADER_WIDTH, y + rowHeight);

      // Text
      let isSelected = false;
      if (selection) {
         const minSel = Math.min(selection.startRow, selection.endRow);
         const maxSel = Math.max(selection.startRow, selection.endRow);
         if (r >= minSel && r <= maxSel) {
             isSelected = true;
         }
      }

      const text = new Text({ 
          text: String(r + 1), 
          style: isSelected ? selectedStyle : style 
      });
      text.anchor.set(0.5);
      text.x = CONFIG.HEADER_WIDTH / 2;
      text.y = y + rowHeight / 2;
      this.labels.addChild(text);

      currentY += rowHeight;
    }
    this.graphics.stroke();
  }
}
