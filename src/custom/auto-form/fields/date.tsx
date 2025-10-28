import { DatePicker } from '../../../../@/components/ui/date-picker';
import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/ui/components/form';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { Skeleton } from '@repo/ayasofyazilim-ui/ui/components/skeleton';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';

export default function AutoFormDate({
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
    <FormItem className={fieldProps.containerClassName}>
      <AutoFormLabel label={label} isRequired={isRequired} />
      <FormControl>
        <DatePicker date={field.value} setDate={field.onChange} {...params} />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
