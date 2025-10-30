import { ChevronsUpDown } from 'lucide-react';
import { CheckIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@repo/ayasofyazilim-ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/ayasofyazilim-ui/components/command';
import { FormControl, FormItem, FormMessage } from '@repo/ayasofyazilim-ui/components/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ayasofyazilim-ui/components/popover';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';
import { createItemName } from '..';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { useMediaQuery } from '@repo/ayasofyazilim-ui/hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from '@repo/ayasofyazilim-ui/components/drawer';
/**
 * CustomCombobox Component
 *
 * A customizable dropdown component for selecting items from a list,
 * featuring a search input to filter options and display the selected item.
 *
 * @param {Object} props - The props for the component.
 * @param {AutoFormInputComponentProps} props.childrenProps - Props for child components, including field props and configuration.
 * @param {string} [props.emptyValue='Please select'] - Placeholder text when no value is selected.
 * @param {Array<T> | null | undefined} props.list - List of items to display in the dropdown.
 * @param {Dispatch<SetStateAction<T | null | undefined>>} [props.onValueChange] - Callback for value changes.
 * @param {string} [props.searchPlaceholder='Search...'] - Placeholder text for the search input.
 * @param {string} [props.searchResultLabel='0 search result.'] - Text displayed when no search results are found.
 * @param {keyof T} props.selectIdentifier - The key used to identify items in the list.
 * @param {keyof T} props.selectLabel - The key used to display the item label in the dropdown.
 *
 * @template T
 * @returns {JSX.Element} The rendered CustomCombobox component.
 */

type CustomComboboxProps<T> = {
  id?: string;
  childrenProps: AutoFormInputComponentProps;
  disabled?: boolean;
  emptyValue?: string;
  list: Array<T> | null | undefined;
  onValueChange?: Dispatch<SetStateAction<T | null | undefined>>;
  searchPlaceholder?: string;
  searchResultLabel?: string;
  selectIdentifier: keyof T;
  selectLabel: keyof T;
};

export function CustomCombobox<T>({ ...props }: CustomComboboxProps<T>) {
  const {
    childrenProps,
    list,
    selectLabel,
    selectIdentifier,
    emptyValue,
    disabled,
  } = props;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { showLabel: _showLabel } = childrenProps.fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const label =
    childrenProps.label ||
    createItemName({
      item: childrenProps.zodItem,
      name: childrenProps.field.name,
    });
  const [open, setOpen] = useState(false);
  const findValue = (id: string) => {
    const value = list?.find(
      (item: T) => item[selectIdentifier]?.toString() === id
    )?.[selectLabel] as string;
    return value;
  };
  const fieldValue = findValue(childrenProps.field.value);

  const DesktopContent = (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            data-testid={`${props.id}_trigger`}
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'text-muted-foreground w-full justify-between font-normal',
              fieldValue && 'text-black',
              childrenProps.fieldProps.className
            )}
          >
            {fieldValue || emptyValue || 'Please select'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <List {...props} setOpen={setOpen} />
      </PopoverContent>
    </Popover>
  );

  const MobileContent = (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'text-muted-foreground w-full justify-between font-normal',
            fieldValue && 'text-black',
            childrenProps.fieldProps.className
          )}
        >
          {fieldValue || emptyValue || 'Please select'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <List {...props} setOpen={setOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
  return (
    <FormItem
      className={cn(
        'flex w-full flex-col justify-start',
        childrenProps.fieldProps.containerClassName
      )}
    >
      {showLabel && (
        <AutoFormLabel isRequired={childrenProps.isRequired} label={label} />
      )}
      {isDesktop ? DesktopContent : MobileContent}
      <AutoFormTooltip fieldConfigItem={childrenProps.fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

function List<T>({
  setOpen,
  ...props
}: CustomComboboxProps<T> & {
  setOpen: (open: boolean) => void;
}) {
  const {
    childrenProps,
    list,
    selectLabel,
    selectIdentifier,
    searchPlaceholder,
    searchResultLabel,
    onValueChange,
  } = props;
  return (
    <Command
      filter={(commandValue, search) => {
        const filterResult = list?.find(
          (i) =>
            i[selectIdentifier]?.toString()?.toLocaleLowerCase() ===
            commandValue.toLocaleLowerCase()
        )?.[selectLabel] as string;
        if (
          commandValue.includes(search) ||
          filterResult?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
          return 1;
        return 0;
      }}
    >
      <CommandInput
        data-testid={`${props.id}_search`}
        placeholder={searchPlaceholder || 'Search...'}
        className="h-9"
      />
      <CommandList>
        <CommandEmpty>{searchResultLabel || '0 search result.'}</CommandEmpty>
        <CommandGroup>
          {list?.map((item: T, index) => (
            <CommandItem
              data-testid={`${props.id}_item_${index}`}
              key={item[selectIdentifier]?.toString()}
              value={item[selectIdentifier]?.toString()}
              onSelect={() => {
                childrenProps.field.onChange(
                  item[selectIdentifier]?.toString() ===
                    childrenProps.field.value
                    ? undefined
                    : item[selectIdentifier]?.toString()
                );
                if (onValueChange)
                  onValueChange(
                    list.find(
                      (item: T) =>
                        item[selectIdentifier]?.toString() ===
                        childrenProps.field.value
                    )
                  );
                setOpen(false);
              }}
            >
              {item[selectLabel] as string}
              <CheckIcon
                className={cn(
                  'ml-auto h-4 w-4',
                  childrenProps.field.value ===
                    item[selectIdentifier]?.toString()
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
