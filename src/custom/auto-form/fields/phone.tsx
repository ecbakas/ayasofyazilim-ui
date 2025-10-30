'use client';

import { PhoneInput } from 'react-international-phone';
import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/components/form';
import 'react-international-phone/style.css';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';
import { Skeleton } from '@repo/ayasofyazilim-ui/components/skeleton';

export default function AutoFormPhone({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
  field,
}: AutoFormInputComponentProps) {
  const defaultCountryCode =
    (typeof window !== 'undefined' && localStorage.getItem('countryCode2')) ||
    'gb';
  const { showLabel: _showLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
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
    <div
      className={cn(
        'flex flex-row items-center space-x-2',
        fieldProps.containerClassName
      )}
    >
      <FormItem className="flex w-full flex-col justify-start">
        {showLabel && <AutoFormLabel label={label} isRequired={isRequired} />}
        <FormControl>
          <PhoneInput
            defaultCountry={defaultCountryCode}
            value={field.value}
            onChange={field.onChange}
            inputClassName={cn('flex-1', fieldProps.className)}
            countrySelectorStyleProps={{ flagClassName: 'rounded-md pl-0.5' }}
          />
        </FormControl>
        <AutoFormTooltip fieldConfigItem={fieldConfigItem} />

        <FormMessage />
      </FormItem>
    </div>
  );
}
