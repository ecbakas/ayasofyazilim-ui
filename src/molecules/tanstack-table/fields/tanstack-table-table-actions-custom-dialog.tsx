'use client';

import { Loader } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TanstackTableActionsCustomDialog } from '../types';
import { cn } from '@/lib/utils';

type TanstackTableCustomDialogProps = {
  setDialogOpen: () => void;
} & TanstackTableActionsCustomDialog;
export function TanstackTableTableCustomDialog({
  title,
  confirmationText,
  onCancel,
  onConfirm,
  cancelText,
  content,
  setDialogOpen,
  dialogClassNames,
}: TanstackTableCustomDialogProps) {
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const handleOnConfirmClick = () => {
    startDeleteTransition(() => {
      onConfirm?.();
      setDialogOpen();
    });
  };
  const handleOnCancelClick = () => {
    startDeleteTransition(() => {
      onCancel?.();
      setDialogOpen();
    });
  };

  return (
    <Dialog open onOpenChange={setDialogOpen}>
      <DialogContent className={dialogClassNames?.content}>
        <DialogHeader className={dialogClassNames?.header}>
          <DialogTitle className={dialogClassNames?.title}>{title}</DialogTitle>
        </DialogHeader>
        {content}
        {(confirmationText || cancelText) && (
          <DialogFooter
            className={cn('gap-2 sm:space-x-0', dialogClassNames?.footer)}
          >
            {cancelText && (
              <DialogClose asChild>
                <Button variant="outline" onClick={handleOnCancelClick}>
                  {cancelText}
                </Button>
              </DialogClose>
            )}
            {confirmationText && (
              <Button
                aria-label={confirmationText}
                variant="destructive"
                onClick={handleOnConfirmClick}
                disabled={isDeletePending}
              >
                {isDeletePending && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {confirmationText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
