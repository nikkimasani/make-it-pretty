import { useState, useMemo, useRef, useCallback, useId } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';

interface DataTableProps {
  columns: string[];
  rows: Record<string, string>[];
  pageSize?: number;
}

function fuzzyFilter(rows: Record<string, string>[], globalFilter: string): Record<string, string>[] {
  if (!globalFilter) return rows;
  const q = globalFilter.toLowerCase();
  return rows.filter((row) => Object.values(row).some((v) => v.toLowerCase().includes(q)));
}

export function DataTable({ columns, rows, pageSize = 50 }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const _columnSizingId = useId();

  const filteredRows = useMemo(() => fuzzyFilter(rows, globalFilter), [rows, globalFilter]);

  const columnDefs = useMemo<ColumnDef<Record<string, string>>[]>(
    () =>
      columns.map((col) => ({
        id: col,
        accessorFn: (row) => row[col] ?? '',
        header: col,
        enableResizing: true,
        size: Math.max(120, Math.min(300, col.length * 10 + 60)),
        minSize: 60,
      })),
    [columns],
  );

  const data = useMemo(
    () => (globalFilter ? filteredRows : rows),
    [rows, filteredRows, globalFilter],
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((r) => r.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, rowSelection],
  );

  const downloadCSV = useCallback(
    (rowsToExport: Record<string, string>[], filename: string) => {
      const header = columns.join(',');
      const csvRows = rowsToExport.map((row) =>
        columns
          .map((col) => {
            const val = row[col] ?? '';
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(','),
      );
      const csv = [header, ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [columns],
  );

  const copyToClipboard = useCallback(
    async (rowsToCopy: Record<string, string>[], format: 'json' | 'csv') => {
      let text: string;
      if (format === 'json') {
        text = JSON.stringify(rowsToCopy, null, 2);
      } else {
        const header = columns.join(',');
        const csvRows = rowsToCopy.map((row) =>
          columns
            .map((col) => {
              const val = row[col] ?? '';
              return val.includes(',') || val.includes('"') || val.includes('\n')
                ? `"${val.replace(/"/g, '""')}"`
                : val;
            })
            .join(','),
        );
        text = [header, ...csvRows].join('\n');
      }
      await navigator.clipboard.writeText(text);
    },
    [columns],
  );

  const currentPageRows = table.getRowModel().rows;
  const totalRowCount = rows.length;

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              table.setPageIndex(0);
            }}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-800 dark:text-surface-200 placeholder-surface-400 dark:placeholder-surface-600 transition-all"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <span className="text-xs text-surface-500 dark:text-surface-500 tabular-nums">
          {table.getFilteredRowModel().rows.length.toLocaleString()} / {totalRowCount.toLocaleString()} rows
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => downloadCSV(data, 'tabulate-export.csv')}
            className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200 transition-all"
          >
            Export CSV
          </button>
          {selectedRows.length > 0 && (
            <>
              <button
                onClick={() => downloadCSV(selectedRows, 'selected-rows.csv')}
                className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
              >
                Export Selected ({selectedRows.length})
              </button>
              <button
                onClick={() => copyToClipboard(selectedRows, 'json')}
                className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
              >
                Copy JSON
              </button>
              <button
                onClick={() => copyToClipboard(selectedRows, 'csv')}
                className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-all"
              >
                Copy CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableContainerRef}
        className="overflow-auto border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 shadow-glass dark:shadow-glass-dark"
        style={{ maxHeight: '65vh' }}
      >
        <table className="w-full border-collapse" style={{ width: table.getTotalSize() }}>
          <thead className="bg-surface-50 dark:bg-surface-950/60 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-10 px-3 py-3 border-b border-surface-200 dark:border-surface-800">
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 bg-white dark:bg-surface-800"
                    aria-label="Select all rows"
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left text-[11px] font-semibold text-surface-500 dark:text-surface-500 uppercase tracking-wider border-b border-surface-200 dark:border-surface-800 relative select-none"
                    style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize }}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        className="flex items-center gap-1 hover:text-surface-800 dark:hover:text-surface-200 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {
                          {
                            asc: <ChevronUp className="w-3 h-3 text-primary-500" aria-hidden="true" />,
                            desc: <ChevronDown className="w-3 h-3 text-primary-500" aria-hidden="true" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="w-3 h-3 text-surface-300 dark:text-surface-600" aria-hidden="true" />
                          )
                        }
                      </button>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={columnFilters[header.column.id] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setColumnFilters((prev) => ({ ...prev, [header.column.id]: v }));
                          header.column.setFilterValue(v || undefined);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-1 w-16 px-1.5 py-0.5 text-[10px] bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 text-surface-700 dark:text-surface-300 placeholder-surface-400 dark:placeholder-surface-600 transition-colors"
                        aria-label={`Filter ${header.column.id}`}
                      />
                      {/* Resize handle */}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-400 dark:hover:bg-primary-500 opacity-0 hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {currentPageRows.map((row, rowIdx) => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  row.getIsSelected()
                    ? 'bg-primary-50 dark:bg-primary-500/5'
                    : rowIdx % 2 === 0
                    ? 'bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/60'
                    : 'bg-surface-50/50 dark:bg-surface-950/30 hover:bg-surface-50 dark:hover:bg-surface-800/60'
                }`}
              >
                <td className="px-3 py-2.5 border-b border-surface-100 dark:border-surface-800">
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 bg-white dark:bg-surface-800"
                    aria-label={`Select row ${rowIdx + 1}`}
                  />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2.5 text-sm text-surface-700 dark:text-surface-300 border-b border-surface-100 dark:border-surface-800 truncate max-w-[300px]"
                  >
                    <span title={cell.getValue() as string}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
            {currentPageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-10 text-center text-sm text-surface-400 dark:text-surface-600"
                >
                  No rows match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs text-surface-500 dark:text-surface-500 tabular-nums">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          {[
            { label: 'First', fn: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
            { label: 'Prev', fn: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
            { label: 'Next', fn: () => table.nextPage(), disabled: !table.getCanNextPage() },
            { label: 'Last', fn: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
          ].map(({ label, fn, disabled }) => (
            <button
              key={label}
              onClick={fn}
              disabled={disabled}
              className="px-3 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-surface-500 dark:text-surface-500">Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1.5 text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-700 dark:text-surface-300 transition-all"
          >
            {[25, 50, 100, 250, 500, 1000].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
