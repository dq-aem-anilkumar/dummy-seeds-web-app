
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 25, 50, 100],
  showPageSizeSelector = true
}: PaginationControlsProps) => {
  const startRecord = currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalRecords);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(0, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (range[0] > 1) {
      rangeWithDots.push(0, '...');
    } else if (range[0] === 1) {
      rangeWithDots.push(0);
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 2) {
      rangeWithDots.push('...', totalPages - 1);
    } else if (range[range.length - 1] === totalPages - 2) {
      rangeWithDots.push(totalPages - 1);
    }

    return rangeWithDots;
  };

  if (totalPages <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-white">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing {startRecord} to {endRecord} of {totalRecords} results
        </div>
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-400">...</span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="h-8 w-8 p-0"
              >
                {(page as number) + 1}
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="h-8 px-3"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};