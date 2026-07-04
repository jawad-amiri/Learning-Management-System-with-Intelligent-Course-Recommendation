import * as React from "react";
import { cn } from "@/lib/utils";

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("absolute right-0 z-50 mt-2 min-w-40 rounded-lg border border-gray-100 bg-white p-1 text-sm shadow-lg", className)} {...props} />;
}

function DropdownMenuGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

function DropdownMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50", className)} {...props} />;
}

function DropdownMenuCheckboxItem({ className, checked, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  return (
    <div className={cn("flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50", className)} {...props}>
      <span className="w-4">{checked ? "✓" : ""}</span>
      {children}
    </div>
  );
}

function DropdownMenuRadioGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

function DropdownMenuRadioItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50", className)} {...props}>{children}</div>;
}

function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-3 py-2 text-xs font-medium text-gray-500", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-gray-100", className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs text-gray-400", className)} {...props} />;
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuSubTrigger({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex cursor-pointer items-center rounded-md px-3 py-2 hover:bg-gray-50", className)} {...props} />;
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-gray-100 bg-white p-1 shadow-lg", className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
