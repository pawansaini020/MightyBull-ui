import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import Headers from "../../layout/header/Header.tsx";
import styles from './StockWidgets.module.scss';
import axiosInstance from "../../../helpers/axiosInstance.ts";
import Pagination from "../../global/pagination/Pagination.tsx";
import { Routers } from '../../../constants/AppConstants.ts';

// Types
interface StockItem {
    stockId: string;
    name: string;
    sector: string;
    price: string;
    change: string;
    isPositive: boolean;
    score: number;
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

// Constants
const SCORE_OPTIONS = [
    { value: "600-1000", label: "600-1000" },
    { value: "500-600", label: "500-600" },
    { value: "400-500", label: "400-500" },
    { value: "200-400", label: "200-400" },
    { value: "0-200", label: "0-200" }
];

const SORT_OPTIONS = [
    { value: "score", label: "Score" },
    { value: "marketCap", label: "Market Cap" },
    { value: "dividendYield", label: "Dividend" }
];

const SECTORS = [
    "Finance", "Trading", "Textiles", "IT - Software", "Pharmaceuticals",
    "Chemicals", "Steel", "Healthcare", "Stock/ Commodity Brokers",
    "Power Generation & Distribution"
];

// Reusable Dropdown Component
const FilterDropdown = ({ 
    isOpen, 
    onToggle, 
    label, 
    children,
    dropdownRef
}: { 
    isOpen: boolean; 
    onToggle: () => void; 
    label: string; 
    children: React.ReactNode;
    dropdownRef: React.RefObject<HTMLDivElement>;
}) => (
    <div className={styles['dropdown']} ref={dropdownRef}>
        <button 
            className={styles['dropdownButton']}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
            }}
        >
            {label} ▾
        </button>
        {isOpen && (
            <div 
                className={styles['dropdownItem']}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        )}
    </div>
);

function StockWidgets() {
    const navigate = useNavigate();
    const [stockList, setStockList] = useState<StockItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filters, setFilters] = useState<FilterState>({
        score: [],
        sortBy: [],
        sector: []
    });

    // Dropdown states
    const [dropdownStates, setDropdownStates] = useState<DropdownState>({
        score: false,
        sortBy: false,
        sector: false
    });

    // Search state
    const [sectorSearchText, setSectorSearchText] = useState("");

    // Refs for click outside handling
    const refs = {
        score: useRef<HTMLDivElement>(null),
        sortBy: useRef<HTMLDivElement>(null),
        sector: useRef<HTMLDivElement>(null)
    };

    // Memoized filter handlers
    const handleFilterChange = useCallback((filterType: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            [filterType]: e.target.checked ? [value] : []
        }));
    }, []);

    // Memoized dropdown toggle handler
    const handleDropdownToggle = useCallback((dropdownType: keyof DropdownState) => () => {
        setDropdownStates(prev => {
            const newState = {
                score: false,
                sortBy: false,
                sector: false
            };
            newState[dropdownType] = !prev[dropdownType];
            return newState;
        });
    }, []);

    // Memoized filtered sectors
    const filteredSectors = useMemo(() => 
        SECTORS.filter(sector => 
            sector.toLowerCase().includes(sectorSearchText.toLowerCase())
        ),
        [sectorSearchText]
    );

    // Memoized fetch function
    const fetchFilteredStocks = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.append("page_number", String(page - 1));
            params.append("page_size", "10");

            // Add filters to params
            Object.entries(filters).forEach(([key, values]) => {
                values.forEach((value: any) => {
                    if (value) {
                        if (key === 'score') params.append("score_range", value);
                        if (key === 'sortBy') params.append("sort_by", value);
                        if (key === 'sector') params.append("sector", value);
                    }
                });
            });

            const response = await axiosInstance.get(`/v1/api/stock/widgets?${params.toString()}`);
            
            if (!response?.data?.data) {
                throw new Error("Invalid response from server");
            }

            const transformed: StockItem[] = response.data.data.data.map((item: any) => ({
                stockId: item.stockId,
                name: item.name,
                sector: item.sector,
                price: item.closePrice.toFixed(2),
                change: `(${item.yearlyLowPrice} - ${item.yearlyHighPrice})`,
                isPositive: item.closePrice >= (item.yearlyHighPrice + item.yearlyLowPrice)/2,
                score: item.score,
                marketCap: item.marketCap,
                dividend: item.dividend,
            }));

            setStockList(transformed);
            setPageData(response.data.data.pagination);
        } catch (error: any) {
            console.error("Error fetching stocks", error);
            setError(error?.message || "Failed to fetch stocks");
            setStockList([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!event.target) return;
            
            const target = event.target as Node;
            const isDropdownClick = Object.values(refs).some(ref => 
                ref.current && ref.current.contains(target)
            );
            
            if (!isDropdownClick) {
                setDropdownStates({
                    score: false,
                    sortBy: false,
                    sector: false
                });
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch data when page or filters change
    useEffect(() => {
        fetchFilteredStocks(currentPage);
    }, [currentPage, fetchFilteredStocks]);

    // Add a clear filters function
    const handleClearFilters = useCallback(() => {
        setFilters({
            score: [],
            sortBy: [],
            sector: []
        });
        setSectorSearchText("");
        setCurrentPage(1);
    }, []);

    const handleStockClick = useCallback((stockId: string) => {
        if (!stockId) return;
        navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stockId)));
    }, [navigate]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['stock-table-container']}>
                    <div className={styles['stock-header']}>
                        <h3>All Stocks</h3>
                    </div>

                    <div className={styles['filterContainer']}>
                        <FilterDropdown
                            isOpen={dropdownStates.score}
                            onToggle={handleDropdownToggle('score')}
                            label="Score"
                            dropdownRef={refs.score as React.RefObject<HTMLDivElement>}
                        >
                            {SCORE_OPTIONS.map(({ value, label }) => (
                                <div className={styles['filter-text']} key={value}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('score')}
                                            checked={filters.score.includes(value)}
                                        /> {label}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <FilterDropdown
                            isOpen={dropdownStates.sector}
                            onToggle={handleDropdownToggle('sector')}
                            label="Sector"
                            dropdownRef={refs.sector as React.RefObject<HTMLDivElement>}
                        >
                            <div className={styles['filter-search']}>
                                <input
                                    type="text"
                                    className={styles["search-box"]}
                                    placeholder="Search sector..."
                                    value={sectorSearchText}
                                    onChange={(e) => setSectorSearchText(e.target.value)}
                                />
                            </div>
                            {filteredSectors.map((sector) => (
                                <div className={styles['filter-text']} key={sector}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={sector}
                                            onChange={handleFilterChange('sector')}
                                            checked={filters.sector.includes(sector)}
                                        /> {sector}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <FilterDropdown
                            isOpen={dropdownStates.sortBy}
                            onToggle={handleDropdownToggle('sortBy')}
                            label="Sort By"
                            dropdownRef={refs.sortBy as React.RefObject<HTMLDivElement>}
                        >
                            {SORT_OPTIONS.map(({ value, label }) => (
                                <div className={styles['filter-text']} key={value}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('sortBy')}
                                            checked={filters.sortBy.includes(value)}
                                        /> {label}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <div className={styles['filter-buttons']}>
                            {/* <button 
                                className={styles['searchButton']} 
                                onClick={() => fetchFilteredStocks(currentPage)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Apply'}
                            </button> */}
                            <button 
                                className={styles['searchButton']} 
                                onClick={handleClearFilters}
                                disabled={isLoading}
                            >
                                Clear
                            </button>
                        </div>
                        <div className={styles['stock-total-search']}>
                            Search results {pageData?.total_count || 0} Stocks
                        </div>
                    </div>

                    {error && (
                        <div className={styles['error-message']}>
                            {error}
                        </div>
                    )}

                    <div className={styles['stock-table']}>
                        <div className={styles['stock-table-head']}>
                            <span className={styles['span-company']}><strong>Company</strong></span>
                            <span><strong>Sector</strong></span>
                            <span className={styles['span-score']}><strong>Score</strong></span>
                            <span className={styles['span-right']}><strong>Market Price</strong></span>
                            <span className={styles['hide-mobile']}><strong>Market Cap (In Cr)</strong></span>
                            <span className={styles['hide-mobile']}><strong>Dividend</strong></span>
                        </div>

                        {isLoading ? (
                            <div className={styles['loading-message']}>Loading...</div>
                        ) : stockList.length === 0 ? (
                            <div className={styles['no-data-message']}>No stocks found</div>
                        ) : (
                            stockList.map((stock) => (
                                <div 
                                    className={styles['stock-table-row']}
                                    key={stock.stockId}
                                    onClick={() => handleStockClick(stock.stockId)}
                                >
                                    <div className={styles['stock-company']}>
                                        <div>{stock.name}</div>
                                    </div>
                                    <div className={styles['stock-sector']}>
                                        <div>{stock.sector}</div>
                                    </div>
                                    <div className={styles['stock-score']}>
                                        <div>{stock.score.toFixed(2)}</div>
                                    </div>
                                    <div className={styles['stock-price']}>
                                        <div>
                                            <span>{stock.price} </span>
                                        </div>
                                        <div>
                                            <span className={stock.isPositive ? styles.positive : styles.negative}>
                                                {stock.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`${styles['stock-marketCap']} ${styles['hide-mobile']}`}>
                                        <div>{stock.marketCap.toFixed(2)}</div>
                                    </div>
                                    <div className={`${styles['stock-dividend']} ${styles['hide-mobile']}`}>
                                        <div>{stock.dividend.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!isLoading && stockList.length > 0 && (
                        <div className={styles['pagination_container']}>
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
            </div>
        </>
    );
}

export default StockWidgets;