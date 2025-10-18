import { Loader2 } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-[#C5A75B] opacity-80 pl-3 font-['Crimson_Pro'] text-sm py-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Mestre Drogon esta conjurando...</span>
    </div>
  );
}
