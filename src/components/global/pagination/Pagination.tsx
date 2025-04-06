import React from 'react';
import styles from './Pagination.module.scss';
import { DOTS, usePagination } from '../../../app/hooks/usePagination';

interface PaginationProps {
    onPageChange: (page: number) => void;
    totalCount: number;
    siblingCount?: number;
    currentPage: number;
    pageSize: number;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   onPageChange,
                                                   totalCount,
                                                   siblingCount = 1,
                                                   currentPage,
                                                   pageSize,
                                                   className = '',
                                               }) => {
    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize,
    });

    if (currentPage === 0 || !paginationRange || paginationRange.length < 2) {
        return null;
    }

    return (
        <ul className={`${styles['pagination-container']} ${className}`}>
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return (
                        <li key={index} className={styles['pagination-item-dots']}>
                            &#8230;
                        </li>
                    );
                }

                return (
                    <li
                        key={index}
                        className={`${styles['pagination-item']} ${
                            pageNumber === currentPage ? styles['selected'] : ''
                        }`}
                        onClick={() => onPageChange(Number(pageNumber))}
                    >
                        {pageNumber}
                    </li>
                );
            })}
        </ul>
    );
};

export default Pagination;
