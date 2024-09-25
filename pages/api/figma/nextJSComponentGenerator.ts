
import { ParsedComponent } from './figmaDataParser';

class NextJSComponentGenerator {
  generateComponent(parsedComponent: ParsedComponent): string {
    const componentName = this.formatComponentName(parsedComponent.name);
    const tailwindClasses = this.generateTailwindClasses(parsedComponent.styles);
    const children = parsedComponent.children.map(child => this.generateComponent(child)).join('\n');

    return `
import { Text } from '@sitecore-jss/sitecore-jss-nextjs';

const ${componentName} = (): JSX.Element => {
  return (
    <div className="${tailwindClasses}">
      ${parsedComponent.type === 'TEXT' ? `<Text field={{ value: '${parsedComponent.name}' }} />` : ''}
      ${children}
    </div>
  );
};

export default ${componentName};
    `.trim();
  }

  private formatComponentName(name: string): string {
    return name.replace(/\s+/g, '').replace(/^[a-z]/, char => char.toUpperCase());
  }

  private generateTailwindClasses(styles: ParsedComponent['styles']): string {
    const classes = [];

    if (styles.width) classes.push(`w-[${styles.width}]`);
    if (styles.height) classes.push(`h-[${styles.height}]`);
    if (styles.backgroundColor) classes.push(`bg-[${styles.backgroundColor}]`);
    if (styles.color) classes.push(`text-[${styles.color}]`);
    if (styles.fontFamily) classes.push(`font-[${styles.fontFamily}]`);
    if (styles.fontSize) classes.push(`text-[${styles.fontSize}]`);
    if (styles.fontWeight) classes.push(`font-[${styles.fontWeight}]`);

    return classes.join(' ');
  }
}

export default NextJSComponentGenerator;