"use client";

export default function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 w-1/4"><div className="h-4 bg-gray-200 rounded w-24"></div></th>
              <th className="p-4 w-1/4"><div className="h-4 bg-gray-200 rounded w-32"></div></th>
              <th className="p-4 w-1/4"><div className="h-4 bg-gray-200 rounded w-20"></div></th>
              <th className="p-4 w-1/4"><div className="h-4 bg-gray-200 rounded w-28"></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-3/4"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/2"></div></td>
                <td className="p-4"><div className="h-5 bg-gray-200 rounded w-1/3"></div></td>
                <td className="p-4"><div className="h-8 bg-gray-200 rounded-lg w-full"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
