import React from 'react';

interface Props {
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const buttonClass =
    'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={!hasPreviousPage}
        className={buttonClass}
        title="First page"
      >
        «
      </button>
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={!hasPreviousPage}
        className={buttonClass}
        title="Previous page"
      >
        ‹
      </button>

      <span className="px-3 text-sm text-slate-600">
        Page <strong className="text-slate-800">{pageNumber}</strong> of{' '}
        <strong className="text-slate-800">{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={!hasNextPage}
        className={buttonClass}
        title="Next page"
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={!hasNextPage}
        className={buttonClass}
        title="Last page"
      >
        »
      </button>
    </div>
  );
};

export default Pagination;