import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CharacterCardSkeleton() {
  return (
    <Card className="border-gold-500/40">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="w-9 h-9 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
