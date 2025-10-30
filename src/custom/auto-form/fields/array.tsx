import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ayasofyazilim-ui/components/accordion';
import { Button } from '@repo/ayasofyazilim-ui/components/button';
import { cn } from '@repo/ayasofyazilim-ui/lib/utils';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { createItemName } from '../utils';
import AutoFormObject from './object';

const isZodArray = (
  item: z.ZodArray<any> | z.ZodDefault<any>
): item is z.ZodArray<any> => item instanceof z.ZodArray;

const isZodDefault = (
  item: z.ZodArray<any> | z.ZodDefault<any>
): item is z.ZodDefault<any> => item instanceof z.ZodDefault;

export default function AutoFormArray({
  name,
  item,
  form,
  path = [],
  fieldConfig,
}: {
  fieldConfig?: any;
  form: ReturnType<typeof useForm>;
  item: z.ZodArray<any> | z.ZodDefault<any>;
  name: string;
  path?: string[];
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  // useEffect(() => {
  //   const formvalues = form.getValues();
  //   if (JSON.stringify(formvalues) === '{}') {
  //     return;
  //   }
  //   let object = formvalues;
  //   path.forEach((key) => {
  //     if (object[key]) {
  //       object = object[key];
  //     }
  //   });
  //   append(object);
  // }, []);
  // const _title = item._def.description ?? beautifyObjectName(name);
  const title = createItemName({ fieldConfig, item, name }) ?? name;
  let itemDefType = isZodArray(item)
    ? item._def.type
    : isZodDefault(item)
      ? item._def.innerType._def.type
      : null;
  if (itemDefType === null) {
    itemDefType = (item._def as any).innerType._def.innerType.element;
  }
  // TODO ADD IF HAS VALUE OPEN BY DEFAULT
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={name}
      className={cn('group', fieldConfig?.arrayConfig?.classNames?.accordion)}
    >
      <AccordionItem
        value={name}
        className={cn(
          'border-0   [&>h3]:sticky [&>h3]:top-0 [&>h3]:z-10 ',
          fieldConfig?.arrayConfig?.classNames?.accordionItem
        )}
      >
        <AccordionTrigger
          onClick={(ev) => fields.length === 0 && ev.preventDefault()}
          className={cn(
            'flex gap-4 overflow-hidden items-center bg-white py-2 px-4 rounded-md border relative group-has-[div>div>div>*]:rounded-b-none hover:no-underline hover:[&>span]:underline hover:bg-zinc-50/50',
            fieldConfig?.arrayConfig?.classNames?.accordionTrigger,
            fields.length === 0 && '[&>svg]:hidden pr-2'
          )}
        >
          <span className="w-full text-left">{title}</span>

          {fieldConfig?.arrayConfig?.canAdd !== false && (
            <Button
              type="button"
              variant="secondary"
              onClick={(ev) => {
                ev.preventDefault();
                append({});
              }}
              className="z-10 no-underline!"
              asChild
            >
              <div>
                {fieldConfig?.add ? (
                  fieldConfig.add
                ) : (
                  <>
                    <PlusIcon className="mr-2" size={16} />
                    {title}
                  </>
                )}
              </div>
            </Button>
          )}
        </AccordionTrigger>

        <AccordionContent
          className={cn(
            'flex flex-col gap-4 has-[*]:border p-0 has-[*]:p-4 has-[*]:border-t-0 rounded-b-md',
            fieldConfig?.arrayConfig?.classNames?.accordionContent
          )}
        >
          {fields.map((_field, index) => {
            const key = _field.id;
            return (
              <div
                className={cn(
                  'flex relative',
                  fieldConfig?.arrayConfig?.classNames?.fieldContainer,
                  'pr-12'
                )}
                key={`${key}`}
              >
                <AutoFormObject
                  schema={itemDefType as z.ZodObject<any, any>}
                  form={form}
                  fieldConfig={fieldConfig}
                  path={[...path, index.toString()]}
                  className={cn('w-full', fieldConfig?.className)}
                />
                <Button
                  variant="destructive"
                  type="button"
                  size="icon"
                  className="text-destructive hover:text-white absolute right-0 top-0 h-full bg-destructive/10 rounded-l-none "
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
