import {useEffect, useState, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import styles from './MutualFundWidgets.module.scss';
import Headers from "../../layout/header/Header.tsx";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import Pagination from "../../global/pagination/Pagination.tsx";
import { Routers } from '../../../constants/AppConstants.ts';
import {getColoredStyle} from "../../../helpers/StringTransform.ts";

function MutualFundWidgets() {

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

    const sectors = [
        "Finance", "Trading", "Textiles", "IT - Software", "Pharmaceuticals",
        "Chemicals", "Steel", "Healthcare", "Stock/ Commodity Brokers",
        "Power Generation & Distribution"
    ];

    const navigate = useNavigate();

    const [mutualFundList, setMutualFundList] = useState<MutualFundItem[]>([])
    const [currentPage, setCurrentPage] = useState(1) // 1-based for UI
    const [pageData, setPageData] = useState<any>({})

    const [scoreFilters, setScoreFilters] = useState<string[]>([]);
    const [scoreOpen, setScoreOpen] = useState(false);
    const [sortByFilters, setSortByFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState(false);
    const [sectorFilters, setSectorFilters] = useState<string[]>([]);
    const [sectorOpen, setSectorOpen] = useState(false);

    const scoreRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const sectorRef = useRef<HTMLDivElement>(null);

    const [sectorSearchText, setSectorSearchText] = useState("");

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                scoreRef.current && !scoreRef.current.contains(target) &&
                sortRef.current && !sortRef.current.contains(target) &&
                sectorRef.current && !sectorRef.current.contains(target)
            ) {
                setScoreOpen(false);
                setSortBy(false);
                setSectorOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleScoreFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (e.target.checked) {
            setScoreFilters([value]); // Only allow one selected
        } else {
            setScoreFilters([]);
        }
    };

    const handleSortByFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (e.target.checked) {
            setSortByFilters([value]); // Only allow one selected
        } else {
            setSortByFilters([]);
        }
    };

    const handleSectorByFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (e.target.checked) {
            setSectorFilters([value]); // Only allow one selected
        } else {
            setSectorFilters([]);
        }
    };

    const applyFilters = () => {
        fetchFilteredMutualFunds(currentPage, scoreFilters, sortByFilters, sectorFilters);
    };

    const fetchFilteredMutualFunds = async (page: number, scores: string[] = [], sortBys: string[] = [], sectors: string[] = []) => {
        try {
            const params = new URLSearchParams();
            params.append("page_number", String(page - 1));
            params.append("page_size", "10");

            scores.forEach(score => params.append("score_range", score));
            sortBys.forEach(sortBy => params.append("sort_by", sortBy));
            sectors.forEach(sector => params.append("sector", sector));

            const response = await axiosInstance.get(`v1/api/mutual-fund/widgets?${params.toString()}`);


            setMutualFundList(response.data.data);
            setPageData(response.data.pagination);
        } catch (error) {
            console.error("Error fetching mutual fund", error);
        }
    };

    useEffect(() => {
        fetchFilteredMutualFunds(currentPage, scoreFilters, sortByFilters, sectorFilters);
    }, [currentPage]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['mutual-fund-table-container']}>
                    <div className={styles['mutual-fund-header']}>
                        <h3>All Mutual Funds</h3>
                    </div>

                    <div className={styles['filterContainer']}>
                        <div className={styles['dropdown']} ref={scoreRef}>
                            <button className={styles['dropdownButton']}
                                    onClick={() => {
                                        setScoreOpen(!scoreOpen)
                                        setSortBy(false); // Close other dropdown
                                        setSectorOpen(false);
                                    }}>
                                Score ▾
                            </button>
                            {scoreOpen && (
                                <div className={styles['dropdownItem']}>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="600-1000"
                                            onChange={handleScoreFilter}
                                            checked={scoreFilters.includes("600-1000")}
                                        /> 600-1000</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="500-600"
                                            onChange={handleScoreFilter}
                                            checked={scoreFilters.includes("500-600")}
                                        /> 500 - 600</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="400-500"
                                            onChange={handleScoreFilter}
                                            checked={scoreFilters.includes("400-500")}
                                        /> 400 - 500</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="200-400"
                                            onChange={handleScoreFilter}
                                            checked={scoreFilters.includes("200-400")}
                                        /> 200 - 400</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="0-200"
                                            onChange={handleScoreFilter}
                                            checked={scoreFilters.includes("0-200")}
                                        /> 0 - 200</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles['dropdown']} ref={sectorRef}>
                            <button className={styles['dropdownButton']}
                                    onClick={() => {
                                        setSectorOpen(!sectorOpen)
                                        setScoreOpen(false);
                                        setSortBy(false);
                                    }}>
                                Sector ▾
                            </button>
                            {sectorOpen && (
                                <div className={styles['dropdownItem']}>
                                    {/* Search Input */}
                                    <div className={styles['filter-search']}>
                                        <input
                                            type="text"
                                            className={styles["search-box"]}
                                            placeholder="Search sector..."
                                            value={sectorSearchText}
                                            onChange={(e) => setSectorSearchText(e.target.value)}
                                        />
                                    </div>

                                    {/* Scrollable Filter List */}
                                    {sectors
                                        .filter((sector) =>
                                            sector.toLowerCase().includes(sectorSearchText.toLowerCase())
                                        )
                                        .map((sector) => (
                                            <div className={styles['filter-text']} key={sector}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        value={sector}
                                                        onChange={handleSectorByFilter}
                                                        checked={sectorFilters.includes(sector)}
                                                    />{" "}
                                                    {sector}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className={styles['dropdown']} ref={sortRef}>
                            <button className={styles['dropdownButton']}
                                    onClick={() => {
                                        setSortBy(!sortBy)
                                        setScoreOpen(false); // Close other dropdown
                                        setSectorOpen(false);
                                    }}>
                                Sort By ▾
                            </button>
                            {sortBy && (
                                <div className={styles['dropdownItem']}>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="score"
                                            onChange={handleSortByFilter}
                                            checked={sortByFilters.includes("score")}
                                        /> Score</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="marketCap"
                                            onChange={handleSortByFilter}
                                            checked={sortByFilters.includes("marketCap")}
                                        /> Market Cap</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label><input
                                            type="checkbox" value="dividendYield"
                                            onChange={handleSortByFilter}
                                            checked={sortByFilters.includes("dividendYield")}
                                        /> Dividend</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className={styles['searchButton']} onClick={applyFilters}>Apply</button>
                        <div className={styles['mutual-fund-total-search']}>
                            Search results {pageData?.total_count || 0} Stocks
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

                        {mutualFundList.map((mutualFund, index) => (
                            <div className={styles['mutual-fund-table-row']}
                                 key={index}
                                 onClick={() => navigate(Routers.MutualFundWidgetDetails.replace(':mutualFundId', encodeURIComponent(mutualFund.mutualFundId)))}
                            >
                                <div className={styles['mutual-fund-row-image']}>
                                    <img src={mutualFund.logoUrl} className={styles['name-img']} />
                                </div>
                                <div className={styles['mutual-fund-row-name']}>
                                    <div>{mutualFund.name}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund.category}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund.subCategory}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund.risk}</div>
                                </div>
                                <div className={styles['mutual-fund-row-text']}>
                                    <div>{mutualFund.riskRating}</div>
                                </div>

                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund.return1y || 0, styles)}>{mutualFund.return1y}%</span>
                                    </div>
                                </div>
                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund.return3y || 0, styles)}>{mutualFund.return3y}%</span>
                                    </div>
                                </div>
                                <div className={styles['mutual-fund-price']}>
                                    <div>
                                        <span className={getColoredStyle(mutualFund.return5y || 0, styles)}>{mutualFund.return5y}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
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
                </div>
            </div>
        </>
    );
}

export default MutualFundWidgets;