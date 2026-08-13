import { flexRender } from "@tanstack/react-table";
import EmptyState from "./EmptyState";
import TablePagination from "./TablePagination";

export default function DataTable({
  table,
  filteredCount,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters.",
}) {
  if (filteredCount === 0) {
    return (
      <div className="signet-table-wrap">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="signet-table-wrap">
      <table className="signet-table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className={h.column.getCanSort() ? "cursor-pointer select-none" : ""}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination table={table} />
    </div>
  );
}
