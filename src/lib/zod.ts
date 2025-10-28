import { ZodSchema, z } from 'zod';
import { ZodObjectOrWrapped } from '../custom/auto-form/utils.js';

export { z } from 'zod';
export { zodResolver } from '@hookform/resolvers/zod';

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
  additionalProperties?: boolean;
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
export const isObject = (object: any): object is SchemaType =>
  'properties' in object;

export function createZodObject(
  schema: any,
  positions?: string[],
  convertors?: Record<string, any>,
  subPositions?: Record<string, string[]>
): ZodObjectOrWrapped {
  const zodSchema: Record<string, ZodSchema> = {};
  const tempPositions = positions || Object.keys(schema.properties);
  tempPositions.forEach((element: string) => {
    if (element === 'extraProperties') return;
    const props = schema?.properties?.[element];
    const isRequired = schema.required?.includes(element) || false;
    if (!props) throw new Error(`${element} is not found in properties.`);
    if (isObject(props)) {
      Object.keys(props.properties || {}).forEach(() => {
        zodSchema[element] = createZodObject(
          props,
          subPositions?.[element] || Object.keys(props.properties || {}),
          convertors && element in convertors ? convertors[element] : undefined
        );
      });
    } else if (isJsonSchema(props)) {
      let zodType;
      if (convertors && Object.keys(convertors).includes(element)) {
        const newProps = props;
        newProps.enum = convertors[element].data;
        if (convertors[element].type === 'enum') {
          newProps.enum = convertors[element].data;
        }
        if (convertors[element].type === 'static') {
          newProps.type = 'select';
          newProps.enum = convertors[element].data;
        }
        if (
          convertors[element].type === 'async' &&
          typeof convertors[element].data !== 'function'
        ) {
          newProps.type = 'select';
          newProps.enum = convertors[element].data.map(
            (e: any) => e[convertors[element].get]
          );
        }
        zodType = createZodType(newProps, isRequired);
      } else {
        if (
          props.items &&
          subPositions &&
          Object.keys(subPositions || {}).includes(element)
        ) {
          if (props.items?.properties) {
            for (const key of subPositions?.[element] || []) {
              delete props.items.properties[key];
            }
          }
        }
        zodType = createZodType(props, isRequired);
      }
      zodSchema[element] = zodType;
    }
  });
  return z.object(zodSchema, {
    description: schema.displayName,
  });
}
// TODO: Handle object case and add related data and example is
// $Volo_Abp_Identity_IdentityRoleCreateDto
// const formSchema = z.object({
//     name: z.string().max(256).min(0), // Assuming `name` is optional as it's not in the required list
//     isDefault: z.boolean().optional(),
//     isPublic: z.boolean().optional(),
//     extraProperties: z.object({
//         // Assuming any additional properties are of type `unknown`
//         additionalProperties: z.unknown().optional(),
//         nullable: z.boolean().optional(),
//         readOnly: z.boolean().optional()
//     }).optional().nullable()
// })
function createZodType(schema: JsonSchema, isRequired: boolean): ZodSchema {
  let zodType;
  switch (schema.type) {
    case 'string':
      zodType = z.string({ description: schema.displayName });
      if (schema.enum && Array.isArray(schema.enum)) {
        const stringEnums = schema.enum.map((e: string) => e);
        zodType = z.enum(stringEnums as [string, ...string[]]);
        break;
      }
      if (schema.format === 'email') zodType = zodType.email();
      if (schema.maxLength) zodType = zodType.max(schema.maxLength);
      if (schema.minLength) zodType = zodType.min(schema.minLength);
      if (schema.pattern) zodType = zodType.regex(RegExp(schema.pattern));
      if (schema.refine)
        zodType = zodType.refine(schema.refine.callback, schema.refine.params);
      if (schema.default) zodType = zodType.default(schema.default);
      if (schema.format === 'date-time') zodType = z.coerce.date();
      break;
    case 'select':
      zodType = z.enum(schema.enum);
      if (schema.default) zodType = zodType.default(schema.default);
      break;
    case 'boolean':
      zodType = z.boolean();
      if (schema.default) zodType = zodType.default(schema.default === 'true');
      break;
    case 'integer':
    case 'number':
      if (schema.enum) {
        const stringEnums = schema.enum.map((e: any) => e.toString());
        zodType = z.enum(stringEnums as [string, ...string[]]);
        break;
      }
      zodType = z.coerce.number();
      break;
    case 'object':
      zodType = z.object({});
      if (schema.properties) {
        zodType = createZodObject(
          schema as SchemaType,
          Object.keys(schema.properties)
        );
      }
      break;

    case 'array':
      if (schema.items?.properties) {
        zodType = z.array(
          createZodObject(schema.items, Object.keys(schema.items.properties))
        );
      } else {
        zodType = z.array(z.unknown());
      }
      break;
    default:
      zodType = z.unknown({ description: schema.displayName });
  }
  if (!isRequired) zodType = zodType.optional();
  if (schema.nullable) zodType = zodType.nullable();
  return zodType;
}
