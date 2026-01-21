
/**
 * 基础的数据存储模型，目前使用 Map 存储稀疏数据。
 * 管理电子表格的所有单元格数据。
 */
export interface CellStyle {
  align?: 'left' | 'center' | 'right';
}

export interface CellData {
  /** 单元格显示的文本值 */
  value: string;
  /** 单元格的样式对象（可选） */
  style?: CellStyle;
}

export interface MergeRange {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

/**
 * 数据模型类，负责存储和检索单元格数据。
 * 使用稀疏矩阵的方式（Map）存储数据，键为 "col,row" 格式的字符串。
 */
export class DataModel {
  private data: Map<string, CellData>;
  private merges: MergeRange[] = [];

  constructor() {
    this.data = new Map();
    // Add some dummy data
    this.setValue(0, 0, 'Hello');
    this.setValue(1, 1, 'Pixi.js');
    this.setValue(2, 2, 'Spreadsheet');
    this.setValue(5, 5, 'Scroll Me!');
  }


  getMerges() {
    return this.merges;
  }

  addMerge(range: MergeRange) {
    // Basic implementation: Add merge range
    // In a real app, we should check for overlaps and split/merge ranges
    this.merges.push(range);
  }

  // Check if a cell is part of a merge.
  // Returns the master cell of the merge if found, or null.
  getMergeForCell(col: number, row: number): MergeRange | null {
    for (const merge of this.merges) {
      if (col >= merge.startCol && col <= merge.endCol && 
          row >= merge.startRow && row <= merge.endRow) {
        return merge;
      }
    }
    return null;
  }

  /**
   * 生成单元格的唯一键。
   * @param col 列索引（从0开始）
   * @param row 行索引（从0开始）
   * @returns "col,row" 格式的字符串键
   */
  getKey(col: number, row: number): string {
    return `${col},${row}`;
  }

  /**
   * 设置指定单元格的值。
   * @param col 列索引
   * @param row 行索引
   * @param value 要设置的文本值
   */
  setValue(col: number, row: number, value: string) {
    const key = this.getKey(col, row);
    const existing = this.data.get(key);
    if (existing) {
      existing.value = value;
    } else {
      this.data.set(key, { value });
    }
  }

  /**
   * 设置指定单元格的样式。
   * @param col 列索引
   * @param row 行索引
   * @param style 样式对象
   */
  setStyle(col: number, row: number, style: Partial<CellStyle>) {
    const key = this.getKey(col, row);
    let cellData = this.data.get(key);
    
    if (!cellData) {
      // If cell doesn't exist, create it with empty value
      cellData = { value: '', style: {} };
      this.data.set(key, cellData);
    }

    if (!cellData.style) {
      cellData.style = {};
    }

    Object.assign(cellData.style, style);
  }


  /**
   * 获取指定单元格的数据。
   * @param col 列索引
   * @param row 行索引
   * @returns 单元格数据对象，如果单元格为空则返回 undefined
   */
  getValue(col: number, row: number): CellData | undefined {
    return this.data.get(this.getKey(col, row));
  }

  insertRow(rowIndex: number) {
    const newData = new Map<string, CellData>();
    
    for (const [key, value] of this.data.entries()) {
      const [c, r] = key.split(',').map(Number);
      if (r >= rowIndex) {
        newData.set(this.getKey(c, r + 1), value);
      } else {
        newData.set(key, value);
      }
    }
    
    this.data = newData;
  }

  insertColumn(colIndex: number) {
    const newData = new Map<string, CellData>();
    
    for (const [key, value] of this.data.entries()) {
      const [c, r] = key.split(',').map(Number);
      if (c >= colIndex) {
        newData.set(this.getKey(c + 1, r), value);
      } else {
        newData.set(key, value);
      }
    }
    
    this.data = newData;
  }

  deleteRow(rowIndex: number) {
    const newData = new Map<string, CellData>();
    
    for (const [key, value] of this.data.entries()) {
      const [c, r] = key.split(',').map(Number);
      if (r === rowIndex) {
        // Skip deleted row
        continue;
      }
      if (r > rowIndex) {
        newData.set(this.getKey(c, r - 1), value);
      } else {
        newData.set(key, value);
      }
    }
    
    this.data = newData;
  }

  deleteColumn(colIndex: number) {
    const newData = new Map<string, CellData>();
    
    for (const [key, value] of this.data.entries()) {
      const [c, r] = key.split(',').map(Number);
      if (c === colIndex) {
        // Skip deleted column
        continue;
      }
      if (c > colIndex) {
        newData.set(this.getKey(c - 1, r), value);
      } else {
        newData.set(key, value);
      }
    }
    
    this.data = newData;
  }
}
