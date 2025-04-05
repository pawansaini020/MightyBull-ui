import { useState, useEffect } from "react";
import Headers from "../layout/header/Header.tsx";
import styles from './Dashboard.module.scss';
import axios from "axios";
import Pagination from '../global/pagination/Pagination.tsx';

function Dashboard() {
    interface StockItem {
        name: string;
        price: string;
        change: string;
        isPositive: boolean;
        score: number;
        marketCap: number;
    }

    const [stockList, setStockList] = useState<StockItem[]>([])
    const [currentPage, setCurrentPage] = useState(1) // 1-based for UI
    const [pageData, setPageData] = useState<any>({})

    const fetchStocks = async (page: number) => {
        try {
            const response = await axios.get(`http://localhost:8083/mightybull/v1/api/stock/widgets?page_number=${page - 1}&page_size=10`, {
                headers : {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });

            const data = response.data.data;

            const transformed: StockItem[] = data.data.map((item: any) => ({
                name: item.name,
                price: item.closePrice.toFixed(2),
                change: `(${item.yearlyLowPrice} - ${item.yearlyHighPrice})`,
                isPositive: item.closePrice >= (item.yearlyHighPrice + item.yearlyLowPrice)/2,
                score: item.score,
                marketCap: item.marketCap / 10000000
            }));

            setStockList(transformed);
            setPageData(data.pagination);
        } catch (error) {
            console.error("Error fetching stocks", error);
        }
    };

    useEffect(() => {
        fetchStocks(currentPage);
    }, [currentPage]);

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['stock-table-container']}>
                    <div className={styles['stock-header']}>
                        <h3>Top by Market Cap</h3>
                        <a href="#" className={styles.seeMore}>See more</a>
                    </div>

                    <div className={styles['stock-table']}>
                        <div className={styles['stock-table-head']}>
                            <span><strong>Company</strong></span>
                            <span><strong>Market Price</strong></span>
                            <span><strong>Score</strong></span>
                            <span><strong>Market Cap (In Cr)</strong></span>
                        </div>

                        {stockList.map((stock, index) => (
                            <div className={styles['stock-table-row']} key={index}>
                                <div className={styles['stock-company']}>
                                    <div>{stock.name}</div>
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
                                    <div>{stock.score}</div>
                                </div>

                                <div className={styles['stock-marketCap']}>
                                    <div>{stock.marketCap.toFixed(2)}</div>
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

export default Dashboard;
