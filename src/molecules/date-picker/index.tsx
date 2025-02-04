'use client';

import { parseDate, parseTime } from '@internationalized/date';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Button,
  DatePicker as DefaultDatePicker,
  Dialog,
  Group,
  Label,
  Popover,
} from 'react-aria-components';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Calendar } from './calendar-rac';
import { DateInput, TimeField } from './datefield-rac';

export function DatePicker({
  label,
  classNames,
  onChange,
  defaultValue,
  disabled = false,
  useTime = false,
  showIcon = true,
}: {
  label?: string;
  disabled?: boolean;
  classNames?: {
    dateInput?: string;
  };
  showIcon?: boolean;
  useTime?: boolean;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}) {
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const [dateValue, setDateValue] = useState(
    defaultValue &&
      parseDate(
        new Date(defaultValue.getTime() - offset).toJSON().split('T').at(0) ||
          ''
      )
  );
  const [timeValue, setTimeValue] = useState(
    defaultValue &&
      parseTime(
        new Date(defaultValue.getTime() - offset)
          .toJSON()
          .split('T')
          .at(1)
          ?.replace('Z', '') || ''
      )
  );
  useEffect(() => {
    if (!dateValue) return;
    if (onChange) {
      if (useTime && timeValue) {
        onChange(
          new Date(
            dateValue.year,
            dateValue.month - 1,
            dateValue.day,
            timeValue.hour,
            timeValue.minute,
            timeValue.second
          )
        );
      } else {
        onChange(new Date(dateValue.year, dateValue.month - 1, dateValue.day));
      }
    }
  }, [dateValue, timeValue]);
  return (
    <DefaultDatePicker
      aria-label="x"
      className="space-y-2"
      isDisabled={disabled}
      value={dateValue}
      onChange={(date) => {
        if (date) {
          setDateValue(date);
        }
      }}
    >
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div className="flex">
        <Group
          className={cn(
            'w-full flex border rounded-md h-9 pl-3 py-2 items-center gap-2 peer',
            showIcon ? 'pr-9' : 'pr-3',
            classNames?.dateInput
          )}
        >
          <DateInput unstyled className="peer-focus:ring" />
          {useTime && (
            <>
              <Separator orientation="vertical" />
              <TimeField
                value={timeValue}
                onChange={(time) => {
                  if (time) {
                    setTimeValue(time);
                  }
                }}
              >
                <DateInput unstyled className="peer-focus:ring" />
              </TimeField>
            </>
          )}
        </Group>
        {showIcon && (
          <Button className="z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70 border-none">
            <CalendarIcon size={16} strokeWidth={2} />
          </Button>
        )}
      </div>
      <Popover
        placement="bottom end"
        className="z-50 rounded-lg border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <Calendar />
        </Dialog>
      </Popover>
    </DefaultDatePicker>
  );
}
