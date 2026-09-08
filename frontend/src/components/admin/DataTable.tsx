import React from "react";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E2EAE0] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E2EAE0] bg-[#FAFCFA] text-[#556A58] font-bold uppercase tracking-wider text-[11px]">
            {columns.map((col, idx) => (
              <th key={idx} className={`py-3.5 px-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDF3EC] text-[#14304A]">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-[#F7FAF6]" : "hover:bg-[#FAFCFA]"
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-3.5 px-4 ${col.className || ""}`}>
                    {col.render
                      ? col.render(row)
                      : col.accessor
                      ? (row[col.accessor] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-xs text-[#718573]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
