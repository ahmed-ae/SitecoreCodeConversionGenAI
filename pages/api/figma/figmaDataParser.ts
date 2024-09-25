interface FigmaNode {
    id: string;
    name: string;
    type: string;
    [key: string]: any;
  }
  
  export interface ParsedComponent {
    id: string;
    name: string;
    type: string;
    styles: {
      width?: string;
      height?: string;
      backgroundColor?: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
      // Add more style properties as needed
    };
    children: ParsedComponent[];
  }
  
  export class FigmaDataParser {
    parseNode(node: FigmaNode): ParsedComponent {
      const parsedComponent: ParsedComponent = {
        id: node.id,
        name: node.name,
        type: node.type,
        styles: this.extractStyles(node),
        children: [],
      };
  
      if (node.children) {
        parsedComponent.children = node.children.map((child: FigmaNode) => this.parseNode(child));
      }
  
      return parsedComponent;
    }
  
    private extractStyles(node: FigmaNode): ParsedComponent['styles'] {
      const styles: ParsedComponent['styles'] = {};
  
      if (node.absoluteBoundingBox) {
        styles.width = `${node.absoluteBoundingBox.width}px`;
        styles.height = `${node.absoluteBoundingBox.height}px`;
      }
  
      if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.color) {
          styles.backgroundColor = this.rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        }
      }
  
      if (node.style) {
        styles.fontFamily = node.style.fontFamily;
        styles.fontSize = `${node.style.fontSize}px`;
        styles.fontWeight = node.style.fontWeight.toString();
        if (node.style.fills && node.style.fills.length > 0) {
          const textFill = node.style.fills[0];
          if (textFill.type === 'SOLID' && textFill.color) {
            styles.color = this.rgbToHex(textFill.color.r, textFill.color.g, textFill.color.b);
          }
        }
      }
  
      return styles;
    }
  
    private rgbToHex(r: number, g: number, b: number): string {
      return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    }
  }