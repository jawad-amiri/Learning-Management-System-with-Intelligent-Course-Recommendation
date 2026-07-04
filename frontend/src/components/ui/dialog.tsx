import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
  const value = React.useContext(DialogContext);
  if (!value) throw new Error("Dialog components must be used inside Dialog");
  return value;
}

function Dialog({ children, open, defaultOpen = false, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const setOpen = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return <DialogContext.Provider value={{ open: currentOpen, setOpen }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({ children }: { children: React.ReactElement }) {
  const { setOpen } = useDialog();
  return React.cloneElement(children, { onClick: () => setOpen(true) } as Partial<unknown>);
}

function DialogClose({ children }: { children?: React.ReactElement }) {
  const { setOpen } = useDialog();
  if (children) {
    return React.cloneElement(children, { onClick: () => setOpen(false) } as Partial<unknown>);
  }
  return null;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("fixed inset-0 z-50 bg-black/20", className)} {...props} />;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) {
  const { open, setOpen } = useDialog();
  if (!open) return null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn("fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-white p-5 text-sm text-gray-900 shadow-xl sm:max-w-md", className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button type="button" variant="ghost" size="icon-sm" className="absolute right-2 top-2" onClick={() => setOpen(false)}>
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold leading-none", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500", className)} {...props} />;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
