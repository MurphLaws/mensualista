import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Column {
  key: string;
  header: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
}

export function DataTable({ columns, data, emptyState }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F4F0FA]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-muted/50 transition-colors border-b last:border-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
