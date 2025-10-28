import React from 'react';
import { DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { FieldConfig } from './types';
import { FieldConfigType } from '.';

// TODO: This should support recursive ZodEffects but TypeScript doesn't allow circular type definitions.
export type ZodObjectOrWrapped =
  | z.ZodObject<any, any>
  | z.ZodEffects<z.ZodObject<any, any>>;

/**
 * Beautify a camelCase string.
 * e.g. "myString" -> "My String"
 */
export function beautifyObjectName(string: string) {
  // if numbers only return the string
  let output = string.replace(/([A-Z])/g, ' $1');
  output = output.charAt(0).toUpperCase() + output.slice(1);
  return output;
}

/**
 * Get the lowest level Zod type.
 * This will unpack optionals, refinements, etc.
 */
export function getBaseSchema<
  ChildType extends z.ZodAny | z.AnyZodObject = z.ZodAny,
>(schema: ChildType | z.ZodEffects<ChildType>): ChildType | null {
  if (!schema) return null;
  if ('innerType' in schema._def) {
    return getBaseSchema(schema._def.innerType as ChildType);
  }
  if ('schema' in schema._def) {
    return getBaseSchema(schema._def.schema as ChildType);
  }

  return schema as ChildType;
}

/**
 * Get the type name of the lowest level Zod type.
 * This will unpack optionals, refinements, etc.
 */
export function getBaseType(schema: z.ZodAny): string {
  const baseSchema = getBaseSchema(schema);
  return baseSchema ? baseSchema._def.typeName : '';
}

/**
 * Search for a "ZodDefult" in the Zod stack and return its value.
 */
export function getDefaultValueInZodStack(schema: z.ZodAny): any {
  const typedSchema = schema as unknown as z.ZodDefault<
    z.ZodNumber | z.ZodString | z.ZodBoolean | z.ZodOptional<z.ZodAny>
  >;
  if (typedSchema._def.typeName === 'ZodDefault') {
    return typedSchema._def.defaultValue();
  }
  if (typedSchema._def.typeName === 'ZodBoolean') {
    return false;
  }
  if ('innerType' in typedSchema._def) {
    return getDefaultValueInZodStack(
      typedSchema._def.innerType as unknown as z.ZodAny
    );
  }
  if ('schema' in typedSchema._def) {
    return getDefaultValueInZodStack(
      (typedSchema._def as any).schema as z.ZodAny
    );
  }

  return undefined;
}

/**
 * Get all default values from a Zod schema.
 */
export function getDefaultValues<Schema extends z.ZodObject<any, any>>(
  schema: Schema,
  fieldConfig?: FieldConfig<z.infer<Schema>>
) {
  if (!schema) return null;
  const { shape } = schema;
  type DefaultValuesType = DefaultValues<Partial<z.infer<Schema>>>;
  const defaultValues = {} as DefaultValuesType;
  if (!shape) return defaultValues;

  for (const key of Object.keys(shape)) {
    const item = shape[key] as z.ZodAny;
    if (getBaseType(item) === 'ZodObject') {
      const defaultItems = getDefaultValues(
        getBaseSchema(item) as unknown as z.ZodObject<any, any>,
        fieldConfig?.[key] as FieldConfig<z.infer<Schema>>
      );

      if (defaultItems !== null) {
        for (const defaultItemKey of Object.keys(defaultItems)) {
          const pathKey = `${key}.${defaultItemKey}` as keyof DefaultValuesType;
          defaultValues[pathKey] = defaultItems[defaultItemKey];
        }
      }
    } else {
      let defaultValue = getDefaultValueInZodStack(item);
      if (
        (defaultValue === null || defaultValue === '') &&
        fieldConfig?.[key]?.inputProps
      ) {
        defaultValue = (fieldConfig?.[key]?.inputProps as unknown as any)
          .defaultValue;
      }
      if (defaultValue !== undefined) {
        defaultValues[key as keyof DefaultValuesType] = defaultValue;
      }
    }
  }

  return defaultValues;
}

export function getObjectFormSchema(
  schema: ZodObjectOrWrapped
): z.ZodObject<any, any> {
  if (schema?._def.typeName === 'ZodEffects') {
    const typedSchema = schema as z.ZodEffects<z.ZodObject<any, any>>;
    return getObjectFormSchema(typedSchema._def.schema);
  }
  return schema as z.ZodObject<any, any>;
}

/**
 * Convert a Zod schema to HTML input props to give direct feedback to the user.
 * Once submitted, the schema will be validated completely.
 */
export function zodToHtmlInputProps(
  schema:
    | z.ZodNumber
    | z.ZodString
    | z.ZodOptional<z.ZodNumber | z.ZodString>
    | any
): React.InputHTMLAttributes<HTMLInputElement> {
  if (['ZodOptional', 'ZodNullable'].includes(schema._def.typeName)) {
    const typedSchema = schema as z.ZodOptional<z.ZodNumber | z.ZodString>;
    return {
      ...zodToHtmlInputProps(typedSchema._def.innerType),
      required: false,
    };
  }
  const typedSchema = schema as z.ZodNumber | z.ZodString;

  if (!('checks' in typedSchema._def))
    return {
      required: true,
    };

  const { checks } = typedSchema._def;
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    required: true,
  };
  const type = getBaseType(schema);

  for (const check of checks) {
    if (check.kind === 'min') {
      if (type === 'ZodString') {
        inputProps.minLength = check.value;
      } else {
        inputProps.min = check.value;
      }
    }
    if (check.kind === 'max') {
      if (type === 'ZodString') {
        inputProps.maxLength = check.value;
      } else {
        inputProps.max = check.value;
      }
    }
  }

  return inputProps;
}

export interface JsonSchema {
  additionalProperties?: boolean;
  default?: any;
  description?: string | undefined;
  displayName: string;
  enum?: any;
  format?: 'date-time' | 'email' | 'uuid';
  isReadOnly?: boolean;
  isRequired?: boolean;
  items?: SchemaType;
  maxLength?: number;
  minLength?: number;
  nullable?: boolean;
  pattern?: RegExp;
  properties?: Record<string, JsonSchema>;
  refine?: { callback: (_value: any) => boolean; params?: object };
  type:
    | 'string'
    | 'boolean'
    | 'object'
    | 'integer'
    | 'number'
    | 'array'
    | 'toggle'
    | 'select'
    | 'phone';
}
// group
export interface SchemaType {
  additionalProperties?: boolean | {};
  displayName?: string;
  items?: SchemaType;
  properties?: Record<string, JsonSchema | SchemaType>;
  required?: readonly string[];
  type: string;
}

export const isJsonSchema = (object: any): object is JsonSchema =>
  'type' in object;
export const isSchemaType = (object: any): object is SchemaType =>
  'required' in object;

export type CreateFieldConfigWithResourceProps = {
  extend?: FieldConfig<z.infer<ZodObjectOrWrapped>>;
  name?: string;
  resources: Record<string, any>;
  schema: SchemaType;
};
/**
 * Creates a field configuration with resource management.
 *
 * @param {CreateFieldConfigWithResourceProps} params - The parameters for creating the field configuration.
 * @param {Record<string, any>} params.resources - A record of resources to be used within the field configuration.
 * @param {SchemaType} params.schema - The schema defining the structure and validation of the field.
 * @param {FieldConfig<z.infer<ZodObjectOrWrapped>>} [params.extend] - An optional field configuration to merge with result of this function.
 * @param {string} [params.name='Form'] - An optional name for the field; defaults to 'Form'.
 *
 * @returns {FieldConfig<z.infer<ZodObjectOrWrapped>>} The created field configuration.
 */
export function createFieldConfigWithResource({
  resources,
  schema,
  extend,
  name = 'Form',
}: CreateFieldConfigWithResourceProps): FieldConfig<
  z.infer<ZodObjectOrWrapped>
> {
  const fieldConfig = fieldConfigFromSchema({
    object: schema,
    resources,
    name,
    constantKey: name,
  });
  if (extend) {
    return mergeFieldConfigs(fieldConfig[name], extend);
  }
  return fieldConfig[name];
}

export function createFieldTypeFieldConfig({
  elements,
  fieldType,
}: {
  elements: string[];
  fieldType: string;
}): FieldConfigType {
  const fieldConfig = {};
  for (const element of elements) {
    Object.assign(fieldConfig, { [element]: { fieldType } });
  }
  return filterUndefinedAndEmpty(fieldConfig);
}
export function createReadonlyFieldConfig(elements: string[]): FieldConfigType {
  const fieldConfig = {};
  for (const element of elements) {
    Object.assign(fieldConfig, {
      [element]: { inputProps: { disabled: true } },
    });
  }
  return filterUndefinedAndEmpty(fieldConfig);
}

type FilteredObject<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Array<any>
      ? T[K] // Keep arrays as they are
      : FilteredObject<T[K]>
    : T[K] extends undefined
      ? never
      : T[K];
};

function filterUndefinedAndEmpty<T>(obj: T): FilteredObject<T> {
  if (typeof obj !== 'object' || obj === null) {
    return obj as FilteredObject<T>;
  }

  const filtered: Partial<FilteredObject<T>> = {};

  for (const [key, value] of Object.entries(obj)) {
    const filteredValue = filterUndefinedAndEmpty(value);
    // Check if the value is not undefined and not an empty object
    if (
      filteredValue !== undefined &&
      !(
        typeof filteredValue === 'object' &&
        Object.keys(filteredValue).length === 0
      )
    ) {
      Object.assign(filtered, { [key]: filteredValue });
    }
  }

  return filtered as FilteredObject<T>;
}

/**
 * Merges two FieldConfig objects recursively.
 * @param source - The first FieldConfig object to merge.
 * @param target - The second FieldConfig object to merge.
 * @param maxDepth - The maximum depth to merge. Defaults to Infinity.
 * @param skipKeys - An array of keys to skip during merging. Defaults to an empty array.
 * @returns A new merged FieldConfig object.
 */
export function mergeFieldConfigs(
  source: FieldConfigType,
  target: FieldConfigType,
  maxDepth: number = Infinity,
  skipKeys: string[] = []
): FieldConfigType {
  const result: FieldConfigType = { ...source }; // İlk nesneyi kopyala
  const currentDepth =
    typeof source === 'object' && typeof target === 'object' ? 1 : 0;

  for (const key of Object.keys(target)) {
    if (!skipKeys.includes(key)) {
      if (
        result[key] &&
        typeof result[key] === 'object' &&
        typeof target[key] === 'object' &&
        currentDepth < maxDepth
      ) {
        // Derinlemesine birleştir
        result[key] = mergeFieldConfigs(
          result[key] as FieldConfigType,
          target[key] as FieldConfigType,
          maxDepth,
          skipKeys
        );
      } else {
        // Değerleri birleştir

        result[key] = target[key];
      }
    }
  }

  return result;
}

export function fieldConfigFromSchema({
  name,
  object,
  resources,
  constantKey,
}: {
  constantKey: string;
  name: string;
  object: SchemaType;
  resources: Record<string, string>;
}) {
  const fieldConfig = {
    [name]: {},
  };
  // object
  if (object && object.type === 'object' && object.properties) {
    for (const property of Object.keys(object.properties)) {
      Object.assign(fieldConfig[name], {
        displayName: resources[constantKey],
        ...fieldConfigFromSchema({
          name: property,
          object: object.properties[property],
          resources,
          constantKey: `${constantKey}.${property}`,
        }),
      });
    }
  }
  // array
  else if (
    object &&
    object.type === 'array' &&
    object.items &&
    object.items.properties
  ) {
    for (const property of Object.keys(object.items.properties)) {
      Object.assign(fieldConfig[name], {
        displayName: resources[constantKey],
        ...fieldConfigFromSchema({
          name: property,
          object: object.items.properties[property],
          resources,
          constantKey: `${constantKey}.${property}`,
        }),
      });
    }
  }
  // plain
  else if (object) {
    const fieldConfigItem = {
      displayName: resources[constantKey],
    };
    // enum varsa
    if (Object.keys(object).includes('enum')) {
      const fieldRelatedKeys = Object.keys(resources).filter((key) =>
        key.includes(constantKey)
      );
      const enumKeys = fieldRelatedKeys.filter((key) => key !== constantKey);
      const labels = enumKeys.map((key) => resources[key]);
      Object.assign(fieldConfigItem, {
        fieldType: 'select',
        labels,
      });
    }

    Object.assign(fieldConfig[name], fieldConfigItem);
  }
  return fieldConfig;
}

export function sortFieldsByOrder<SchemaType extends z.ZodObject<any, any>>(
  fieldConfig: FieldConfig<z.infer<SchemaType>> | undefined,
  keys: string[]
) {
  const sortedFields = keys.sort((a, b) => {
    const fieldA: number = (fieldConfig?.[a]?.order as number) ?? 0;
    const fieldB = (fieldConfig?.[b]?.order as number) ?? 0;
    return fieldA - fieldB;
  });
  return sortedFields;
}

export function createItemName({
  fieldConfig,
  item,
  name = '',
}: {
  fieldConfig?: FieldConfigType;
  item: z.ZodAny | z.ZodArray<any> | z.ZodDefault<any>;
  name: string;
}): string {
  if (!fieldConfig)
    return item._def.description
      ? beautifyObjectName(item._def.description)
      : beautifyObjectName(name);
  return (
    (fieldConfig?.displayName as string) ||
    (fieldConfig?.[name]?.displayName as string) ||
    beautifyObjectName(name)
  );
}
