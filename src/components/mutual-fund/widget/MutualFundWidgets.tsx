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
    category: string[];
    cap: string[];
    fundHouse: string[];
}

interface DropdownState {
    category: boolean;
    cap: boolean;
    fundHouse: boolean;
}

// Constants
const FUND_HOUSE_OPTIONS = [
    "Quant Small Cap Fund", 
    "PPFAS Mutual Fund", 
    "Axis Mutual Fund", 
    "LIC Mutual Fund",
    "Nippon India Mutual Fund", 
    "SBI Mutual Fund", 
    "Quant Mutual Fund", 
    "Tata Mutual Fund",
    "HDFC Mutual Fund"
];

const CATEGORY_OPTIONS = [
    { value: "Equity", label: "Equity" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Commodities", label: "Commodities" },
    { value: "Debt", label: "Debt" }
];

const CAP_OPTIONS = [
    { value: "Small Cap", label: "Small Cap" },
    { value: "Mid Cap", label: "Mid Cap" },
    { value: "Large Cap", label: "Large Cap" },
    { value: "Flexi Cap", label: "Flexi Cap" },
    { value: "Multi Cap", label: "Multi Cap" }
];

// Default pagination state
const DEFAULT_PAGE_STATE = {
    total_count: 0,
    page_size: 10
};

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

function MutualFundWidgets() {
    const navigate = useNavigate();
    const [mutualFundList, setMutualFundList] = useState<MutualFundItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState(DEFAULT_PAGE_STATE);
    const [fundHouseSearchText, setFundHouseSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Combined filter state
    const [filters, setFilters] = useState<FilterState>({
        category: [],
        cap: [],
        fundHouse: []
    });

    // Dropdown states
    const [dropdownStates, setDropdownStates] = useState<DropdownState>({
        category: false,
        cap: false,
        fundHouse: false
    });

    // Refs for click outside handling
    const refs = {
        category: useRef<HTMLDivElement>(null),
        cap: useRef<HTMLDivElement>(null),
        fundHouse: useRef<HTMLDivElement>(null)
    };

    // Memoized filter handlers
    const handleFilterChange = useCallback((filterType: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target) return;
        
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            [filterType]: e.target.checked ? [value] : []
        }));
    }, []);

    // Memoized dropdown toggle handler
    const handleDropdownToggle = useCallback((dropdownType: keyof DropdownState) => () => {
        setDropdownStates(prev => {
            // Create a new state where all dropdowns are closed
            const newState = {
                category: false,
                cap: false,
                fundHouse: false
            };
            // Only open the clicked dropdown if it was closed
            newState[dropdownType] = !prev[dropdownType];
            return newState;
        });
    }, []);

    // Memoized filtered fundHouse
    const filteredFundHouses = useMemo(() => 
        FUND_HOUSE_OPTIONS.filter(fundHouse => 
            fundHouse.toLowerCase().includes(fundHouseSearchText?.toLowerCase() ?? '')
        ),
        [fundHouseSearchText]
    );

    // Memoized fetch function
    const fetchFilteredMutualFunds = useCallback(async (page: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.append("page_number", String(Math.max(0, page - 1)));
            params.append("page_size", "10");

            // Add filters to params
            Object.entries(filters).forEach(([key, values]: [string, string[]]) => {
                values?.forEach(value => {
                    if (value) {
                        if (key === 'category') params.append("category", value);
                        if (key === 'cap') params.append("cap", value);
                        if (key === 'fundHouse') params.append("fund_house", value);
                    }
                });
            });

            const response = await axiosInstance.get(`v1/api/mutual-fund/widgets?${params.toString()}`);
            
            if (!response?.data) {
                throw new Error("Invalid response from server");
            }
            
            setMutualFundList(response.data.data || []);
            setPageData({
                total_count: response.data.pagination?.total_count ?? 0,
                page_size: response.data.pagination?.page_size ?? 10
            });
        } catch (error: any) {
            console.error("Error fetching mutual fund", error);
            setError(error?.message || "Failed to fetch mutual funds");
            
            if (error?.response?.status !== 401) {
                setMutualFundList([]);
                setPageData(DEFAULT_PAGE_STATE);
            }
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
                    category: false,
                    cap: false,
                    fundHouse: false
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
            category: [],
            cap: [],
            fundHouse: []
        });
        setFundHouseSearchText("");
        setCurrentPage(1);
    }, []);

    const handleMutualFundClick = useCallback((mutualFundId: string | undefined) => {
        if (!mutualFundId) return;
        navigate(Routers.MutualFundWidgetDetails.replace(':mutualFundId', encodeURIComponent(mutualFundId)));
    }, [navigate]);

    const formatReturnValue = useCallback((value: number | undefined | null): string => {
        if (value === undefined || value === null) return '0.00%';
        return `${value.toFixed(2)}%`;
    }, []);

    return (
        <>
            <Headers currentTab={null} />
            <div className={styles['main-div']}>
                <div className={styles['mutual-fund-table-container']}>
                    <div className={styles['mutual-fund-header']}>
                        <h3>All Mutual Funds</h3>
                    </div>

                    <div className={styles['filterContainer']}>
                        <FilterDropdown
                            isOpen={dropdownStates.fundHouse}
                            onToggle={handleDropdownToggle('fundHouse')}
                            label="Fund House"
                            dropdownRef={refs.fundHouse}
                        >
                            <div className={styles['filter-search']}>
                                <input
                                    type="text"
                                    className={styles["search-box"]}
                                    placeholder="Search fund..."
                                    value={fundHouseSearchText}
                                    onChange={(e) => setFundHouseSearchText(e.target.value)}
                                />
                            </div>
                            {filteredFundHouses.map((fundHouse) => (
                                <div className={styles['filter-text']} key={fundHouse}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={fundHouse}
                                            onChange={handleFilterChange('fundHouse')}
                                            checked={filters.fundHouse.includes(fundHouse)}
                                        /> {fundHouse}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <FilterDropdown
                            isOpen={dropdownStates.category}
                            onToggle={handleDropdownToggle('category')}
                            label="Category"
                            dropdownRef={refs.category}
                        >
                            {CATEGORY_OPTIONS.map(({ value, label }) => (
                                <div className={styles['filter-text']} key={value}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('category')}
                                            checked={filters.category.includes(value)}
                                        /> {label}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <FilterDropdown
                            isOpen={dropdownStates.cap}
                            onToggle={handleDropdownToggle('cap')}
                            label="Cap"
                            dropdownRef={refs.cap}
                        >
                            {CAP_OPTIONS.map(({ value, label }) => (
                                <div className={styles['filter-text']} key={value}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={handleFilterChange('cap')}
                                            checked={filters.cap.includes(value)}
                                        /> {label}
                                    </label>
                                </div>
                            ))}
                        </FilterDropdown>

                        <div className={styles['filter-buttons']}>
                            {/* <button 
                                className={styles['searchButton']} 
                                onClick={() => fetchFilteredMutualFunds(currentPage)}
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
                        <div className={styles['mutual-fund-total-search']}>
                            Search results {pageData.total_count} Stocks
                        </div>
                    </div>

                    {error && (
                        <div className={styles['error-message']}>
                            {error}
                        </div>
                    )}

                    <div className={styles['mutual-fund-table']}>
                        <div className={styles['mutual-fund-table-head']}>
                            <span className={styles['span-logo']}><strong></strong></span>
                            <span className={styles['span-name']}><strong>Name</strong></span>
                            <span><strong>Category</strong></span>
                            <span><strong>Cap</strong></span>
                            <span><strong>Risk</strong></span>
                            <span><strong>Risk Rating</strong></span>
                            <span><strong>Return(1 Year)</strong></span>
                            <span><strong>Return(2 Year)</strong></span>
                            <span><strong>Return(3 Year)</strong></span>
                        </div>

                        {isLoading ? (
                            <div className={styles['loading-message']}>Loading...</div>
                        ) : mutualFundList.length === 0 ? (
                            <div className={styles['no-data-message']}>No mutual funds found</div>
                        ) : (
                            mutualFundList.map((mutualFund) => (
                                <div 
                                    className={styles['mutual-fund-table-row']}
                                    key={mutualFund?.mutualFundId}
                                    onClick={() => handleMutualFundClick(mutualFund?.mutualFundId)}
                                >
                                    <div className={styles['mutual-fund-row-image']}>
                                        <img 
                                            src={mutualFund?.logoUrl || '/default-fund-logo.png'} 
                                            alt={mutualFund?.name || 'Mutual Fund'} 
                                            className={styles['name-img']}
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.src = '/default-fund-logo.png';
                                            }}
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
                                                {formatReturnValue(mutualFund?.return1y)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles['mutual-fund-price']}>
                                        <div>
                                            <span className={getColoredStyle(mutualFund?.return3y ?? 0, styles)}>
                                                {formatReturnValue(mutualFund?.return3y)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles['mutual-fund-price']}>
                                        <div>
                                            <span className={getColoredStyle(mutualFund?.return5y ?? 0, styles)}>
                                                {formatReturnValue(mutualFund?.return5y)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!isLoading && mutualFundList.length > 0 && (
                        <div className={styles['pagination_container']}>
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
            </div>
        </>
    );
}

export default MutualFundWidgets;