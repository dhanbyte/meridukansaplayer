export default function AdminLoading() {
    return (
        <div className="p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
