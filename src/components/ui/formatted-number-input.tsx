'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange: (value: number) => void;
  currency?: string;
  showUnitHint?: boolean;
}

function getUnitHint(value: number | undefined): string | null {
  if (value === undefined || value === 0 || isNaN(value)) return null;
  if (value < 1000) return null;
  if (value < 10000) return `约 ${(value / 1000).toFixed(1)} 千`;
  if (value < 1000000) return `约 ${(value / 10000).toFixed(1)} 万`;
  if (value < 10000000) return `约 ${(value / 1000000).toFixed(1)} 百万`;
  if (value < 100000000) return `约 ${(value / 10000000).toFixed(1)} 千万`;
  if (value < 1000000000) return `约 ${(value / 100000000).toFixed(1)} 亿`;
  return `约 ${(value / 1000000000).toFixed(1)} 十亿`;
}

export const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ className, value, onChange, currency, showUnitHint = true, ...props }, ref) => {
    // Format number with commas
    const formatNumber = (num: number | undefined) => {
      if (num === undefined || isNaN(num)) return '';
      return new Intl.NumberFormat('en-US').format(num);
    };

    const [displayValue, setDisplayValue] = React.useState(formatNumber(value));

    // Update display value when prop value changes
    React.useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    const unitHint = showUnitHint ? getUnitHint(value) : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/,/g, '');
      
      // Allow empty string or numbers
      if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
        setDisplayValue(e.target.value);
        
        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue)) {
          onChange(numValue);
        } else {
            // Handle empty case
            onChange(0);
        }
      }
    };

    const handleBlur = () => {
      const rawValue = displayValue.replace(/,/g, '');
      const numValue = parseFloat(rawValue);
      if (!isNaN(numValue)) {
        setDisplayValue(formatNumber(numValue));
      } else {
        setDisplayValue('');
      }
    };

    return (
      <div className="relative">
        {currency && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
            {currency}
          </div>
        )}
        <Input
          ref={ref}
          type="text"
          className={cn(
            currency && "pl-12",
            unitHint && "pr-28",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {unitHint && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded">
            {unitHint}
          </div>
        )}
      </div>
    );
  }
);
FormattedNumberInput.displayName = 'FormattedNumberInput';
