'use client';

import { forwardRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface ActionButtonProps extends ButtonProps {}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("min-h-[44px]", className)}
        {...props}
      />
    );
  }
);
ActionButton.displayName = 'ActionButton';
export { ActionButton };
