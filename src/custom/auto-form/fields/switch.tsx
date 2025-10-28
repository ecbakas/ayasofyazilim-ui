import { FormControl, FormItem } from '@repo/ayasofyazilim-ui/ui/components/form';
import { Switch } from '@repo/ayasofyazilim-ui/ui/components/switch';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/ui/components/skeleton';

export default function AutoFormSwitch({
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
        <Skeleton className="w-full h-6" />
      </div>
    );
  return (
    <div>
      <FormItem>
        <div
          className={cn(
            'flex items-center gap-3',
            fieldConfigItem.containerClassName
          )}
        >
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              {...params}
            />
          </FormControl>
          <AutoFormLabel label={label} isRequired={isRequired} />
        </div>
      </FormItem>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
    </div>
  );
}
