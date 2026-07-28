import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2">
      <div className="space-y-3">
        <div className="h-7 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-72 bg-gray-100 rounded-md"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[300px] bg-white border border-gray-100 rounded-xl shadow-sm"></div>
        <div className="lg:col-span-2 h-[500px] bg-white border border-gray-100 rounded-xl shadow-sm"></div>
      </div>
    </div>
  );
}
