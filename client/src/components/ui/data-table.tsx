import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

interface DataTableColumn<T> {
  header: string;
  accessorKey: string;
  cell?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  searchable = false,
  searchPlaceholder = "Search...",
  pagination = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter data based on search query
  const filteredData = searchable
    ? data.filter((row) => {
        if (!searchQuery) return true;
        
        return columns.some((column) => {
          const value = (row as any)[column.accessorKey];
          if (value === null || value === undefined) return false;
          
          return String(value)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });
      })
    : data;

  // Sort data if a sort column is specified
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        
        if (aValue === bValue) return 0;
        
        // Handle null/undefined values in sorting
        if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1;
        
        // Compare based on data type
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === "asc"
          ? aValue > bValue ? 1 : -1
          : aValue > bValue ? -1 : 1;
      })
    : filteredData;

  // Paginate data
  const totalPages = pagination
    ? Math.ceil(sortedData.length / pageSize)
    : 1;
    
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Handle sort click
  const handleSortClick = (column: DataTableColumn<T>) => {
    if (!column.enableSorting) return;
    
    if (sortColumn === column.accessorKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.accessorKey);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 py-2"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="px-6 py-3 text-left">
                  <div
                    className={`flex items-center text-xs font-medium text-neutral-500 uppercase tracking-wider ${column.enableSorting ? 'cursor-pointer' : ''}`}
                    onClick={() => handleSortClick(column)}
                  >
                    {column.header}
                    {column.enableSorting && (
                      <span className="ml-1 text-neutral-400">
                        {sortColumn === column.accessorKey ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )
                        ) : (
                          <SortAsc className="h-4 w-4 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-sm text-neutral-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`hover:bg-neutral-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="px-6 py-4">
                      {column.cell
                        ? column.cell(row)
                        : (row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 rounded-b-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-500">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate which page numbers to show
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Show ellipsis for page gaps
                  if (totalPages > 5) {
                    if (i === 0 && currentPage > 3) {
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </Button>
                      );
                    }
                    if (i === 1 && currentPage > 4) {
                      return (
                        <span
                          key={i}
                          className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-500"
                        >
                          ...
                        </span>
                      );
                    }
                    if (i === 3 && currentPage < totalPages - 3) {
                      return (
                        <span
                          key={i}
                          className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-500"
                        >
                          ...
                        </span>
                      );
                    }
                    if (i === 4) {
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-primary text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
