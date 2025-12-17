import React from 'react';
import { cn } from '../lib/utils';

interface BaseErrorTextProps {
  errorMessage: string | null;
}

const BaseErrorText: React.FC<BaseErrorTextProps> = ({ errorMessage }) => {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out w-full text-left text-red-500 text-sm",
        errorMessage ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <p className="p-0 m-0">{errorMessage || ""}</p>
    </div>
  );
};

export default BaseErrorText;