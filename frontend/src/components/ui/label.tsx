import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("flex items-center gap-2 text-sm font-medium leading-none text-gray-700", className)}
      {...props}
    />
  );
}

export { Label };
