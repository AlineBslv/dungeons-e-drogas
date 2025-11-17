import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Message from other */}
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full max-w-md rounded-lg" />
          </div>
        </div>

        {/* Message from user */}
        <div className="flex gap-3 justify-end">
          <div className="flex-1 space-y-2 flex flex-col items-end">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full max-w-sm rounded-lg" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>

        {/* Message from other */}
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full max-w-lg rounded-lg" />
          </div>
        </div>

        {/* Message from user */}
        <div className="flex gap-3 justify-end">
          <div className="flex-1 space-y-2 flex flex-col items-end">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-full max-w-md rounded-lg" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="w-10 h-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}
