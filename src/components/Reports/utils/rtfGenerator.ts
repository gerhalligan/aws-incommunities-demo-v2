interface RTFStyle {
  fontSize?: number;
  bold?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
  spaceBefore?: number;
  spaceAfter?: number;
  firstLineIndent?: number;
}

export class RTFDocument {
  private content: string[] = [];
  private colorTable: Map<string, number> = new Map();
  private nextColorIndex: number = 1;

  constructor() {
    this.content.push('{\\rtf1\\ansi\\deff0');
    // Add default font table
    this.content.push('{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}');
    // Initialize color table
    this.content.push('{\\colortbl;'); // First entry is always empty
  }

  private addColor(color: string): number {
    if (!this.colorTable.has(color)) {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        this.colorTable.set(color, this.nextColorIndex);
        this.content[2] += `\\red${rgb.r}\\green${rgb.g}\\blue${rgb.b};`;
        this.nextColorIndex++;
      }
    }
    return this.colorTable.get(color) || 0;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  addParagraph(text: string, style: RTFStyle = {}) {
    let paragraph = '\\pard';
    
    // Alignment
    if (style.align === 'center') paragraph += '\\qc';
    else if (style.align === 'right') paragraph += '\\qr';
    
    // Spacing
    if (style.spaceBefore) paragraph += `\\sb${style.spaceBefore}`;
    if (style.spaceAfter) paragraph += `\\sa${style.spaceAfter}`;
    if (style.firstLineIndent) paragraph += `\\fi${style.firstLineIndent}`;
    
    // Font size (multiply by 2 for RTF points)
    if (style.fontSize) paragraph += `\\fs${style.fontSize} `;
    
    // Bold
    if (style.bold) paragraph += '\\b ';
    
    // Color
    if (style.color) {
      const colorIndex = this.addColor(style.color);
      paragraph += `\\cf${colorIndex} `;
    }
    
    // Add the text, escaping special characters
    paragraph += ` ${this.escapeRTF(text)}`;
    
    // Reset formatting
    if (style.bold) paragraph += '\\b0 ';
    paragraph += '\\par\\pard\\plain\\f0\\fs24\n';
    
    this.content.push(paragraph);
  }

  private escapeRTF(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\n/g, '\\par\n');
  }

  toString(): string {
    // Close the color table first
    this.content[2] += '}';
    return this.content.join('') + '\\par}';
  }
}