import { Checkbox } from '@repo/ayasofyazilim-ui/ui/components/checkbox';
import { FormControl, FormItem } from '@repo/ayasofyazilim-ui/ui/components/form';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import AutoFormLabel from '../common/label';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/ui/components/skeleton';

export default function AutoFormCheckbox({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
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
    <>
      <FormItem>
        <div
          className={cn(
            'mb-3 flex items-center gap-3',
            fieldConfigItem.containerClassName
          )}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              {...params}
            />
          </FormControl>
          <AutoFormLabel label={label} isRequired={isRequired} />
        </div>
      </FormItem>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
    </>
  );
}
