import { GenericObjectType } from '@rjsf/utils';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Locale } from 'date-fns';
import * as Locales from 'date-fns/locale';
import { FilteredObject, FilterType, UiSchema } from '../types';

export * from './schema-dependency';
export * from './password-validate';
// if google-libphonenumber gives type error simply do this; pnpm add @types/google-libphonenumber

/**
 * Validates a phone number format.
 *
 * @param {string} phoneNumber - The phone number string to be validated.
 * @returns {boolean} - Returns true if the phone number is valid; otherwise, false.
 */
export const isPhoneValid = (phoneNumber: string): boolean => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance(); // Get instance of phone number utility
    const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber); // Parse the phone number

    return phoneUtil.isValidNumber(parsedNumber); // Check if the parsed number is valid
  } catch {
    return false; // Return false in case of any error during parsing
  }
};

/**
 * Splits a phone number into its components: country code, area code, and local number.
 *
 * @param {string} phoneNumber - The phone number string to be split.
 * @returns {object} - An object containing the country code, area code, and local number.
 */
export const splitPhone = (phoneNumber: string) => {
  const phoneUtil = PhoneNumberUtil.getInstance(); // Get instance of phone number utility
  const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber); // Parse the phone number
  const formattedNumber = phoneUtil.formatOutOfCountryCallingNumber(parsedNumber).split('+')[1]!; // Format the number and split to get the relevant part
  const ituCountryCode = formattedNumber.split(' ')[0]!; // Extract the ITU country code
  const phoneNumberWithoutCountryCode = formattedNumber.substring(
    ituCountryCode.length + 1
  );

  const areaCode = phoneNumberWithoutCountryCode.includes('-')
    ? phoneNumberWithoutCountryCode.split('-')[0] // Extract area code if present
    : phoneNumberWithoutCountryCode.split(' ')[0];

  const phoneData = {
    ituCountryCode,
    areaCode,
    localNumber: phoneNumberWithoutCountryCode
      .substring(areaCode!.length + 1)
      .replaceAll(' ', '')
      .replaceAll('-', ''), // Clean local number
  };

  return phoneData; // Return the extracted phone data
};

/**
 * Transforms a generic schema by removing specified fields.
 *
 * @param {GenericObjectType} inputSchema - The schema to be transformed.
 * @param {string[]} fieldsToRemove - The fields to be removed from the schema.
 * @param {string} newFieldName - The name of the new field to be added.
 * @param {string[]} requiredFields - The fields that are required in the new object.
 * @returns {GenericObjectType} - The transformed schema.
 */
export function removeFieldsfromGenericSchema(
  inputSchema: GenericObjectType,
  fieldsToRemove: string[]
): GenericObjectType {
  if (inputSchema.type === 'object' && inputSchema.properties) {
    const schemaProperties = inputSchema.properties;

    // Use `Object.keys()` instead of `for..in`
    Object.keys(schemaProperties).forEach((propertyKey) => {
      if (schemaProperties[propertyKey].type === 'object') {
        schemaProperties[propertyKey] = removeFieldsfromGenericSchema(
          schemaProperties[propertyKey],
          fieldsToRemove
        );
      } else if (
        schemaProperties[propertyKey].type === 'array' &&
        schemaProperties[propertyKey].items
      ) {
        schemaProperties[propertyKey].items = removeFieldsfromGenericSchema(
          schemaProperties[propertyKey].items,
          fieldsToRemove
        );
      }
    });

    const shouldTransform = fieldsToRemove.every((field) =>
      Object.prototype.hasOwnProperty.call(schemaProperties, field)
    );
    if (shouldTransform) {
      const transformedSchema = {
        ...inputSchema,
      };
      // Remove specified fields
      fieldsToRemove.forEach((field) => {
        delete transformedSchema.properties[field];
      });
      return transformedSchema;
    }
  }
  return inputSchema;
}

/**
 * Transforms a generic schema by removing specified fields and adding a new field.
 *
 * @param {GenericObjectType} inputSchema - The schema to be transformed.
 * @param {string[]} fieldsToRemove - The fields to be removed from the schema.
 * @param {string} newFieldName - The name of the new field to be added.
 * @param {string[]} requiredFields - The fields that are required in the new object.
 * @returns {GenericObjectType} - The transformed schema.
 */
export function transformGenericSchema(
  inputSchema: GenericObjectType,
  fieldsToRemove: string[],
  newFieldName: string,
  requiredFields: string[]
): GenericObjectType {
  if (inputSchema.type === 'object' && inputSchema.properties) {
    const schemaProperties = inputSchema.properties;

    // Use `Object.keys()` instead of `for..in`
    Object.keys(schemaProperties).forEach((propertyKey) => {
      if (schemaProperties[propertyKey].type === 'object') {
        schemaProperties[propertyKey] = transformGenericSchema(
          schemaProperties[propertyKey],
          fieldsToRemove,
          newFieldName,
          requiredFields
        );
      } else if (
        schemaProperties[propertyKey].type === 'array' &&
        schemaProperties[propertyKey].items
      ) {
        schemaProperties[propertyKey].items = transformGenericSchema(
          schemaProperties[propertyKey].items,
          fieldsToRemove,
          newFieldName,
          requiredFields
        );
      }
    });

    const shouldTransform = fieldsToRemove.every((field) =>
      Object.prototype.hasOwnProperty.call(schemaProperties, field)
    );

    if (shouldTransform) {
      if (!(newFieldName in schemaProperties)) {
        // Create a new variable to avoid assigning directly to `inputSchema`
        const updatedRequired = inputSchema.required?.filter(
          (requiredItem: string) => !fieldsToRemove.includes(requiredItem)
        );

        const newFieldProperties = {
          type: 'object',
          required: requiredFields,
          properties: requiredFields.reduce((acc, field) => {
            acc[field] = schemaProperties[field];
            return acc;
          }, {} as GenericObjectType),
        };

        // Create a new schema object instead of modifying `inputSchema`
        const transformedSchema = {
          ...inputSchema,
          required: updatedRequired,
          properties: {
            ...schemaProperties,
            [newFieldName]: newFieldProperties,
          },
        };

        // Remove specified fields
        fieldsToRemove.forEach((field) => {
          delete transformedSchema.properties[field];
        });

        return transformedSchema;
      }
    }
  }

  return inputSchema;
}

/**
 * Flattens the given data by extracting specified fields from a nested object.
 *
 * @param {GenericObjectType} inputData - The initial data to be transformed.
 * @param {string} targetKey - The name of the key to be transformed.
 * @param {string[]} fieldsToExtract - The fields to be extracted from the flattened object.
 * @returns {GenericObjectType} - The transformed object.
 */
export function flattenGenericData(
  inputData: GenericObjectType,
  targetKey: string,
  fieldsToExtract: string[]
): GenericObjectType {
  const transformObject = (obj: GenericObjectType): GenericObjectType => {
    if (Array.isArray(obj)) {
      return obj.map(transformObject); // Apply transformation for arrays
    }

    const transformedObject: GenericObjectType = { ...obj }; // Create a copy of the original object

    for (const key in Object.keys(transformedObject)) {
      if (typeof transformedObject[key] !== 'undefined') {
        // Is the key valid?
        if (key === targetKey && typeof transformedObject[key] === 'object') {
          // Extract specified fields
          const extractedFields = fieldsToExtract.reduce(
            (accumulator, field) => {
              if (transformedObject[key][field] !== undefined) {
                accumulator[field] = transformedObject[key][field];
              }
              return accumulator;
            },
            {} as GenericObjectType
          );

          // Create the new object
          Object.assign(transformedObject, extractedFields);
          delete transformedObject[key]; // Remove the old key
          return transformedObject; // Return the transformed object
        }

        // If the value is an object, apply recursive transformation
        if (
          typeof transformedObject[key] === 'object' &&
          transformedObject[key] !== null
        ) {
          transformedObject[key] = transformObject(transformedObject[key]);
        }
      }
    }
    return transformedObject; // Return the transformed object
  };

  return transformObject(inputData); // Pass the initial data to the transformation function
}

/**
 * Generates a UI schema based on the provided schema by modifying
 * specific keys with given properties.
 *
 * @param {T} schema - The input schema of a generic type T, which contains the structure to traverse.
 * @param {string} targetKey - The specific key within the schema that will be modified.
 * @param {GenericObjectType} properties - An object containing the properties to be assigned to the target key.
 * @returns {GenericObjectType} - Returns a new object representing the UI schema with modifications applied.
 */
export function generateUiSchema<T extends GenericObjectType>(
  schema: T,
  key: string,
  prop: GenericObjectType
): GenericObjectType {
  const result: GenericObjectType = {};

  const traverse = (obj: T, res: GenericObjectType) => {
    for (const k in obj) {
      if (k === key) {
        res[k] = { ...prop };
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        if (obj[k].items) {
          res[k] = {
            items: {},
          };
          traverse(obj[k].items as T, res[k].items);
        } else {
          traverse(obj[k] as T, res); // Sadece iç yapıları kontrol et
        }
      }
    }
  };

  traverse(schema, result);
  return result;
}

/**
 * Checks if the given value is an object.
 * @param value - The value to check.
 * @returns True if the value is an object; otherwise, false.
 */
export const isObject = (value: any): value is GenericObjectType =>
  value && typeof value === 'object' && !Array.isArray(value);

/**
 * Merges two UISchema objects recursively.
 * @param source - The first UISchema object to merge.
 * @param target - The second UISchema object to merge.
 * @returns A new merged UISchema object.
 */
export function mergeUISchemaObjects<
  T extends UiSchema<T>,
  U extends UiSchema<T>,
>(source: T, target: U): T & U {
  const mergedResult: UiSchema<T> = { ...source }; // Copy the source UISchema object
  for (const key of Object.keys(target)) {
    // If both keys are objects, merge them recursively
    if (isObject(mergedResult[key]) && isObject(target[key])) {
      mergedResult[key] = mergeUISchemaObjects(mergedResult[key], target[key]);
    } else {
      // If there is no conflict or the value is not an object, take the value from the target
      mergedResult[key] = target[key];
    }
  }

  return mergedResult as T & U; // Return the merged result
}

export function generateFormData(
  formData: GenericObjectType,
  fieldsToMerge: string[],
  newFieldName: string
) {
  const _formData = { ...formData };
  const c = {
    [newFieldName]: {},
  };
  for (const field of Object.keys(_formData)) {
    if (typeof _formData[field] === 'object') {
      // object
      if (Array.isArray(_formData[field])) {
        // array
      }
    }
    if (fieldsToMerge.includes(field)) {
      Object.assign(c?.[newFieldName] || {}, {
        [field]: _formData[field],
      });
      delete _formData[field];
      // remove
    }
  }
  // field
  return {
    ..._formData,
    ...c,
  };
}

export function hasPhoneFields(form: any) {
  if (!form) return false;
  return true;
}

export type CreateSchemaWithFilters<T> = {
  filter: FilterType<T>;
  name?: string;
  schema: GenericObjectType;
};
/**
 * Updates the schema according to the specified filter.
 *
 * @param {Object} params - Function parameters.
 * @param {GenericObjectType} params.schema - The schema to be updated.
 * @param {FilterType} params.filter - Filter details (include, exclude, etc.).
 * @returns {GenericObjectType} - The filtered schema.
 */
export function createSchemaWithFilters<T = string>({
  schema,
  filter,
}: {
  filter: FilterType<T>;
  schema: GenericObjectType;
}): GenericObjectType {
  const { keys, type } = filter;

  // Deep copy to preserve type
  const modifiedSchema = structuredClone(schema);

  /**
   * Recursive function to filter properties.
   *
   * @param {GenericObjectType} currentObj - The current schema object.
   * @param {string} [parentKey=''] - The parent key path of the current object.
   */

  const filterProperties = (
    object: GenericObjectType,
    parentKey: string = ''
  ) => {
    const currentObj = object;
    if (!currentObj.properties && !currentObj.items) return;
    const keptKeys = new Set<string>();
    const hasKey = (key: T | string) => {
      if (keys.find((k) => k === key)) return true;
      return false;
    };
    const isWildCard = (key: T | string) => {
      if (keys.find((k) => k === `*${key}`)) return true;
      return false;
    };
    // Filtering for properties
    if (currentObj.properties) {
      Object.keys(currentObj.properties).forEach((key) => {
        const property = currentObj.properties[key];
        const currentPath = parentKey ? `${parentKey}.${key}` : key;
        if (type === 'include') {
          if (isWildCard(currentPath)) return;
          if (hasKey(currentPath)) {
            keptKeys.add(key);
            if (property.type === 'object') {
              filterProperties(property, currentPath);
            } else if (property.type === 'array') {
              filterProperties(property.items, currentPath);
            }
          } else {
            delete currentObj.properties[key];
          }
        } else if (type === 'exclude') {
          if (!hasKey(currentPath)) {
            keptKeys.add(key);
            if (property.type === 'object') {
              filterProperties(property, currentPath);
            } else if (property.type === 'array') {
              filterProperties(property.items, currentPath);
            }
          } else {
            delete currentObj.properties[key];
          }
        } else if (type === 'fullExclude') {
          if (hasKey(currentPath)) {
            delete currentObj.properties[key];
          } else if (property.type === 'object') {
            filterProperties(property, currentPath);
          } else if (property.type === 'array') {
            filterProperties(property.items, currentPath);
          }
        }
      });
      if (filter.type !== 'fullExclude' && filter.sort) {
        const sortedProperties = Object.entries(currentObj.properties).sort(
          ([keyA], [keyB]) => {
            const indexA = keys.indexOf(
              parentKey
                ? (`${parentKey}.${keyA}` as keyof T)
                : (keyA as keyof T)
            );
            const indexB = keys.indexOf(
              parentKey
                ? (`${parentKey}.${keyB}` as keyof T)
                : (keyB as keyof T)
            );
            return indexA - indexB;
          }
        );
        // Update currentObj.properties with sorted properties
        currentObj.properties = Object.fromEntries(sortedProperties);
      }
    }

    // Update the required fields
    currentObj.required =
      currentObj.required?.filter((req: string) => keptKeys.has(req)) ||
      undefined;
  };

  // Start filtering from the root schema
  filterProperties(modifiedSchema);

  return modifiedSchema;
}

export type CreateFieldConfigWithResourceProps = {
  extend?: GenericObjectType;
  name?: string;
  resources: GenericObjectType;
  schema: GenericObjectType;
};
/**
 * Creates a field configuration with resource management.
 *
 * @param {CreateFieldConfigWithResourceProps} params - The parameters for creating the field configuration.
 * @param {GenericObjectType} params.resources - A record of resources to be used within the field configuration.
 * @param {GenericObjectType} params.schema - The schema defining the structure and validation of the field.
 * @param {UISchemaType} [params.extend] - An optional field configuration to merge with result of this function.
 * @param {string} [params.name='Form'] - An optional name for the field; defaults to 'Form'.
 *
 * @returns {UISchemaType} The created field configuration.
 */
export function createUiSchemaWithResource<T = unknown>({
  resources,
  schema,
  extend,
  name = 'Form',
}: CreateFieldConfigWithResourceProps): UiSchema<T> {
  const uiSchema = uiSchemaFromSchema({
    object: schema,
    resources,
    name,
    constantKey: name,
  });
  if (extend) {
    return mergeUISchemaObjects(uiSchema[name] || {}, extend);
  }
  return uiSchema[name] || {};
}

export function uiSchemaFromSchema({
  name,
  object,
  resources,
  constantKey,
}: {
  constantKey: string;
  name: string;
  object: GenericObjectType;
  resources: Record<string, string>;
}) {
  const uiSchema = {
    [name]: {},
  };
  // object
  if (object && object.type === 'object' && object.properties) {
    for (const property of Object.keys(object.properties)) {
      Object.assign(uiSchema[name] || {}, {
        'ui:title': resources[constantKey],
        ...uiSchemaFromSchema({
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
    const items = {};
    for (const property of Object.keys(object.items.properties)) {
      Object.assign(
        items,
        uiSchemaFromSchema({
          name: property,
          object: object.items.properties[property],
          resources,
          constantKey: `${constantKey}.${property}`,
        })
      );
    }
    Object.assign(uiSchema[name] || {}, {
      'ui:title': resources[constantKey] || beautifyLabel(name),
      items,
    });
  }
  // plain
  else if (object) {
    const getResourceValue = (name: string) =>
      resources[`${constantKey}.${name}`] || undefined;
    const uiSchemaItem = {
      'ui:title': resources[constantKey] || beautifyLabel(name),
      'ui:placeholder': getResourceValue('ui:placeholder'),
    };
    // enum varsa
    if (Object.keys(object).includes('enum')) {
      const labels = object.enum.map(
        (key: string) => getResourceValue(key) || key
      );
      Object.assign(uiSchemaItem, {
        'ui:enumNames': labels,
        'ui:options': {
          label: true,
          emptyValue: getResourceValue('emptyValue'),
          searchPlaceholder: getResourceValue('searchPlaceholder'),
          searchResultLabel: getResourceValue('searchResultLabel'),
        },
      });
    }

    Object.assign(uiSchema[name] || {}, uiSchemaItem);
  }
  return filterUndefinedAndEmpty(uiSchema);
}

export function filterUndefinedAndEmpty<T>(obj: T): FilteredObject<T> {
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

export function bulkCreateUiSchema<T>({
  elements,
  config,
}: {
  config: UiSchema<T>;
  elements: Array<keyof T>;
}): UiSchema<T> {
  const uiSchema = {};
  for (const element of elements) {
    Object.assign(uiSchema, { [element]: config });
  }
  return filterUndefinedAndEmpty(uiSchema);
}

/**
 * Looks up a date-fns locale from the Expo localization object.  This falls back to `en-US`
 * @param localization Expo Localization object containing the locale and region.
 * @returns date-fns locale.
 */

export function getDateFnsLocale({
  locale,
  region,
}: {
  locale: string;
  region?: string;
}): Locale {
  return (
    Locales[(locale.substring(0, 2) + region) as keyof typeof Locales] ??
    Locales[locale.substring(0, 2) as keyof typeof Locales] ??
    Locales.enUS
  );
}

export function extendFieldInGenericSchema(
  inputSchema: GenericObjectType,
  fieldToFind: string,
  newField?: object
): GenericObjectType {
  if (inputSchema.type === 'object' && inputSchema.properties) {
    const schemaProperties = inputSchema.properties;

    // Use `Object.keys()` instead of `for..in`
    Object.keys(schemaProperties).forEach((propertyKey) => {
      if (schemaProperties[propertyKey].type === 'object') {
        schemaProperties[propertyKey] = extendFieldInGenericSchema(
          schemaProperties[propertyKey],
          fieldToFind
        );
      } else if (
        schemaProperties[propertyKey].type === 'array' &&
        schemaProperties[propertyKey].items
      ) {
        schemaProperties[propertyKey].items = extendFieldInGenericSchema(
          schemaProperties[propertyKey].items,
          fieldToFind
        );
      }
    });

    const shouldTransform = Object.prototype.hasOwnProperty.call(
      schemaProperties,
      fieldToFind
    );
    if (shouldTransform) {
      const transformedSchema = {
        ...inputSchema,
        ...newField,
      };
      // Remove specified fields

      return transformedSchema;
    }
  }
  return inputSchema;
}

export function findFieldInGenericSchema(
  inputSchema: GenericObjectType,
  fieldToFind: string
): GenericObjectType {
  if (inputSchema.type === 'object' && inputSchema.properties) {
    const schemaProperties = inputSchema.properties;

    // Use `Object.keys()` instead of `for..in`
    Object.keys(schemaProperties).forEach((propertyKey) => {
      if (schemaProperties[propertyKey].type === 'object') {
        schemaProperties[propertyKey] = extendFieldInGenericSchema(
          schemaProperties[propertyKey],
          fieldToFind
        );
      } else if (
        schemaProperties[propertyKey].type === 'array' &&
        schemaProperties[propertyKey].items
      ) {
        schemaProperties[propertyKey].items = extendFieldInGenericSchema(
          schemaProperties[propertyKey].items,
          fieldToFind
        );
      }
    });

    const shouldTransform = Object.prototype.hasOwnProperty.call(
      schemaProperties,
      fieldToFind
    );
    if (shouldTransform) {
      return schemaProperties[fieldToFind];
    }
  }
  return inputSchema;
}

export function getArrayFieldKeys(schema: GenericObjectType): string[] {
  const keys: string[] = [];

  function traverse(node: GenericObjectType) {
    if (node.type === 'object' && node.properties) {
      for (const [key, value] of Object.entries(node.properties)) {
        if (
          typeof value === 'object' &&
          value !== null &&
          'type' in value &&
          (value as GenericObjectType).type === 'array'
        ) {
          keys.push(key);
          traverse((value as GenericObjectType).items); // array içinde object olabilir
        } else if (
          typeof value === 'object' &&
          value !== null &&
          'type' in value &&
          (value as GenericObjectType).type === 'object'
        ) {
          traverse(value as GenericObjectType);
        }
      }
    }
  }
  traverse(schema);
  return keys;
}

export function beautifyLabel(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return ''; // Handle null, undefined, or non-string inputs
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .replace(/[-_]/g, ' ') // Replace underscores and hyphens with spaces
    .split(/\s+/) // Split by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' ');
}
