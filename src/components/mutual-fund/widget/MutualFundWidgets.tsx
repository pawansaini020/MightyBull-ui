import {useEffect, useState, useRef, useCallback, useMemo} from "react";
import { useNavigate } from 'react-router-dom';
import styles from './MutualFundWidgets.module.scss';
import Headers from "../../layout/header/Header.tsx";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import Pagination from "../../global/pagination/Pagination.tsx";
import { Routers } from '../../../constants/AppConstants.ts';
import {getColoredStyle} from "../../../helpers/StringTransform.ts";

// Types
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
    score: string[];
    sortBy: string[];
    sector: string[];
}

// Constants
const SCORE_RANGES = [
    { value: "600-1000", label: "600-1000" },
    { value: "500-600", label: "500 - 600" },
    { value: "400-500", label: "400 - 500" },
    { value: "200-400", label: "200 - 400" },
    { value: "0-200", label: "0 - 200" }
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
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => (
    <div className={styles['dropdown']} ref={dropdownRef}>
        <button 
            className={styles['dropdownButton']}
            onClick={(e) => {
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

function MutualFundWidgets() {
    const navigate = useNavigate();
    const [mutualFundList, setMutualFundList] = useState<MutualFundItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<any>({});
    const [sectorSearchText, setSectorSearchText] = useState("");

    // Combined filter state
    const [filters, setFilters] = useState<FilterState>({
        score: [],
        sortBy: [],
        sector: []
    });

    // Dropdown states
    const [dropdownStates, setDropdownStates] = useState({
        score: false,
        sortBy: false,
        sector: false
    });

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
    const handleDropdownToggle = useCallback((dropdownType: keyof typeof dropdownStates) => () => {
        setDropdownStates(prev => ({
            score: false,
            sortBy: false,
            sector: false,
            [dropdownType]: !prev[dropdownType]
        }));
    }, []);

    // Memoized filtered sectors
    const filteredSectors = useMemo(() => 
        SECTORS.filter(sector => 
            sector.toLowerCase().includes(sectorSearchText.toLowerCase())
        ),
        [sectorSearchText]
    );

    // Memoized fetch function
    const fetchFilteredMutualFunds = useCallback(async (page: number) => {
        try {
            const params = new URLSearchParams();
            params.append("page_number", String(page - 1));
            params.append("page_size", "10");

            Object.entries(filters).forEach(([key, values]: [string, string[]]) => {
                values?.forEach(value => {
                    if (key === 'score') params.append("score_range", value);
                    if (key === 'sortBy') params.append("sort_by", value);
                    if (key === 'sector') params.append("sector", value);
                });
            });

            const response = await axiosInstance.get(`v1/api/mutual-fund/widgets?${params.toString()}`);
            
            // Check if response is valid
            if (!response || !response.data) {
                throw new Error("Invalid response from server");
            }
            
            setMutualFundList(response?.data?.data || []);
            setPageData(response?.data?.pagination || {});
        } catch (error: any) {
            console.error("Error fetching mutual fund", error);
            
            // Don't set empty states if the error is due to token expiration
            // The axios interceptor will handle the redirect
            if (error?.response?.status !== 401) {
                setMutualFundList([]);
                setPageData({});
            }
        }
    }, [filters]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            
            // Check if the click is on any of the dropdown elements
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
        fetchFilteredMutualFunds(currentPage);
    }, [currentPage, fetchFilteredMutualFunds]);

    // Add a clear filters function
    const handleClearFilters = useCallback(() => {
        setFilters({
            score: [],
            sortBy: [],
            sector: []
        });
        setSectorSearchText("");
        // Fetch data with cleared filters
        fetchFilteredMutualFunds(currentPage);
    }, [fetchFilteredMutualFunds, currentPage]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['mutual-fund-table-container']}>
                    <div className={styles['mutual-fund-header']}>
                        <h3>All Mutual Funds</h3>
                    </div>

                    <div className={styles['filterContainer']}>
                        <FilterDropdown
                            isOpen={dropdownStates.score}
                            onToggle={handleDropdownToggle('score')}
                            label="Score"
                            dropdownRef={refs.score}
                        >
                            {SCORE_RANGES.map(({ value, label }) => (
                                <div 
                                    className={styles['filter-text']} 
                                    key={value}
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                            dropdownRef={refs.sector}
                        >
                            <div 
                                className={styles['filter-search']}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    className={styles["search-box"]}
                                    placeholder="Search sector..."
                                    value={sectorSearchText}
                                    onChange={(e) => setSectorSearchText(e.target.value)}
                                />
                            </div>
                            {filteredSectors.map((sector) => (
                                <div 
                                    className={styles['filter-text']} 
                                    key={sector}
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                            dropdownRef={refs.sortBy}
                        >
                            {SORT_OPTIONS.map(({ value, label }) => (
                                <div 
                                    className={styles['filter-text']} 
                                    key={value}
                                    onClick={(e) => e.stopPropagation()}
                                >
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
                            <button 
                                className={styles['searchButton']} 
                                onClick={() => fetchFilteredMutualFunds(currentPage)}
                            >
                                Apply
                            </button>
                            <button 
                                className={styles['searchButton']} 
                                onClick={handleClearFilters}
                            >
                                Clear
                            </button>
                        </div>
                        <div className={styles['mutual-fund-total-search']}>
                            Search results {pageData?.total_count ?? 0} Stocks
                        </div>
                    </div>

                    <div className={styles['mutual-fund-table']}>
                        <div className={styles['mutual-fund-table-head']}>
                            <span className={styles['span-logo']}><strong>Name</strong></span>
                            <span className={styles['span-name']}><strong></strong></span>
                            <span><strong>category</strong></span>
                            <span><strong>subCategory</strong></span>
                            <span><strong>risk</strong></span>
                            <span><strong>riskRating</strong></span>
                            <span><strong>return1y</strong></span>
                            <span><strong>return3y</strong></span>
                            <span><strong>return5y</strong></span>
                        </div>

                        {mutualFundList?.map((mutualFund) => (
                            <div 
                                className={styles['mutual-fund-table-row']}
                                key={mutualFund?.mutualFundId}
                                onClick={() => navigate(Routers.MutualFundWidgetDetails.replace(':mutualFundId', encodeURIComponent(mutualFund?.mutualFundId || '')))}
                            >
                                <div className={styles['mutual-fund-row-image']}>
                                    <img 
                                        src={mutualFund?.logoUrl || ''} 
                                        alt={mutualFund?.name || 'Mutual Fund'} 
                                        className={styles['name-img']} 
                                    />
                                </div>
                                <div className={styles['mutual-fund-row-name']}>
                                    <div>{mutualFund?.name || 'N/A'}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund?.category || 'N/A'}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund?.subCategory || 'N/A'}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund?.risk || 'N/A'}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund?.riskRating ?? 'N/A'}</div>
                                </div>
                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund?.return1y ?? 0, styles)}>
                                            {mutualFund?.return1y?.toFixed(2) ?? '0.00'}%
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund?.return3y ?? 0, styles)}>
                                            {mutualFund?.return3y?.toFixed(2) ?? '0.00'}%
                                        </span>
                                    </div>
                                </div>
                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund?.return5y ?? 0, styles)}>
                                            {mutualFund?.return5y?.toFixed(2) ?? '0.00'}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles['pagination_container']}>
                        <Pagination
                            className="pagination-bar"
                            siblingCount={1}
                            currentPage={currentPage}
                            totalCount={pageData?.total_count ?? 0}
                            pageSize={pageData?.page_size ?? 10}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default MutualFundWidgets;