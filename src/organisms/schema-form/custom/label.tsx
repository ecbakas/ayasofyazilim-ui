import { Asterisk, InfoIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function FieldLabel({
  id,
  className,
  required,
  label,
  description,
}: {
  label: string | undefined;
  id: string | undefined;
  className?: string;
  required?: boolean;
  description?: string | undefined;
}) {
  if (!label) return null;
  return (
    <Label
      htmlFor={id}
      className={cn('flex items-center text-slate-600', className)}
    >
      {beautifyLabel(label)}
      {required ? <Asterisk className="size-3 text-destructive mb-1" /> : null}
      {description && description.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="size-4 ml-1 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Label>
  );
}

export function beautifyLabel(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return ''; // Handle null, undefined, or non-string inputs
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .replace(/[-_]/g, ' ') // Replace underscores and hyphens with spaces
    .split(/\s+/) // Split by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' ');
}
