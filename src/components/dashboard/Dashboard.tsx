import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headers from "../layout/header/Header.tsx";
import styles from './Dashboard.module.scss';
import Pagination from '../global/pagination/Pagination.tsx';
import axiosInstance from "../../helpers/axiosInstance.ts";
import {Page} from '../../constants/AppConstants.ts'
import {Routers} from '../../constants/AppConstants.ts'

function Dashboard() {
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
    const navigate = useNavigate();

    const [isRotating, setIsRotating] = useState(false);

    const handleRefreshClick = () => {
        setIsRotating(true);
        fetchStocks(currentPage);

        // Reset rotation after animation ends (400ms matches the CSS duration)
        setTimeout(() => {
            setIsRotating(false);
        }, 400);
    };

    const handleSeeMoreButtonClick = () => {
        navigate(Routers.StockWidgets)
    }


    const fetchStocks = async (page: number) => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget: " + response.data);

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
            if(error == 'Access token expired. Please login again.') {
                navigate(Routers.Dashboard);
            }
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
                        <div>
                            <a href="#" className={styles.seeMore} onClick={handleSeeMoreButtonClick}>See more</a>
                            <button className={`${styles.refreshBtn} ${isRotating ? styles.rotated : ''}`}  onClick={handleRefreshClick}  aria-label="Refresh stocks">
                                🔄
                            </button>
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

export default Dashboard;
