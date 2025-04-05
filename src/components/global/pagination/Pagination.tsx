import React from 'react';
import styles from './Pagination.module.scss'; // Assuming your SCSS module file is named 'pagination.module.scss'
import { DOTS, usePagination } from '../../../app/hooks/usePagination.ts';

const Pagination = (props) => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
        className='',
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize,
    });

    if (currentPage === 0 || paginationRange?.length < 2) {
        return null;
    }

    return (
        <ul className={`${styles['pagination-container']} ${className}`}>
            {paginationRange?.map((pageNumber, index) => {
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
                            pageNumber === currentPage && styles.selected
                        }`}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </li>
                );
            })}
        </ul>
    );
};

export default Pagination;