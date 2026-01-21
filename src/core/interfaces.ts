import { FederatedPointerEvent } from 'pixi.js';

/**
 * Interface defining the interaction contract between the Spreadsheet controller
 * and its sub-components (SelectionManager, Editor, etc.)
 */
export interface ISpreadsheetController {
  /**
   * Get the current scroll offset of the viewport
   */
  getScrollPosition(): { scrollX: number; scrollY: number };

  /**
   * Convert a pointer event to a point relative to the viewport container
   */
  getViewportPoint(e: FederatedPointerEvent): { x: number; y: number };

  /**
   * Request a re-render of the spreadsheet
   */
  requestRender(): void;

  /**
   * Emit an event
   */
  emit(event: string | symbol, ...args: any[]): boolean;

  /**
   * Get the underlying canvas element (needed for DOM overlay positioning)
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Get the width of the row headers
   */
  getHeaderWidth(): number;

  /**
   * Get the height of the column headers
   */
  getHeaderHeight(): number;
}
