import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MutualFundWidgets.module.scss';
import Headers from '../../layout/header/Header.tsx';
import Footer from '../../layout/footer/Footer.tsx';
import axiosInstance from '../../../helpers/axiosInstance.ts';
import Pagination from '../../global/pagination/Pagination.tsx';
import { Routers } from '../../../constants/AppConstants.ts';
import { formatNumber, getColoredStyle } from '../../../helpers/StringTransform.ts';
import {
    MdSavings,
    MdExpandMore,
    MdFilterList,
    MdClearAll,
    MdSearchOff,
    MdErrorOutline,
} from 'react-icons/md';

interface MutualFundItem {
    mutualFundId: string;
    name: string;
    fundHouse: string;
    category: string;
    subCategory: string;
    risk: string;
    riskRating: number;
    logoUrl: string;
    return1d: number;
    return1y: number;
    return3y: number;
    return5y: number;
    aum: number;
}

interface FilterState {
    category: string[];
    cap: string[];
    fundHouse: string[];
}

interface DropdownState {
    category: boolean;
    cap: boolean;
    fundHouse: boolean;
}

const FUND_HOUSE_OPTIONS = [
    'Quant Small Cap Fund',
    'PPFAS Mutual Fund',
    'Axis Mutual Fund',
    'LIC Mutual Fund',
    'Nippon India Mutual Fund',
    'SBI Mutual Fund',
    'Quant Mutual Fund',
    'Tata Mutual Fund',
    'HDFC Mutual Fund',
];

const CATEGORY_OPTIONS = [
    { value: 'Equity', label: 'Equity' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Commodities', label: 'Commodities' },
    { value: 'Debt', label: 'Debt' },
];

const CAP_OPTIONS = [
    { value: 'Small Cap', label: 'Small Cap' },
    { value: 'Mid Cap', label: 'Mid Cap' },
    { value: 'Large Cap', label: 'Large Cap' },
    { value: 'Flexi Cap', label: 'Flexi Cap' },
    { value: 'Multi Cap', label: 'Multi Cap' },
];

const DEFAULT_PAGE_STATE = {
    total_count: 0,
    page_size: 10,
};

function FundLogo({ url, label }: { url: string; label: string }) {
    const [broken, setBroken] = useState(false);
    if (broken || !url?.trim()) {
        return (
            <span className={styles.logoFallback} aria-hidden>
                {label.trim().slice(0, 2).toUpperCase() || 'MF'}
            </span>
        );
    }
    return (
        <img
            src={url}
            alt=""
            className={styles.logoImg}
            width={28}
            height={28}
            loading="lazy"
            onError={() => setBroken(true)}
        />
    );
}

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

function mapApiRow(item: Record<string, unknown>): MutualFundItem {
    return {
        mutualFundId: String(item.mutualFundId ?? ''),
        name: String(item.name ?? '—'),
        fundHouse: String(item.fundHouse ?? '—'),
        category: String(item.category ?? '—'),
        subCategory: String(item.subCategory ?? '—'),
        risk: String(item.risk ?? '—'),
        riskRating: Number(item.riskRating) || 0,
        logoUrl: String(item.logoUrl ?? '').trim(),
        return1d: Number(item.return1d) || 0,
        return1y: Number(item.return1y) || 0,
        return3y: Number(item.return3y) || 0,
        return5y: Number(item.return5y) || 0,
        aum: Number(item.aum) || 0,
    };
}

function MutualFundWidgets() {
    const navigate = useNavigate();
    const [mutualFundList, setMutualFundList] = useState<MutualFundItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState(DEFAULT_PAGE_STATE);
    const [fundHouseSearchText, setFundHouseSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterState>({
        category: [],
        cap: [],
        fundHouse: [],
    });

    const [dropdownStates, setDropdownStates] = useState<DropdownState>({
        category: false,
        cap: false,
        fundHouse: false,
    });

    const refs = {
        category: useRef<HTMLDivElement>(null),
        cap: useRef<HTMLDivElement>(null),
        fundHouse: useRef<HTMLDivElement>(null),
    };

    const activeFilterCount = useMemo(
        () => filters.category.length + filters.cap.length + filters.fundHouse.length,
        [filters]
    );

    const handleFilterChange = useCallback(
        (filterType: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFilters((prev) => ({
                ...prev,
                [filterType]: e.target.checked ? [value] : [],
            }));
            setCurrentPage(1);
        },
        []
    );

    const handleDropdownToggle = useCallback((dropdownType: keyof DropdownState) => () => {
        setDropdownStates((prev) => ({
            category: false,
            cap: false,
            fundHouse: false,
            [dropdownType]: !prev[dropdownType],
        }));
    }, []);

    const filteredFundHouses = useMemo(
        () =>
            FUND_HOUSE_OPTIONS.filter((house) =>
                house.toLowerCase().includes((fundHouseSearchText ?? '').toLowerCase())
            ),
        [fundHouseSearchText]
    );

    const fetchFilteredMutualFunds = useCallback(
        async (page: number) => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.append('page_number', String(Math.max(0, page - 1)));
                params.append('page_size', '10');

                Object.entries(filters).forEach(([key, values]: [string, string[]]) => {
                    values.forEach((value: string) => {
                        if (value) {
                            if (key === 'category') params.append('category', value);
                            if (key === 'cap') params.append('cap', value);
                            if (key === 'fundHouse') params.append('fund_house', value);
                        }
                    });
                });

                const response = await axiosInstance.get(
                    `/v1/api/mutual-fund/widgets?${params.toString()}`
                );

                const root = response?.data;
                if (root == null) {
                    throw new Error('Invalid response from server');
                }

                const rawList = root.data;
                const rows = Array.isArray(rawList) ? rawList : [];
                const transformed = rows.map((row: Record<string, unknown>) => mapApiRow(row));

                setMutualFundList(transformed);
                setPageData({
                    total_count: root.pagination?.total_count ?? 0,
                    page_size: root.pagination?.page_size ?? 10,
                });
            } catch (err: unknown) {
                console.error('Error fetching mutual funds', err);
                const message =
                    err instanceof Error ? err.message : 'Failed to fetch mutual funds';
                setError(message);
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status !== 401) {
                    setMutualFundList([]);
                    setPageData(DEFAULT_PAGE_STATE);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [filters]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const inside = Object.values(refs).some((ref) => ref.current?.contains(target));
            if (!inside) {
                setDropdownStates({ category: false, cap: false, fundHouse: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchFilteredMutualFunds(currentPage);
    }, [currentPage, fetchFilteredMutualFunds]);

    const handleClearFilters = useCallback(() => {
        setFilters({ category: [], cap: [], fundHouse: [] });
        setFundHouseSearchText('');
        setCurrentPage(1);
    }, []);

    const handleMutualFundClick = useCallback(
        (mutualFundId: string) => {
            if (!mutualFundId) return;
            navigate(
                Routers.MutualFundWidgetDetails.replace(
                    ':mutualFundId',
                    encodeURIComponent(mutualFundId)
                )
            );
        },
        [navigate]
    );

    const formatReturnPct = useCallback((value: number) => `${formatNumber(value)}%`, []);

    const totalCount = pageData?.total_count ?? 0;

    return (
        <>
            <Headers />
            <div className={styles.mainDiv}>
                <div className={styles.shell}>
                    <section className={styles.hero} aria-label="Mutual fund explorer">
                        <div className={styles.heroGlow} aria-hidden />
                        <div className={styles.heroInner}>
                            <div className={styles.heroIcon} aria-hidden>
                                <MdSavings />
                            </div>
                            <div className={styles.heroText}>
                                <p className={styles.heroEyebrow}>Mutual funds</p>
                                <h1 className={styles.heroTitle}>All mutual funds</h1>
                                <p className={styles.heroSub}>
                                    Filter by AMC, category, and cap. Open any row for scheme detail and
                                    metrics.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className={styles.filtersCard}>
                        <div className={styles.filtersRow}>
                            <FilterDropdown
                                isOpen={dropdownStates.fundHouse}
                                onToggle={handleDropdownToggle('fundHouse')}
                                label="Fund house"
                                hasSelection={filters.fundHouse.length > 0}
                                dropdownRef={refs.fundHouse}
                            >
                                <div className={styles.sectorSearch}>
                                    <input
                                        type="search"
                                        className={styles.sectorSearchInput}
                                        placeholder="Search AMC…"
                                        value={fundHouseSearchText}
                                        onChange={(e) => setFundHouseSearchText(e.target.value)}
                                        aria-label="Search fund houses"
                                    />
                                </div>
                                <div className={styles.sectorList}>
                                    {filteredFundHouses.map((house) => (
                                        <label key={house} className={styles.filterCheckRow}>
                                            <input
                                                type="checkbox"
                                                value={house}
                                                onChange={handleFilterChange('fundHouse')}
                                                checked={filters.fundHouse.includes(house)}
                                            />
                                            <span>{house}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterDropdown>

                            <FilterDropdown
                                isOpen={dropdownStates.category}
                                onToggle={handleDropdownToggle('category')}
                                label="Category"
                                hasSelection={filters.category.length > 0}
                                dropdownRef={refs.category}
                            >
                                <div className={styles.sectorList}>
                                    {CATEGORY_OPTIONS.map(({ value, label }) => (
                                        <label key={value} className={styles.filterCheckRow}>
                                            <input
                                                type="checkbox"
                                                value={value}
                                                onChange={handleFilterChange('category')}
                                                checked={filters.category.includes(value)}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterDropdown>

                            <FilterDropdown
                                isOpen={dropdownStates.cap}
                                onToggle={handleDropdownToggle('cap')}
                                label="Cap"
                                hasSelection={filters.cap.length > 0}
                                dropdownRef={refs.cap}
                            >
                                <div className={styles.sectorList}>
                                    {CAP_OPTIONS.map(({ value, label }) => (
                                        <label key={value} className={styles.filterCheckRow}>
                                            <input
                                                type="checkbox"
                                                value={value}
                                                onChange={handleFilterChange('cap')}
                                                checked={filters.cap.includes(value)}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
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
                                <span>funds match</span>
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
                        <div className={styles.tableScroll}>
                            <div className={styles.tableInner}>
                                <div
                                    className={styles.tableHead}
                                    role="row"
                                    aria-label="Column headers"
                                >
                                    <span className={styles.colLogo} />
                                    <span>Fund</span>
                                    <span>Category</span>
                                    <span>Cap</span>
                                    <span>Risk</span>
                                    <span className={styles.colNum}>Rating</span>
                                    <span className={styles.colNum}>1Y</span>
                                    <span className={styles.colNum}>3Y</span>
                                    <span className={styles.colNum}>5Y</span>
                                </div>

                                {isLoading ? (
                                    <div className={styles.loadingState}>
                                        <span className={styles.loadingPulse} aria-hidden />
                                        Loading funds…
                                    </div>
                                ) : mutualFundList.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <MdSearchOff className={styles.emptyIcon} aria-hidden />
                                        <p className={styles.emptyTitle}>No mutual funds found</p>
                                        <p className={styles.emptyHint}>
                                            Try clearing filters or changing criteria.
                                        </p>
                                    </div>
                                ) : (
                                    <ul className={styles.tableBody}>
                                        {mutualFundList.map((fund) => (
                                            <li key={fund.mutualFundId}>
                                                <button
                                                    type="button"
                                                    className={styles.tableRow}
                                                    onClick={() =>
                                                        handleMutualFundClick(fund.mutualFundId)
                                                    }
                                                >
                                                    <span className={styles.colLogo}>
                                                        <span className={styles.logoRing}>
                                                            <FundLogo
                                                                url={fund.logoUrl}
                                                                label={fund.fundHouse || fund.name}
                                                            />
                                                        </span>
                                                    </span>
                                                    <span className={styles.colFund}>
                                                        <span className={styles.fundName}>
                                                            {fund.name}
                                                        </span>
                                                        <span className={styles.fundHouse}>
                                                            {fund.fundHouse}
                                                        </span>
                                                    </span>
                                                    <span className={styles.colMuted}>{fund.category}</span>
                                                    <span className={styles.colMuted}>{fund.subCategory}</span>
                                                    <span className={styles.colMuted}>{fund.risk}</span>
                                                    <span className={styles.colNum}>
                                                        {Number.isFinite(fund.riskRating)
                                                            ? fund.riskRating
                                                            : '—'}
                                                    </span>
                                                    <span className={styles.colNum}>
                                                        <span
                                                            className={getColoredStyle(
                                                                fund.return1y,
                                                                styles
                                                            )}
                                                        >
                                                            {formatReturnPct(fund.return1y)}
                                                        </span>
                                                    </span>
                                                    <span className={styles.colNum}>
                                                        <span
                                                            className={getColoredStyle(
                                                                fund.return3y,
                                                                styles
                                                            )}
                                                        >
                                                            {formatReturnPct(fund.return3y)}
                                                        </span>
                                                    </span>
                                                    <span className={styles.colNum}>
                                                        <span
                                                            className={getColoredStyle(
                                                                fund.return5y,
                                                                styles
                                                            )}
                                                        >
                                                            {formatReturnPct(fund.return5y)}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isLoading && mutualFundList.length > 0 && (
                        <div className={styles.paginationWrap}>
                            <Pagination
                                className="pagination-bar"
                                siblingCount={1}
                                currentPage={currentPage}
                                totalCount={pageData.total_count}
                                pageSize={pageData.page_size}
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

export default MutualFundWidgets;
