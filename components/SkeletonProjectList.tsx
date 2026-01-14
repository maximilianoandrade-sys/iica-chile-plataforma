import { Search, Filter } from "lucide-react";

export default function SkeletonProjectList() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--iica-border)] overflow-hidden animate-pulse">

            {/* Header Skeleton */}
            <div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/50">
                <div className="flex flex-col gap-6">
                    <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="hidden md:block">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#f4f7f9] border-b border-[var(--iica-border)]">
                            <th className="py-5 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
                            <th className="py-5 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
                            <th className="py-5 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
                            <th className="py-5 px-6"><div className="h-4 w-24 bg-gray-200 rounded ml-auto"></div></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--iica-border)]">
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td className="py-5 px-6">
                                    <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                                </td>
                                <td className="py-5 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                </td>
                                <td className="py-5 px-6">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </td>
                                <td className="py-5 px-6 text-right">
                                    <div className="h-9 w-32 bg-gray-200 rounded ml-auto"></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Skeleton */}
            <div className="md:hidden p-5 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <div className="h-6 w-20 bg-gray-200 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
