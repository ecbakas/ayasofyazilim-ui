'use client';

import { TypeOf } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import AutoForm, {
  AutoFormSubmit,
  ZodObjectOrWrapped,
} from '../../../organisms/auto-form';
import { TanstackTableActionsAutoformDialog } from '../types';

type TanstackTableAutoformDialogProps = {
  setDialogOpen: () => void;
} & TanstackTableActionsAutoformDialog;
export const TanstackTableTableAutoformDialog = ({
  title,
  submitText,
  onSubmit,
  schema,
  fieldConfig,
  className,
  values,
  setDialogOpen,
}: TanstackTableAutoformDialogProps) => (
  <Dialog open onOpenChange={setDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <AutoForm
        formSchema={schema}
        fieldConfig={fieldConfig}
        className={className?.autoform}
        values={values}
        onSubmit={(formData) => {
          onSubmit(formData as Partial<TypeOf<ZodObjectOrWrapped>>);
          setDialogOpen();
        }}
      >
        <AutoFormSubmit className={cn('float-right', className?.submit)}>
          {submitText}
        </AutoFormSubmit>
      </AutoForm>
    </DialogContent>
  </Dialog>
);
