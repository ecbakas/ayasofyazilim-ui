'use client';

import { WidgetProps } from '@rjsf/utils';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import { cn } from '@/lib/utils';
import 'react-international-phone/style.css';

const phoneUtil = PhoneNumberUtil.getInstance();

export const CustomPhoneField = (props: WidgetProps) => {
  const defaultCountryCode =
    (typeof window !== 'undefined' && localStorage.getItem('countryCode2')) ||
    'us';
  const { value = '', onChange, name, className } = props;
  const [inputValue, setInputValue] = useState(value || '');
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (val: string) => {
    setInputValue(val);
    try {
      const parsedNumber = phoneUtil.parseAndKeepRawInput(val, 'TR');
      if (!phoneUtil.isValidNumber(parsedNumber)) {
        setError('please enter a valid phone number.');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('please enter a valid phone number.');
    }
    onChange(val);
  };

  return (
    <>
      <PhoneInput
        name={name}
        defaultCountry={defaultCountryCode}
        value={inputValue}
        onChange={handlePhoneChange}
        inputClassName={cn('flex-1', className)}
        countrySelectorStyleProps={{ flagClassName: 'rounded-md pl-0.5' }}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </>
  );
};
