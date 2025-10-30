import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';

export enum DependencyType {
  DISABLES = 'DISABLES',
  HIDES = 'HIDES',
  REQUIRES = 'REQUIRES',
  SETS_OPTIONS = 'SETS_OPTIONS',
}

export type FieldConfigItem = CommonFieldConfigItem &
  (BaseFieldConfigItem | SelectFieldConfigItem);
export type SelectFieldConfigItem = {
  fieldType: 'select';
  labels: string[];
};
export type BaseFieldConfigItem = {
  fieldType?:
    | 'checkbox'
    | 'date'
    | 'radio'
    | 'switch'
    | 'textarea'
    | 'number'
    | 'file'
    | 'fallback'
    | 'password'
    | 'phone'
    | React.FC<AutoFormInputComponentProps>;
};

export type CommonFieldConfigItem = {
  className?: string;
  containerClassName?: string;
  description?: React.ReactNode;
  displayName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    showLabel?: boolean;
  };
  isLoading?: boolean;

  order?: number;
  renderParent?: (props: any) => React.ReactElement | null;
  renderer?: (props: AutoFormInputComponentProps) => React.ReactElement | null;
  withoutBorder?: boolean;
};

export type FieldConfig<SchemaType extends z.infer<z.ZodObject<any, any>>> = {
  // If SchemaType.key is an object, create a nested FieldConfig, otherwise FieldConfigItem
  [Key in keyof SchemaType]?: SchemaType[Key] extends object
    ? FieldConfig<z.infer<SchemaType[Key]>> &
        (BaseFieldConfig | ArrayFieldConfig)
    : FieldConfigItem;
};

type BaseFieldConfig = {
  type?: 'base';
};

type ArrayFieldConfig = {
  arrayConfig?: {
    add?: string | React.ReactNode;
    canAdd?: boolean;
    classNames?: {
      accordion?: string;
      accordionContent?: string;
      accordionItem?: string;
      accordionTrigger?: string;
      fieldContainer?: string;
    };
  };
  type: 'array';
};

export type BaseDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  {
    hasParentField?: boolean;
    sourceField: keyof SchemaType;
    targetField: keyof SchemaType;
    type: DependencyType;
    when: (sourceFieldValue: any, targetFieldValue: any) => boolean;
  };

export type ValueDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  BaseDependency<SchemaType> & {
    type:
      | DependencyType.DISABLES
      | DependencyType.REQUIRES
      | DependencyType.HIDES;
  };

export type EnumValues = readonly [string, ...string[]];

export type OptionsDependency<
  SchemaType extends z.infer<z.ZodObject<any, any>>,
> = BaseDependency<SchemaType> & {
  // Partial array of values from sourceField that will trigger the dependency
  options: EnumValues;

  type: DependencyType.SETS_OPTIONS;
};

export type Dependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
  | ValueDependency<SchemaType>
  | OptionsDependency<SchemaType>;

/**
 * A FormInput component can handle a specific Zod type (e.g. "ZodBoolean")
 */
export type AutoFormInputComponentProps = {
  className?: string;
  containerClassName?: string;
  field: ControllerRenderProps<FieldValues, any>;
  fieldConfigItem: FieldConfigItem;
  fieldProps: any;
  isLoading?: boolean;
  isRequired: boolean;
  label: string;
  zodInputProps: React.InputHTMLAttributes<HTMLInputElement>;
  zodItem: z.ZodAny;
};
