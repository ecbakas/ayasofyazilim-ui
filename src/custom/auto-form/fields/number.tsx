import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/components/form';
import { Input } from '@repo/ayasofyazilim-ui/components/input';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/components/skeleton';

export default function AutoFormNumber({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const params = fieldPropsWithoutShowLabel;
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
        {showLabel && <Skeleton className="w-1/2 h-3" />}
        <Skeleton className="w-full h-9" />
      </div>
    );
  return (
    <FormItem
      className={cn(
        'flex w-full flex-col justify-start',
        fieldProps.containerClassName
      )}
    >
      {showLabel && <AutoFormLabel label={label} isRequired={isRequired} />}
      <FormControl>
        <Input type="number" {...params} />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
