import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import styles from './StockWidgets.module.scss';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import Pagination from '../../global/pagination/Pagination.tsx';
import { Routers } from '../../../constants/AppConstants.ts';
import { toFiniteNumber, formatScoreCell } from '../../../helpers/stockRowNormalize.ts';
import {
    MdExpandMore,
    MdInventory2,
    MdFilterList,
    MdClearAll,
    MdSearchOff,
    MdErrorOutline,
} from 'react-icons/md';

interface StockItem {
    stockId: string;
    name: string;
    sector: string;
    price: string;
    change: string;
    isPositive: boolean;
    score: number | null;
    marketCap: number;
    dividend: number;
}

interface FilterState {
    score: string[];
    sortBy: string[];
    sector: string[];
}

interface DropdownState {
    score: boolean;
    sortBy: boolean;
    sector: boolean;
}

const SCORE_OPTIONS = [
    { value: '600-1000', label: '600 – 1000' },
    { value: '500-600', label: '500 – 600' },
    { value: '400-500', label: '400 – 500' },
    { value: '200-400', label: '200 – 400' },
    { value: '0-200', label: '0 – 200' },
];

const SORT_OPTIONS = [
    { value: 'score', label: 'Score' },
    { value: 'marketCap', label: 'Market cap' },
    { value: 'dividendYield', label: 'Dividend' },
];

const SECTORS = [
    'Finance',
    'Trading',
    'Textiles',
    'IT - Software',
    'Pharmaceuticals',
    'Chemicals',
    'Steel',
    'Healthcare',
    'Stock/ Commodity Brokers',
    'Power Generation & Distribution',
];

function FilterDropdown({
    isOpen,
    onToggle,
    label,
    hasSelection,
    children,
    dropdownRef,
}: {
    isOpen: boolean;
    onToggle: () => void;
    label: string;
    hasSelection: boolean;
    children: React.ReactNode;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className={styles.dropdownWrap} ref={dropdownRef}>
            <button
                type="button"
                className={`${styles.filterTrigger} ${isOpen ? styles.filterTriggerOpen : ''} ${hasSelection ? styles.filterTriggerActive : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggle();
                }}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <MdFilterList className={styles.filterTriggerIcon} aria-hidden />
                <span>{label}</span>
                <MdExpandMore className={styles.filterChevron} aria-hidden />
            </button>
            {isOpen && (
                <div
                    className={styles.dropdownPanel}
                    role="listbox"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

function StockWidgets() {
    const navigate = useNavigate();
    const [stockList, setStockList] = useState<StockItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<{
        total_count?: number;
        page_size?: number;
    }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterState>({
        score: [],
        sortBy: [],
        sector: [],
    });

    const [dropdownStates, setDropdownStates] = useState<DropdownState>({
        score: false,
        sortBy: false,
        sector: false,
    });

    const [sectorSearchText, setSectorSearchText] = useState('');

    const refs = {
        score: useRef<HTMLDivElement>(null),
        sortBy: useRef<HTMLDivElement>(null),
        sector: useRef<HTMLDivElement>(null),
    };

    const activeFilterCount = useMemo(
        () => filters.score.length + filters.sortBy.length + filters.sector.length,
        [filters]
    );

    const handleFilterChange = useCallback(
        (filterType: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFilters((prev) => ({
                ...prev,
                [filterType]: e.target.checked ? [value] : [],
            }));
        },
        []
    );

    const handleDropdownToggle = useCallback(
        (dropdownType: keyof DropdownState) => () => {
            setDropdownStates((prev) => ({
                score: false,
                sortBy: false,
                sector: false,
                [dropdownType]: !prev[dropdownType],
            }));
        },
        []
    );

    const filteredSectors = useMemo(
        () => SECTORS.filter((sector) => sector.toLowerCase().includes(sectorSearchText.toLowerCase())),
        [sectorSearchText]
    );

    const fetchFilteredStocks = useCallback(
        async (page: number) => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.append('page_number', String(page - 1));
                params.append('page_size', '10');

                Object.entries(filters).forEach(([key, values]) => {
                    values.forEach((value: string) => {
                        if (value) {
                            if (key === 'score') params.append('score_range', value);
                            if (key === 'sortBy') params.append('sort_by', value);
                            if (key === 'sector') params.append('sector', value);
                        }
                    });
                });

                const response = await axiosInstance.get(`/v1/api/stock/widgets?${params.toString()}`);

                const block = response?.data?.data;
                if (!block) {
                    throw new Error('Invalid response from server');
                }

                /* Some pages return `data: null` / missing list — avoid .map crash (blank screen) */
                const rawList = block.data;
                const rows = Array.isArray(rawList) ? rawList : [];

                const transformed: StockItem[] = rows.map((item: any) => {
                    const close = toFiniteNumber(item.closePrice) ?? 0;
                    const yh = toFiniteNumber(item.yearlyHighPrice) ?? 0;
                    const yl = toFiniteNumber(item.yearlyLowPrice) ?? 0;
                    const mc = toFiniteNumber(item.marketCap) ?? 0;
                    const div = toFiniteNumber(item.dividend) ?? 0;
                    return {
                        stockId: String(item.stockId ?? ''),
                        name: String(item.name ?? ''),
                        sector:
                            item.sector == null || item.sector === ''
                                ? '—'
                                : String(item.sector),
                        price: close.toFixed(2),
                        change: `(${yl} - ${yh})`,
                        isPositive: close >= (yh + yl) / 2,
                        score: toFiniteNumber(item.score),
                        marketCap: mc,
                        dividend: div,
                    };
                });

                setStockList(transformed);
                setPageData(block.pagination ?? {});
            } catch (err: unknown) {
                console.error('Error fetching stocks', err);
                const message = err instanceof Error ? err.message : 'Failed to fetch stocks';
                setError(message);
                setStockList([]);
            } finally {
                setIsLoading(false);
            }
        },
        [filters]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!event.target) return;
            const target = event.target as Node;
            const inside = Object.values(refs).some((ref) => ref.current?.contains(target));
            if (!inside) {
                setDropdownStates({ score: false, sortBy: false, sector: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchFilteredStocks(currentPage);
    }, [currentPage, fetchFilteredStocks]);

    const handleClearFilters = useCallback(() => {
        setFilters({ score: [], sortBy: [], sector: [] });
        setSectorSearchText('');
        setCurrentPage(1);
    }, []);

    const handleStockClick = useCallback(
        (stockId: string) => {
            if (!stockId) return;
            navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stockId)));
        },
        [navigate]
    );

    const totalCount = pageData?.total_count ?? 0;

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    <section className={styles.hero} aria-label="Stock explorer">
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <div className={styles.heroIcon} aria-hidden>
                                <MdInventory2 />
                            </div>
                            <div className={styles.heroText}>
                                <p className={styles.heroEyebrow}>Stock universe</p>
                                <h1 className={styles.heroTitle}>All stocks</h1>
                                <p className={styles.heroSub}>
                                    Filter by score, sector, and sort — open any row for full widget detail.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className={styles.filtersCard}>
                        <div className={styles.filtersRow}>
                            <FilterDropdown
                                isOpen={dropdownStates.score}
                                onToggle={handleDropdownToggle('score')}
                                label="Score range"
                                hasSelection={filters.score.length > 0}
                                dropdownRef={refs.score}
                            >
                                {SCORE_OPTIONS.map(({ value, label }) => (
                                    <label key={value} className={styles.filterCheckRow}>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('score')}
                                            checked={filters.score.includes(value)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </FilterDropdown>

                            <FilterDropdown
                                isOpen={dropdownStates.sector}
                                onToggle={handleDropdownToggle('sector')}
                                label="Sector"
                                hasSelection={filters.sector.length > 0}
                                dropdownRef={refs.sector}
                            >
                                <div className={styles.sectorSearch}>
                                    <input
                                        type="search"
                                        className={styles.sectorSearchInput}
                                        placeholder="Search sectors…"
                                        value={sectorSearchText}
                                        onChange={(e) => setSectorSearchText(e.target.value)}
                                        aria-label="Search sectors"
                                    />
                                </div>
                                <div className={styles.sectorList}>
                                    {filteredSectors.map((sector) => (
                                        <label key={sector} className={styles.filterCheckRow}>
                                            <input
                                                type="checkbox"
                                                value={sector}
                                                onChange={handleFilterChange('sector')}
                                                checked={filters.sector.includes(sector)}
                                            />
                                            <span>{sector}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterDropdown>

                            <FilterDropdown
                                isOpen={dropdownStates.sortBy}
                                onToggle={handleDropdownToggle('sortBy')}
                                label="Sort by"
                                hasSelection={filters.sortBy.length > 0}
                                dropdownRef={refs.sortBy}
                            >
                                {SORT_OPTIONS.map(({ value, label }) => (
                                    <label key={value} className={styles.filterCheckRow}>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('sortBy')}
                                            checked={filters.sortBy.includes(value)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </FilterDropdown>

                            <button
                                type="button"
                                className={styles.clearBtn}
                                onClick={handleClearFilters}
                                disabled={isLoading || activeFilterCount === 0}
                            >
                                <MdClearAll aria-hidden />
                                Clear filters
                            </button>

                            <div className={styles.resultChip} role="status">
                                <strong>{totalCount}</strong>
                                <span>stocks match</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBanner} role="alert">
                            <MdErrorOutline aria-hidden />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.tableCard}>
                        <div className={styles.tableHead}>
                            <span>Company</span>
                            <span className={styles.hideMobile}>Sector</span>
                            <span>Score</span>
                            <span>Price</span>
                            <span className={styles.hideMobile}>M cap (Cr)</span>
                            <span className={styles.hideMobile}>Div.</span>
                        </div>

                        {isLoading ? (
                            <div className={styles.loadingState}>
                                <span className={styles.loadingPulse} aria-hidden />
                                Loading stocks…
                            </div>
                        ) : stockList.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MdSearchOff className={styles.emptyIcon} aria-hidden />
                                <p className={styles.emptyTitle}>No stocks found</p>
                                <p className={styles.emptyHint}>Try clearing filters or changing score range.</p>
                            </div>
                        ) : (
                            <ul className={styles.tableBody}>
                                {stockList.map((stock) => (
                                    <li key={stock.stockId}>
                                        <button
                                            type="button"
                                            className={styles.tableRow}
                                            onClick={() => handleStockClick(stock.stockId)}
                                        >
                                            <span className={styles.cellCompany}>{stock.name}</span>
                                            <span className={`${styles.cellMuted} ${styles.hideMobile}`}>
                                                {stock.sector}
                                            </span>
                                            <span className={styles.cellScore}>{formatScoreCell(stock.score)}</span>
                                            <span className={styles.cellPrice}>
                                                <span className={styles.priceMain}>₹{stock.price}</span>
                                                <span
                                                    className={
                                                        stock.isPositive ? styles.positive : styles.negative
                                                    }
                                                >
                                                    {stock.change}
                                                </span>
                                            </span>
                                            <span className={`${styles.cellNum} ${styles.hideMobile}`}>
                                                {stock.marketCap.toFixed(2)}
                                            </span>
                                            <span className={`${styles.cellNum} ${styles.hideMobile}`}>
                                                {stock.dividend.toFixed(2)}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {!isLoading && stockList.length > 0 && (
                        <div className={styles.paginationWrap}>
                            <Pagination
                                className="pagination-bar"
                                siblingCount={1}
                                currentPage={currentPage}
                                totalCount={pageData?.total_count || 0}
                                pageSize={pageData?.page_size || 10}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default StockWidgets;
