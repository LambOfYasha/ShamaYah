declare module 'sanity' {
  export function defineField(field: any): any;
  export function defineType(type: any): any;
  export function defineArrayMember(member: any): any;
  export function definePlugin(plugin: any): any;
  
  // Type definitions for schema components
  export interface SchemaTypeDefinition {
    name: string;
    title: string;
    type: string;
    [key: string]: any;
  }
  
  // Validation rule interface
  export interface ValidationRule {
    required(): ValidationRule;
    min(length: number): ValidationRule;
    max(length: number): ValidationRule;
    email(): ValidationRule;
    [key: string]: any;
  }
  
  // Field options interface
  export interface FieldOptions {
    source?: string;
    maxLength?: number;
    list?: Array<{title: string, value: string}>;
    layout?: 'radio' | 'dropdown';
    [key: string]: any;
  }
  
  // Field interface
  export interface FieldDefinition {
    name: string;
    title: string;
    type: string;
    description?: string;
    validation?: (rule: ValidationRule) => ValidationRule;
    options?: FieldOptions;
    initialValue?: any;
    hidden?: boolean;
    of?: any[];
    to?: any[];
    fields?: any[];
    [key: string]: any;
  }
  
  // Preview interface
  export interface PreviewConfig {
    select: Record<string, string>;
    prepare: (selection: any) => {
      title: string;
      subtitle?: string;
      media?: any;
    };
  }
} 