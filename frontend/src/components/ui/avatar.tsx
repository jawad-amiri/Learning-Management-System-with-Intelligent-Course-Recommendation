import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" | "lg" }) {
  const sizes = {
    sm: "size-6 text-xs",
    default: "size-8 text-sm",
    lg: "size-10 text-base",
  };

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100", sizes[size], className)}
      {...props}
    />
  );
}

function AvatarImage({ className, alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex size-full items-center justify-center rounded-full bg-blue-100 text-blue-700", className)} {...props} />;
}

function AvatarBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white", className)} {...props} />;
}

function AvatarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex -space-x-2", className)} {...props} />;
}

function AvatarGroupCount({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex size-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 ring-2 ring-white", className)} {...props} />;
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
