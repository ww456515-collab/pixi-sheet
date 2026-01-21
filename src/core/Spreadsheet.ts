/**
 * 主控制器，管理 Canvas 画布、视口滚动和交互事件（平移、滚轮）。
 */
import { Application, Container, FederatedPointerEvent, EventEmitter } from 'pixi.js';
import { ISpreadsheetController } from './interfaces';
import { Grid } from './Grid';
import { ColumnHeaders } from './ColumnHeaders';
import { RowHeaders } from './RowHeaders';
import { DataModel } from './DataModel';
import { CellsLayer } from './CellsLayer';
import { CONFIG } from './Config';
import { Toolbar } from '../ui/Toolbar';
import { SelectionManager } from './SelectionManager';
import { Editor } from './Editor';
import { LayoutState } from './LayoutState';
import { ContextMenu } from '../ui/ContextMenu';

export interface SpreadsheetOptions {
  view?: {
    showGridLines?: boolean;
    showHeaders?: boolean;
    showToolbar?: boolean;
  }
}

export class Spreadsheet extends EventEmitter implements ISpreadsheetController {
  /**
   * 获取当前视口的滚动位置。
   * @returns 包含 scrollX 和 scrollY 的对象
   */
  getScrollPosition() {
    return { scrollX: this.scrollX, scrollY: this.scrollY };
  }

  /**
   * 获取底层的 HTMLCanvasElement。
   * 用于 DOM 元素的定位（如编辑器输入框）。
   */
  getCanvas() {
    return this.app.canvas;
  }

  /**
   * 获取行标题区域的宽度。
   * @returns 如果显示标题则返回宽度，否则返回 0
   */
  getHeaderWidth() {
    return this.headerWidth;
  }

  /**
   * 获取列标题区域的高度。
   * @returns 如果显示标题则返回高度，否则返回 0
   */
  getHeaderHeight() {
    return this.headerHeight;
  }

  /**
   * 请求重新渲染电子表格。
   * 通常在数据变更或样式变更后调用。
   */
  requestRender() {
    this.render();
  }

  /**
   * 获取主要的内容容器。
   * 包含网格、单元格和选区层。
   */
  getContainer() {
    return this.container;
  }

  mergeSelectedCells() {
    const range = this.selectionManager.selection;
    if (!range) return;

    // Check if valid range (more than 1 cell)
    if (range.startCol === range.endCol && range.startRow === range.endRow) return;

    this.dataModel.addMerge({
      startCol: range.startCol,
      startRow: range.startRow,
      endCol: range.endCol,
      endRow: range.endRow
    });

    // We should clear the selection or update it to reflect the merge
    // For now, just re-render
    this.requestRender();
  }

  setAlignment(align: 'left' | 'center' | 'right') {
    const range = this.selectionManager.selection;
    if (!range) return;

    for (let c = range.startCol; c <= range.endCol; c++) {
      for (let r = range.startRow; r <= range.endRow; r++) {
        this.dataModel.setStyle(c, r, { align });
      }
    }
    this.requestRender();
    this.emit('style-change');
  }

  /**
   * 获取指定单元格的数据。
   * @param col 列索引
   * @param row 行索引
   */
  getCellData(col: number, row: number) {
    return this.dataModel.getValue(col, row);
  }

  getSelection() {
    return this.selectionManager.selection;
  }

  /**
   * 将指针事件转换为相对于视口内容的坐标。
   * @param e PIXI 的指针事件
   * @returns 包含 x, y 坐标的对象
   */
  getViewportPoint(e: FederatedPointerEvent) {
    return e.getLocalPosition(this.container);
  }
  private app: Application;
  private container: Container;
  private grid: Grid;
  private cellsLayer: CellsLayer;
  private colHeaders: ColumnHeaders;
  private rowHeaders: RowHeaders;
  private dataModel: DataModel;
  private toolbar?: Toolbar;
  private selectionManager: SelectionManager;
  private editor: Editor;
  private layoutState: LayoutState;
  private contextMenu: ContextMenu;
  
  // Viewport state
  private scrollX = 0;
  private scrollY = 0;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  // Resizing state
  private isResizing = false;
  private resizeType: 'col' | 'row' | null = null;
  private resizeIndex = -1;
  private resizeStartSize = 0;
  private resizeStartPosition = 0;

  // View Options
  private showGridLines = true;
  private showHeaders = true;
  private showToolbar = false;

  /**
   * 创建一个新的电子表格实例。
   * @param options 配置选项
   */
  constructor(options: SpreadsheetOptions = {}) {
    super();
    this.app = new Application();
    this.container = new Container(); // Content container
    this.layoutState = new LayoutState();
    this.grid = new Grid(this.layoutState);
    this.dataModel = new DataModel();
    this.cellsLayer = new CellsLayer(this.dataModel, this.layoutState);
    this.colHeaders = new ColumnHeaders(this.layoutState);
    this.rowHeaders = new RowHeaders(this.layoutState);
    this.selectionManager = new SelectionManager(this, this.layoutState, this.dataModel);
    this.editor = new Editor(this, this.dataModel, this.layoutState);
    this.contextMenu = new ContextMenu();

    if (options.view) {
      this.showGridLines = options.view.showGridLines ?? true;
      this.showHeaders = options.view.showHeaders ?? true;
      this.showToolbar = options.view.showToolbar ?? false;
    }

    // Keyboard handling
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.editor.isActive) return;
    
    // Ignore if some other input is focused
    if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
    }

    const selection = this.selectionManager.selection;
    if (!selection) return;

    // Determine current "active" cell (usually top-left of selection for simple navigation)
    // If we support moving the "focus" within a selection, it's more complex.
    // For now, assume single cell navigation or moving the whole selection anchor.
    // We'll use startCol/startRow as the anchor if we are just moving.
    
    // If shift key is pressed, we might want to extend selection (todo)
    // For this task, we focus on moving the cell selection.

    let { startCol: col, startRow: row } = selection;

    let moved = false;
    if (e.key === 'ArrowUp') {
      row = Math.max(0, row - 1);
      moved = true;
    } else if (e.key === 'ArrowDown') {
      row++; // Should probably check max row limit if any
      moved = true;
    } else if (e.key === 'ArrowLeft') {
      col = Math.max(0, col - 1);
      moved = true;
    } else if (e.key === 'ArrowRight') {
      col++; // Check max col limit
      moved = true;
    }

    if (moved) {
      e.preventDefault();
      this.selectionManager.selectCell(col, row);
      this.scrollIntoView(col, row);
    }
  }

  private scrollIntoView(col: number, row: number) {
    // Get cell bounds
    const colX = this.layoutState.getColX(col);
    const rowY = this.layoutState.getRowY(row);
    const colWidth = this.layoutState.getColWidth(col);
    const rowHeight = this.layoutState.getRowHeight(row);

    // Get viewport bounds (visible area)
    const viewportWidth = this.app.canvas.width / window.devicePixelRatio - this.headerWidth;
    const viewportHeight = this.app.canvas.height / window.devicePixelRatio - this.headerHeight;

    // Adjust scrollX
    if (colX < this.scrollX) {
      this.scrollX = colX;
    } else if (colX + colWidth > this.scrollX + viewportWidth) {
      this.scrollX = colX + colWidth - viewportWidth;
    }

    // Adjust scrollY
    if (rowY < this.scrollY) {
      this.scrollY = rowY;
    } else if (rowY + rowHeight > this.scrollY + viewportHeight) {
      this.scrollY = rowY + rowHeight - viewportHeight;
    }

    this.render();
    this.emit('scroll', { x: this.scrollX, y: this.scrollY });
  }

  /**
   * 初始化电子表格并挂载到指定的 DOM 元素上。
   * @param element 容器 DOM 元素
   */
  async init(element: HTMLElement) {
    // Setup Toolbar if enabled
    let canvasContainer = element;
    if (this.showToolbar) {
      this.toolbar = new Toolbar(this);
      
      // Create a flex container to hold toolbar and canvas
      // But user passed `element`, so we should probably clear it and structure it
      // OR we expect `element` to be the container for EVERYTHING.
      
      // Let's create a wrapper for canvas to ensure it takes remaining space
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.overflow = 'hidden';
      
      element.appendChild(wrapper);
      
      this.toolbar.mount(wrapper);
      
      const canvasWrapper = document.createElement('div');
      canvasWrapper.style.flex = '1';
      canvasWrapper.style.position = 'relative';
      canvasWrapper.style.overflow = 'hidden';
      wrapper.appendChild(canvasWrapper);
      
      canvasContainer = canvasWrapper;
    }

    await this.app.init({
      resizeTo: canvasContainer,
      backgroundColor: 0xffffff,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasContainer.appendChild(this.app.canvas);

    this.app.stage.addChild(this.container);
    
    // Add layers: Grid first, then Cells (blocking grid), then Selection (overlay)
    this.container.addChild(this.grid);
    this.container.addChild(this.cellsLayer);
    this.container.addChild(this.selectionManager.getLayer());

    // Headers
    this.app.stage.addChild(this.colHeaders);
    this.app.stage.addChild(this.rowHeaders);

    // Initial draw
    this.updateLayout();
    this.render();

    // Handle resize
    // Note: When using flex layout with toolbar, resizeTo works on the canvasContainer
    // which automatically resizes when window resizes if CSS is correct.// Handle resize
    window.addEventListener('resize', () => {
      this.app.resize();
      // Update hitArea to new screen size
      this.app.stage.hitArea = this.app.screen;
      this.render();
    });

    // Setup Interaction (Pan)
    this.setupInteraction();

    // Default Selection
    if (CONFIG.DEFAULT_SELECTION_ENABLED) {
        this.selectionManager.selectCell(0, 0);
    }
  }

  /**
   * 设置是否显示网格线。
   * @param visible true 显示，false 隐藏
   */
  setShowGridLines(visible: boolean) {
    this.showGridLines = visible;
    this.grid.visible = visible;
    this.render();
  }

  /**
   * 设置是否显示行和列标题。
   * @param visible true 显示，false 隐藏
   */
  setShowHeaders(visible: boolean) {
    this.showHeaders = visible;
    this.colHeaders.visible = visible;
    this.rowHeaders.visible = visible;
    this.updateLayout();
    this.render();
  }

  private get headerWidth() {
    return this.showHeaders ? CONFIG.HEADER_WIDTH : 0;
  }

  private get headerHeight() {
    return this.showHeaders ? CONFIG.HEADER_HEIGHT : 0;
  }

  private updateLayout() {
    // Update container position based on headers visibility
    this.container.x = this.headerWidth;
    this.container.y = this.headerHeight;

    this.colHeaders.x = this.headerWidth;
    this.colHeaders.y = 0;

    this.rowHeaders.x = 0;
    this.rowHeaders.y = this.headerHeight;
  }

  private setupInteraction() {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    // Context Menu Handling
    this.app.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      const rect = this.app.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check Column Header
      if (y <= this.headerHeight && x > this.headerWidth) {
         const colX = x - this.headerWidth + this.scrollX;
         const col = this.layoutState.getColIndexAt(colX);
         this.contextMenu.show(e.clientX, e.clientY, [
           { 
             label: 'Insert Column', 
             action: () => {
               this.layoutState.insertColumn(col);
               this.dataModel.insertColumn(col);
               this.requestRender();
             } 
           },
           {
             label: 'Delete Column',
             action: () => {
                this.layoutState.deleteColumn(col);
                this.dataModel.deleteColumn(col);
                this.requestRender();
             }
           }
         ]);
         return;
      }

      // Check Row Header
      if (x <= this.headerWidth && y > this.headerHeight) {
         const rowY = y - this.headerHeight + this.scrollY;
         const row = this.layoutState.getRowIndexAt(rowY);
         this.contextMenu.show(e.clientX, e.clientY, [
           { 
             label: 'Insert Row', 
             action: () => {
               this.layoutState.insertRow(row);
               this.dataModel.insertRow(row);
               this.requestRender();
             } 
           },
           {
             label: 'Delete Row',
             action: () => {
                this.layoutState.deleteRow(row);
                this.dataModel.deleteRow(row);
                this.requestRender();
             }
           }
         ]);
         return;
      }
    });

    this.app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
      // Check for resize first
      if (this.app.canvas.style.cursor === 'col-resize') {
        this.isResizing = true;
        this.resizeType = 'col';
        this.resizeStartPosition = e.global.x;
        
        // Find which column edge we are near
        
        // We need to iterate to find the column boundary
        // Optimization: Binary search or lookup in LayoutState would be better
        // For now, simple loop is okay for typical viewports
        // Actually, we need to know exactly which column separator is under the mouse.
        // We can do this in pointermove to set cursor, and store the "target resize column" there.
        // But let's recalculate for safety.
        
        // Reverse lookup from x to column index is tricky with variable widths.
        // But we know we are over the header.
        
        // Let's implement a "getResizeTarget" helper
        const target = this.getResizeTarget(e.global.x, e.global.y);
        if (target) {
            this.resizeIndex = target.index;
            this.resizeStartSize = target.type === 'col' ? 
                this.layoutState.getColWidth(target.index) : 
                this.layoutState.getRowHeight(target.index);
        }
        return;
      } else if (this.app.canvas.style.cursor === 'row-resize') {
        this.isResizing = true;
        this.resizeType = 'row';
        this.resizeStartPosition = e.global.y;
        
        const target = this.getResizeTarget(e.global.x, e.global.y);
        if (target) {
            this.resizeIndex = target.index;
            this.resizeStartSize = target.type === 'row' ? 
                this.layoutState.getRowHeight(target.index) : 
                this.layoutState.getColWidth(target.index);
        }
        return;
      }

      // Check for Header Clicks
      if (e.global.x > this.headerWidth && e.global.y <= this.headerHeight) {
          // Column Header Click
          const x = e.global.x - this.headerWidth + this.scrollX;
          const col = this.layoutState.getColIndexAt(x);
          this.selectionManager.selectColumn(col);
          return;
      } else if (e.global.x <= this.headerWidth && e.global.y > this.headerHeight) {
          // Row Header Click
          const y = e.global.y - this.headerHeight + this.scrollY;
          const row = this.layoutState.getRowIndexAt(y);
          this.selectionManager.selectRow(row);
          return;
      }

      if (e.button === 1) {
        this.isDragging = true;
        this.lastX = e.global.x;
        this.lastY = e.global.y;
      } else {
        // Delegate to selection manager
        console.log('Delegating to SelectionManager');
        this.selectionManager.onPointerDown(e);
      }
    });

    this.app.stage.on('pointerup', () => {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeType = null;
      this.selectionManager.onPointerUp();
    });

    this.app.stage.on('pointerupoutside', () => {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeType = null;
      this.selectionManager.onPointerUp();
      this.app.canvas.style.cursor = 'default';
    });

    this.app.stage.on('pointermove', (e: FederatedPointerEvent) => {
      if (this.isResizing && this.resizeType) {
          if (this.resizeType === 'col') {
              const delta = e.global.x - this.resizeStartPosition;
              const newWidth = Math.max(20, this.resizeStartSize + delta);
              this.layoutState.setColWidth(this.resizeIndex, newWidth);
          } else {
              const delta = e.global.y - this.resizeStartPosition;
              const newHeight = Math.max(20, this.resizeStartSize + delta);
              this.layoutState.setRowHeight(this.resizeIndex, newHeight);
          }
          this.requestRender();
          return;
      }

      // Update cursor style
      const resizeTarget = this.getResizeTarget(e.global.x, e.global.y);
      
      if (resizeTarget) {
          this.app.canvas.style.cursor = resizeTarget.type === 'col' ? 'col-resize' : 'row-resize';
      } else if (this.isDragging) {
        this.app.canvas.style.cursor = 'grabbing';
      } else if (e.global.x > this.headerWidth && e.global.y > this.headerHeight) {
        // Over cells
        this.app.canvas.style.cursor = 'cell';
      } else if (e.global.x > this.headerWidth && e.global.y <= this.headerHeight) {
        // Over column headers
        this.app.canvas.style.cursor = CONFIG.CURSOR_DOWN; // Selection cursor for column headers
      } else if (e.global.x <= this.headerWidth && e.global.y > this.headerHeight) {
        // Over row headers
        this.app.canvas.style.cursor = CONFIG.CURSOR_RIGHT; // Selection cursor for row headers
      } else {
        // Top-left corner
        this.app.canvas.style.cursor = 'default';
      }

      if (this.isDragging) {
        const dx = e.global.x - this.lastX;
        const dy = e.global.y - this.lastY;
        
        this.scrollX -= dx;
        this.scrollY -= dy;
        
        // Clamp to 0
        if (this.scrollX < 0) this.scrollX = 0;
        if (this.scrollY < 0) this.scrollY = 0;

        this.lastX = e.global.x;
        this.lastY = e.global.y;

        this.render();
      } else {
        this.selectionManager.onPointerMove(e);
      }
    });

    // Wheel support
    this.app.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.scrollX += e.deltaX;
      this.scrollY += e.deltaY;
      
      if (this.scrollX < 0) this.scrollX = 0;
      if (this.scrollY < 0) this.scrollY = 0;
      
      this.emit('scroll', { x: this.scrollX, y: this.scrollY });
      
      this.render();
    }, { passive: false });

    // Double click for editing
    this.app.canvas.addEventListener('dblclick', (e) => {
      console.log('Double Click detected', e.clientX, e.clientY);
      const rect = this.app.canvas.getBoundingClientRect();
      
      // We need to use LayoutState to find the cell
      const x = e.clientX - rect.left - this.headerWidth + this.scrollX;
      const y = e.clientY - rect.top - this.headerHeight + this.scrollY;
      
      if (x < 0 || y < 0) return;

      const col = this.layoutState.getColIndexAt(x);
      const row = this.layoutState.getRowIndexAt(y);
      
      this.editor.startEditing(col, row);
    });
  }

  private getResizeTarget(x: number, y: number): { type: 'col' | 'row', index: number } | null {
      const resizeThreshold = 5;

      // Check Column Header Borders
      if (y <= this.headerHeight && x > this.headerWidth) {
          const relativeX = x + this.scrollX - this.headerWidth;
          // Find the column edge close to relativeX
          // Optimization: binary search or layout state helper
          // For now, iterate visible columns? Or calculate roughly
          
          // Better: We need to find if `relativeX` is close to `getColX(i) + width`
          // Let's iterate from estimated column
          let col = this.layoutState.getColIndexAt(relativeX);
          
          // Check right edge of this column
          const colX = this.layoutState.getColX(col);
          const colWidth = this.layoutState.getColWidth(col);
          const rightEdge = colX + colWidth;
          
          if (Math.abs(relativeX - rightEdge) <= resizeThreshold) {
              return { type: 'col', index: col };
          }
          
          // Check left edge (which is right edge of prev column)
          if (col > 0 && Math.abs(relativeX - colX) <= resizeThreshold) {
               return { type: 'col', index: col - 1 };
          }
      }

      // Check Row Header Borders
      if (x <= this.headerWidth && y > this.headerHeight) {
          const relativeY = y + this.scrollY - this.headerHeight;
          let row = this.layoutState.getRowIndexAt(relativeY);
          
          const rowY = this.layoutState.getRowY(row);
          const rowHeight = this.layoutState.getRowHeight(row);
          const bottomEdge = rowY + rowHeight;
          
          if (Math.abs(relativeY - bottomEdge) <= resizeThreshold) {
              return { type: 'row', index: row };
          }
          
          if (row > 0 && Math.abs(relativeY - rowY) <= resizeThreshold) {
              return { type: 'row', index: row - 1 };
          }
      }

      return null;
  }

  private render() {
    const viewportWidth = this.app.screen.width - this.headerWidth;
    const viewportHeight = this.app.screen.height - this.headerHeight;

    // Update Grid
    if (this.showGridLines) {
      this.grid.draw(this.scrollX, this.scrollY, viewportWidth, viewportHeight);
    }
    
    // Update Selection
    this.selectionManager.draw(this.scrollX, this.scrollY);

    // Update Cells
    this.cellsLayer.draw(this.scrollX, this.scrollY, viewportWidth, viewportHeight);

    // Update Headers
    if (this.showHeaders) {
      this.colHeaders.draw(this.scrollX, viewportWidth, this.selectionManager.selection);
      this.rowHeaders.draw(this.scrollY, viewportHeight, this.selectionManager.selection);
    }

    // Update Editor Position
    this.editor.updatePosition();
  }
}
