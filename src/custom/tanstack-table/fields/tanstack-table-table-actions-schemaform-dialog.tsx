'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ayasofyazilim-ui/ui/components/dialog';
import { SchemaForm } from '@repo/ayasofyazilim-ui/ui/custom/schema-form';
import { TanstackTableActionsSchemaFormDialog } from '../types';

type TanstackTableSchemaFormDialogProps<TData> = {
  setDialogOpen: () => void;
} & TanstackTableActionsSchemaFormDialog<TData>;
export function TanstackTableTableSchemaFormDialog<TData>(
  props: TanstackTableSchemaFormDialogProps<TData>
) {
  const { title, setDialogOpen, onSubmit } = props;
  return (
    <Dialog open onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SchemaForm
          {...props}
          onSubmit={(data) => {
            onSubmit(data.formData);
            setDialogOpen();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
