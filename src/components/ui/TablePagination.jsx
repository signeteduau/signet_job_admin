import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({ table }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const total = table.getFilteredRowModel().rows.length;

  if (total === 0) return null;

  return (
    <div className="signet-table-footer">
      <p className="text-sm text-[rgb(var(--foreground)/55%)]">
        Showing {table.getRowModel().rows.length} of {total} rows
      </p>
      <div className="flex items-center gap-2">
        <button
          className="signet-icon-btn !w-9 !h-9 !rounded-xl"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium px-2">
          {pageIndex + 1} / {Math.max(pageCount, 1)}
        </span>
        <button
          className="signet-icon-btn !w-9 !h-9 !rounded-xl"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
