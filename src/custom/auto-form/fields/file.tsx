import { Trash2 } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/components/form';
import { Input } from '@repo/ayasofyazilim-ui/components/input';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { Skeleton } from '@repo/ayasofyazilim-ui/components/skeleton';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';

export default function AutoFormFile({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
  field,
}: AutoFormInputComponentProps) {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const _file = e.target.files?.[0];

    if (_file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
        setFileName(_file.name);
        field.onChange(reader.result as string);
      };
      reader.readAsDataURL(_file);
    }
  };

  const handleRemoveClick = () => {
    setFile(null);
  };
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
    <FormItem className={fieldProps.containerClassName}>
      {showLabel && <AutoFormLabel label={label} isRequired={isRequired} />}
      {!file && (
        <FormControl>
          <Input type="file" {...params} onChange={handleFileChange} value="" />
        </FormControl>
      )}
      {file && (
        <div className="flex h-10 w-full flex-row items-center justify-between space-x-2 rounded-sm border p-2 text-black focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white dark:text-black dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0">
          <p>{fileName}</p>
          <button
            type="button"
            onClick={handleRemoveClick}
            aria-label="Remove image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
