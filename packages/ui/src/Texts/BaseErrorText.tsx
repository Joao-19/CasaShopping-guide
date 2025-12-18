import React from 'react';
import { cn } from '../lib/utils';

interface BaseErrorTextProps {
  errorMessage: string | null;
}

const BaseErrorText: React.FC<BaseErrorTextProps> = ({ errorMessage }) => {
  return (
    <div className="min-h-[1.4rem] max-h-[1rem] w-full text-left overflow-hidden">
      <p
        className={cn(
          "transition-all duration-300 ease-out m-0 p-0 text-xs font-medium",
          "text-red-500",
          errorMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}
      >
        {errorMessage || ""}
      </p>
    </div>
  );
};

export default BaseErrorText;