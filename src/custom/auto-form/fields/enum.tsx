import * as z from 'zod';
import { useEffect, useState } from 'react';
import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ayasofyazilim-ui/components/select';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { getBaseSchema } from '../utils';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/components/skeleton';

export default function AutoFormEnum({
  label,
  isRequired,
  field,
  fieldConfigItem,
  zodItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const [enabled, setEnabled] = useState(false);
  const baseValues = (getBaseSchema(zodItem) as unknown as z.ZodEnum<any>)._def
    .values;

  let values: [string, string][] = [];
  if (!Array.isArray(baseValues)) {
    values = Object.entries(baseValues);
  } else {
    values = baseValues.map((value) => [value, value]);
  }
  if (fieldConfigItem.fieldType === 'select' && fieldConfigItem.labels) {
    values = values.map((item, index) => {
      const _tempItem = item;
      _tempItem[1] = fieldConfigItem.labels[index] || item[1];
      return _tempItem;
    });
  }

  const findItem = (value: any) => values.find((item) => item[0] === value);
  useEffect(() => {
    setTimeout(() => {
      setEnabled(true);
    }, 1000);
  }, []);
  const params = fieldProps;
  delete params.containerClassName;
  delete params.isLoading;
  if (fieldProps.isLoading)
    return (
      <div
        className={cn(
          'flex w-full flex-col justify-start space-y-2',
          fieldProps.containerClassName
        )}
      >
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-full h-9" />
      </div>
    );
  return (
    <FormItem className={fieldProps.containerClassName}>
      <AutoFormLabel label={label} isRequired={isRequired} />
      <FormControl>
        <Select
          onValueChange={enabled ? field.onChange : undefined}
          defaultValue={field.value}
          {...params}
        >
          <SelectTrigger className={fieldProps.className}>
            <SelectValue placeholder={fieldConfigItem.inputProps?.placeholder}>
              {field.value ? findItem(field.value)?.[1] : 'Select an option'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {values.map(([value, _label]) => (
              <SelectItem value={value || _label} key={value}>
                {_label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
