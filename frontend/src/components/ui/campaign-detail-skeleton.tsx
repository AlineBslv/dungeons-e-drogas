import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatSkeleton } from "./chat-skeleton";

export function CampaignDetailSkeleton() {
  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Skeleton className="h-10 w-40 mb-4" />

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-5 w-96" />
          </div>

          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Control */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6" />
                <Skeleton className="h-7 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-4">
                <Skeleton className="w-16 h-16 mx-auto rounded-full" />
                <Skeleton className="h-5 w-48 mx-auto" />
                <Skeleton className="h-12 w-40 mx-auto rounded-md" />
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="bg-card/50 backdrop-blur border-border h-[600px]">
            <ChatSkeleton />
          </Card>

          {/* Campaign Info */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Players */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Master */}
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Players */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-dark-500/50 rounded-lg border border-border"
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invite Code */}
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="flex-1 h-10 rounded-md" />
                <Skeleton className="w-10 h-10 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
