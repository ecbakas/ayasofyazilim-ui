'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export type sheetProps = {
  children?: JSX.Element;
  className?: string;
  description?: string;
  onOpenChange?: (e: boolean) => void;
  open?: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
  title?: string;
  trigger?: string | JSX.Element;
};

export default function SheetSide(props: sheetProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger && (
        <SheetTrigger className={props.className}>{props.trigger}</SheetTrigger>
      )}
      <SheetContent side={props.position} className="h-full">
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
          <SheetDescription>{props.description}</SheetDescription>
        </SheetHeader>
        {props.children}
      </SheetContent>
    </Sheet>
  );
}
