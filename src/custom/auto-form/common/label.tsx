import { FormLabel } from '@repo/ayasofyazilim-ui/ui/components/form';
import { cn } from '@repo/ayasofyazilim-ui/ui/lib/utils';

const AutoFormLabel = ({
  label,
  isRequired,
  className,
}: {
  className?: string;
  isRequired: boolean;
  label: string;
}) => (
  <FormLabel className={cn(className)}>
    {label}
    {isRequired && <span className="text-destructive"> *</span>}
  </FormLabel>
);

export default AutoFormLabel;
