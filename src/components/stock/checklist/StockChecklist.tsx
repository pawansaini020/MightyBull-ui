import Headers from "../../layout/header/Header.tsx";
import styles from './StockChecklist.module.scss';
import {useEffect, useState, useRef} from "react";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import Pagination from "../../global/pagination/Pagination.tsx";
import {Page} from '../../../constants/AppConstants.ts'

function StockChecklist() {

    interface StockItem {
        name: string;
        sector: string;
        price: string;
        change: string;
        isPositive: boolean;
        score: number;
        marketCap: number;
        dividend: number;
    }

    const [stockList, setStockList] = useState<StockItem[]>([])
    const [currentPage, setCurrentPage] = useState(1) // 1-based for UI
    const [pageData, setPageData] = useState<any>({})

    const [scoreFilters, setScoreFilters] = useState<string[]>([]);
    const [scoreOpen, setScoreOpen] = useState(false);

    const scoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (scoreRef.current && !scoreRef.current.contains(event.target as Node)) {
                setScoreOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleScoreFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setScoreFilters(prev =>
            e.target.checked ? [...prev, value] : prev.filter(v => v !== value)
        );
    };

    const applyFilters = () => {
        fetchFilteredStocks(currentPage, scoreFilters);
    };

    const fetchFilteredStocks = async (page: number, scores: string[] = []) => {
        try {
            const params = new URLSearchParams();
            params.append("page_number", String(page - 1));
            params.append("page_size", "10");

            scores.forEach(score => params.append("score_range", score));

            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget: " + scoreFilters+ " : " + response.data);

            const data = response.data.data;

            const transformed: StockItem[] = data.data.map((item: any) => ({
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
        fetchFilteredStocks(currentPage, scoreFilters);
    }, [currentPage]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['stock-table-container']}>
                    <div className={styles['stock-header']}>
                        <h3>All Stocks</h3>
                        <div className={styles['stock-total-search']}>
                            Search results {pageData?.total_count || 0} Stocks
                        </div>
                    </div>

                    <div className={styles['filterContainer']}>
                        <div className={styles['dropdown']}>
                            <button onClick={() => setScoreOpen(!scoreOpen)}>
                                Score ▾
                            </button>
                            {scoreOpen && (
                                <div className={styles['dropdownItem']}>
                                    <div className={styles['filter-text']}>
                                        <label><input type="checkbox" value="80-100" onChange={handleScoreFilter}/> 80 - 100</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label className={styles['filter-text']}><input type="checkbox" value="60-80" onChange={handleScoreFilter}/> 60 - 80</label>
                                    </div>
                                    <div className={styles['filter-text']}>
                                        <label className={styles['filter-text']}><input type="checkbox" value="40-60" onChange={handleScoreFilter}/> 40 - 60</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className={styles['applyBtn']} onClick={applyFilters}>Apply</button>
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
                            <div className={styles['stock-table-row']} key={index}>
                                <div className={styles['stock-company']}>
                                    <div>{stock.name}</div>
                                </div>

                                <div className={styles['stock-sector']}>
                                    <div>{stock.sector}</div>
                                </div>

                                <div className={styles['stock-price']}>
                                    <div>
                                        <span>{stock.price} </span>
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

export default StockChecklist;