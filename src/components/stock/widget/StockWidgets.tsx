import Headers from "../../layout/header/Header.tsx";
import styles from './StockWidgets.module.scss';
import {useEffect, useState, useRef} from "react";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import Pagination from "../../global/pagination/Pagination.tsx";
import { useNavigate } from 'react-router-dom';
import { Routers } from '../../../constants/AppConstants.ts';

function StockWidgets() {

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

    const sectors = [
        "Finance", "Trading", "Textiles", "IT - Software", "Pharmaceuticals",
        "Chemicals", "Steel", "Healthcare", "Stock/ Commodity Brokers",
        "Power Generation & Distribution"
    ];

    const navigate = useNavigate();

    const [stockList, setStockList] = useState<StockItem[]>([])
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
        fetchFilteredStocks(currentPage, scoreFilters, sortByFilters, sectorFilters);
    };

    const handleClearFilters = () => {
        setScoreFilters([]);
        setSortByFilters([]);
        setSectorFilters([]);
        setSectorSearchText("");
        fetchFilteredStocks(currentPage, scoreFilters, sortByFilters, sectorFilters);
    };

    const fetchFilteredStocks = async (page: number, scores: string[] = [], sortBys: string[] = [], sectors: string[] = []) => {
        try {
            const params = new URLSearchParams();
            params.append("page_number", String(page - 1));
            params.append("page_size", "10");

            scores.forEach(score => params.append("score_range", score));
            sortBys.forEach(sortBy => params.append("sort_by", sortBy));
            sectors.forEach(sector => params.append("sector", sector));

            const response = await axiosInstance.get(`/v1/api/stock/widgets?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget: " + scores+ " : " + sortBys + " : " + sectors + " : " + response.data);

            const data = response.data.data;

            const transformed: StockItem[] = data.data.map((item: any) => ({
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
            setPageData(data.pagination);
        } catch (error) {
            console.error("Error fetching stocks", error);
        }
    };

    useEffect(() => {
        fetchFilteredStocks(currentPage, scoreFilters, sortByFilters, sectorFilters);
    }, [currentPage]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['stock-table-container']}>
                    <div className={styles['stock-header']}>
                        <h3>All Stocks</h3>
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
                        <button 
                                className={styles['searchButton']} 
                                onClick={handleClearFilters}
                            >
                                Clear
                            </button>
                        <div className={styles['stock-total-search']}>
                            Search results {pageData?.total_count || 0} Stocks
                        </div>
                    </div>

                    <div className={styles['stock-table']}>
                        <div className={styles['stock-table-head']}>
                            <span><strong>Company</strong></span>
                            <span><strong>Sector</strong></span>
                            <span><strong>Market Price</strong></span>
                            <span><strong>Score</strong></span>
                            <span><strong>Market Cap (In Cr)</strong></span>
                            <span><strong>Dividend</strong></span>
                        </div>

                        {stockList.map((stock, index) => (
                            <div className={styles['stock-table-row']}
                                 key={index}
                                 onClick={() => navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)))}
                            >
                                <div className={styles['stock-company']}>
                                    <div>{stock.name}</div>
                                </div>

                                <div className={styles['stock-sector']}>
                                    <div>{stock.sector}</div>
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

                                <div className={styles['stock-score']}>
                                    <div>{stock.score.toFixed(2)}</div>
                                </div>

                                <div className={styles['stock-marketCap']}>
                                    <div>{stock.marketCap.toFixed(2)}</div>
                                </div>
                                <div className={styles['stock-dividend']}>
                                    <div>{stock.dividend.toFixed(2)}</div>
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

export default StockWidgets;