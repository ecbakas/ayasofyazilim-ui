import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/ui/components/form';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/ui/components/skeleton';
import { PasswordInput } from '@repo/ayasofyazilim-ui/ui/custom/password-input';

export default function AutoFormPasword({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const type = fieldProps.type || 'text';
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
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-full h-9" />
      </div>
    );
  return (
    <FormItem
      className={cn(
        'flex w-full flex-col px-px justify-start',
        fieldProps.containerClassName
      )}
    >
      {showLabel && <AutoFormLabel label={label} isRequired={isRequired} />}
      <FormControl>
        <PasswordInput type={type} {...params} />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
