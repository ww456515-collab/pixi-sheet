
/**
 * 负责渲染单元格内的文本内容，同样基于视口动态计算渲染范围。
 */
import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { DataModel } from './DataModel';
import { CONFIG } from './Config';
import { LayoutState } from './LayoutState';

export class CellsLayer extends Container {
  private labels: Container;
  private background: Graphics;
  private dataModel: DataModel;
  private textPool: Text[] = [];
  private defaultStyle: TextStyle;
  private layout: LayoutState;

  constructor(dataModel: DataModel, layout: LayoutState) {
    super();
    this.dataModel = dataModel;
    this.layout = layout;
    
    this.background = new Graphics();
    this.addChild(this.background);

    this.labels = new Container();
    this.addChild(this.labels);
    
    this.defaultStyle = new TextStyle({
      fontFamily: CONFIG.FONT_FAMILY,
      fontSize: CONFIG.FONT_SIZE,
      fill: CONFIG.TEXT_COLOR,
    });
  }

  draw(offsetX: number, offsetY: number, width: number, height: number) {
    // Reuse objects from pool instead of removing and recreating
    let poolIndex = 0;

    this.background.clear();

    const { startCol, endCol, startX } = this.layout.getColRange(offsetX, width);
    const { startRow, endRow, startY } = this.layout.getRowRange(offsetY, height);

    // Render Merged Cells First (or standard iteration, handling skip)
    // Actually, iterating standard cells and checking if they are "hidden" by a merge is one way.
    // Or we just check: if cell is start of merge -> render merge.
    // If cell is inside merge but not start -> skip.
    
    // We need a way to quickly check merge status.
    // Optimization: Pre-calculate active merges in this viewport?
    // For now, per-cell check is okay for small viewports.

    let currentX = startX;
    for (let c = startCol; c <= endCol; c++) {
      const colWidth = this.layout.getColWidth(c);
      
      let currentY = startY;
      for (let r = startRow; r <= endRow; r++) {
        const rowHeight = this.layout.getRowHeight(r);
        
        // Check Merge Status
        const merge = this.dataModel.getMergeForCell(c, r);
        let shouldRender = true;
        let renderWidth = colWidth;
        let renderHeight = rowHeight;
        
        if (merge) {
            if (merge.startCol === c && merge.startRow === r) {
                // This is the top-left cell of the merge. Render it with full size.
                // Calculate total width/height of merge
                renderWidth = 0;
                for (let mc = merge.startCol; mc <= merge.endCol; mc++) {
                    renderWidth += this.layout.getColWidth(mc);
                }
                renderHeight = 0;
                for (let mr = merge.startRow; mr <= merge.endRow; mr++) {
                    renderHeight += this.layout.getRowHeight(mr);
                }

                // Draw background for merged cell to hide grid lines
                const x = currentX - offsetX;
                const y = currentY - offsetY;
                this.background.rect(x, y, renderWidth, renderHeight);
                this.background.fill(0xffffff);
                this.background.stroke({ width: 1, color: CONFIG.GRID_COLOR });

            } else {
                // This cell is hidden by a merge
                shouldRender = false;
            }
        }

        const cellData = this.dataModel.getValue(c, r);
        
        if (shouldRender && cellData) {
          const x = currentX - offsetX;
          const y = currentY - offsetY;

          // Simple culling/clipping check
          if (x + renderWidth >= 0 && y + renderHeight >= 0) {
              let text = this.textPool[poolIndex];
              if (!text) {
                // Create new if pool is exhausted
                text = new Text({ text: cellData.value, style: this.defaultStyle });
                this.labels.addChild(text);
                this.textPool.push(text);
              } else {
                // Reuse existing
                text.visible = true;
                if (text.text !== cellData.value) {
                  text.text = cellData.value;
                }
              }

              const align = cellData.style?.align || 'left';
              
              if (align === 'center') {
                text.anchor.set(0.5, 0);
                text.x = x + renderWidth / 2;
              } else if (align === 'right') {
                text.anchor.set(1, 0);
                text.x = x + renderWidth - 5;
              } else {
                text.anchor.set(0, 0);
                text.x = x + 5;
              }

              text.y = y + (renderHeight - CONFIG.FONT_SIZE) / 2; // vertically center in (potentially merged) cell
              
              poolIndex++;
          }
        }
        currentY += rowHeight;
      }
      currentX += colWidth;
    }

    // Hide unused text objects
    for (let i = poolIndex; i < this.textPool.length; i++) {
      this.textPool[i].visible = false;
    }
  }
}
