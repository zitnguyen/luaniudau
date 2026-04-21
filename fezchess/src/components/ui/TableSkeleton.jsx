import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TableSkeleton = ({ rows = 6, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((__, colIndex) => (
            <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-6 py-4">
              <Skeleton height={16} borderRadius={8} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
