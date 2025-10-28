'use client';

import React, { ReactNode } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ayasofyazilim-ui/ui/components/button';
import { Form } from '@repo/ayasofyazilim-ui/ui/components/form';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';

import AutoFormObject from './fields/object';
import { Dependency, FieldConfig } from './types';
import {
  ZodObjectOrWrapped,
  getDefaultValues,
  getObjectFormSchema,
} from './utils';

export * from './types';
export * from './utils';
export * from './fields';

export const AutoFormSubmit = ({
  id,
  children,
  className,
  disabled,
}: {
  id?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) => (
  <Button
    data-testid={id}
    type="submit"
    disabled={disabled}
    className={className}
  >
    {children ?? 'Submit'}
  </Button>
);

export type FieldConfigType = FieldConfig<z.infer<ZodObjectOrWrapped>>;
export type DependenciesType = Array<Dependency<z.infer<ZodObjectOrWrapped>>>;
export type ValueType = Partial<z.infer<ZodObjectOrWrapped>>;
export type AutoFormProps = {
  children?: JSX.Element;
  className?: string;
  dependencies?: DependenciesType;
  fieldConfig?: FieldConfigType;
  formClassName?: string;
  formSchema: ZodObjectOrWrapped;
  isLoading?: boolean;
  onParsedValuesChange?: (values: ValueType) => void;
  onSubmit?: (values: z.infer<ZodObjectOrWrapped>) => void;
  onValuesChange?: (values: ValueType) => void;
  showInRow?: boolean;
  stickyChildren?: boolean;
  stickyChildrenClassName?: string;
  values?: ValueType;
};

function AutoForm({
  formSchema,
  values: valuesProp,
  onValuesChange: onValuesChangeProp,
  onParsedValuesChange,
  onSubmit: onSubmitProp,
  fieldConfig,
  children,
  className,
  formClassName,
  dependencies,
  showInRow,
  isLoading,
  stickyChildren,
  stickyChildrenClassName,
}: AutoFormProps) {
  const objectFormSchema = getObjectFormSchema(formSchema);
  const defaultValues: DefaultValues<z.infer<typeof objectFormSchema>> | null =
    getDefaultValues(
      objectFormSchema,
      fieldConfig as FieldConfig<z.infer<typeof objectFormSchema>>
    );

  const form = useForm<z.infer<typeof objectFormSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? undefined,
    values: valuesProp,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onSubmitProp?.(parsedValues.data);
    }
  }

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      onValuesChangeProp?.(values);
      const parsedValues = formSchema.safeParse(values);
      if (parsedValues.success) {
        onParsedValuesChange?.(parsedValues.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, formSchema, onValuesChangeProp, onParsedValuesChange]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          form.handleSubmit(onSubmit)(e);
        }}
        className={cn('space-y-5 h-full overflow-auto', formClassName)}
      >
        <AutoFormObject
          isLoading={isLoading}
          showInRow={showInRow}
          schema={objectFormSchema}
          form={form}
          dependencies={dependencies}
          fieldConfig={fieldConfig}
          className={className}
        />

        {stickyChildren ? (
          <div
            className={cn(
              'sticky bottom-0 flex w-full items-center justify-end bg-white p-2 pr-0',
              stickyChildrenClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </form>
    </Form>
  );
}

export default AutoForm;
