import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import Headers from "../../layout/header/Header.tsx";
import styles from './Dashboard.module.scss';
// import Pagination from '../global/pagination/Pagination.tsx'1;
import axiosInstance from "../../../helpers/axiosInstance.ts";
import {Page} from '../../../constants/AppConstants.ts'
import {Routers} from '../../../constants/AppConstants.ts'
import {formatNumber, getColoredStyle} from "../../../helpers/StringTransform.ts";

function Dashboard() {
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

    interface IndexData {
        name: string;
        symbol: string;
        indexId: string;
        country: string;
        logoUrl: string;
        value: number;
        open: number;
        close: number;
        dayChange: number;
        dayChangePerc: number;
        low: number;
        high: number;
        yearLowPrice: number;
        yearHighPrice: number;
    }

    const [stockList, setStockList] = useState<StockItem[]>([])
    // const [currentPage, setCurrentPage] = useState(1) // 1-based for UI
    // const [pageData, setPageData] = useState<any>({})
    const navigate = useNavigate();
    const [isRotatingStock, setIsRotatingStock] = useState(false);
    const [indexes, setIndexes] = useState<Record<string, IndexData>>({});
    const [isRotatingIndex, setIsRotatingIndex] = useState(false);

    const handleRefreshStockClick = () => {
        setIsRotatingStock(true);
        fetchStocks(1);

        // Reset rotation after animation ends (400ms matches the CSS duration)
        setTimeout(() => {
            setIsRotatingStock(false);
        }, 400);
    };

    const handleRefreshIndexClick = () => {
        setIsRotatingIndex(true);
        fetchIndexItemsFromSource()

        // Reset rotation after animation ends (400ms matches the CSS duration)
        setTimeout(() => {
            setIsRotatingIndex(false);
        }, 400);
    }

    const handleSeeMoreButtonClick = () => {
        navigate(Routers.StockWidgets);
    }

    const handleAllIndexesButtonClick = () => {
        navigate(Routers.Indices);
    };


    const fetchStocks = async (page: number) => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget: {}", response.data.data);

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
            // setPageData(data.pagination);
        } catch (error) {
            console.error("Error fetching stocks", error);
        }
    };

    const fetchIndexItems = async () => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/index/widgets?index_type=INDIAN`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Indexes widget: {}", response.data);
            const json = response.data;
            if (response.status) {
                const map: Record<string, IndexData> = {};
                json.data.forEach((idx: IndexData) => {
                    map[idx.indexId] = idx;
                });
                setIndexes(map);
            }
        } catch (error) {
            console.error("Error fetching indexes widgets", error);
        }
    }

    const fetchIndexItemsFromSource = async () => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/grow/index/sync`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const json = response.data;
            if (response.status) {
                const map: Record<string, IndexData> = {};
                json.data.forEach((idx: IndexData) => {
                    map[idx.name] = idx;
                });
                setIndexes(map);
            }
        } catch (error) {
            console.error("Error fetching indexes widgets", error);
        }
    }

    const handleIndexWidget = (indexId : string) => navigate(Routers.IndexDetails.replace(':indexId', encodeURIComponent(indexId)));

    useEffect(() => {
        fetchIndexItems();
        fetchStocks(1);
    }, []);

    const TABS = [
        { key: 'STOCK', label: 'Stocks' },
        { key: 'MUTUAL_FUND', label: 'Mutual Fund' },
    ];

    return (
        <>
            <Headers currentTab={TABS[0].key} />
            <div className={styles['main-div']}>
                {/* Index Details*/}
                <div className={styles['index-container']}>
                    <div className={styles['stock-header']}>
                        <h3>Indices</h3>
                        <div>
                            <a href="#" className={styles.seeMore} onClick={handleAllIndexesButtonClick}>All Indices</a>
                            <button className={`${styles.refreshBtn} ${isRotatingIndex ? styles.rotated : ''}`}  onClick={handleRefreshIndexClick}  aria-label="Refresh stocks">
                                🔄
                            </button>
                        </div>
                    </div>
                    <div className={styles['index-table-container']}>
                        <div className={styles.row}>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['nifty']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>NIFTY</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['nifty']?.value || 0)} <span className={getColoredStyle(indexes['nifty']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['nifty']?.dayChange || 0)} ({formatNumber(indexes['nifty']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['sp-bse-sensex']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>SENSEX</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['sp-bse-sensex']?.value || 0)} <span className={getColoredStyle(indexes['sp-bse-sensex']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['sp-bse-sensex']?.dayChange || 0)} ({formatNumber(indexes['sp-bse-sensex']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['nifty-bank']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>BANKNIFTY</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['nifty-bank']?.value || 0)} <span className={getColoredStyle(indexes['nifty-bank']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['nifty-bank']?.dayChange || 0)} ({formatNumber(indexes['nifty-bank']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['nifty-financial-services']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>FINNIFTY</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['nifty-financial-services']?.value || 0)} <span className={getColoredStyle(indexes['nifty-financial-services']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['nifty-financial-services']?.dayChange || 0)} ({formatNumber(indexes['nifty-financial-services']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['sp-bse-bankex']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>BANKEX</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['sp-bse-bankex']?.value || 0)} <span className={getColoredStyle(indexes['sp-bse-bankex']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['sp-bse-bankex']?.dayChange || 0)} ({formatNumber(indexes['sp-bse-bankex']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}
                                 onClick={() => handleIndexWidget(indexes['nifty-midcap-select']?.indexId)}
                            >
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>NIFTYMIDSELECT</span>
                                    <span className={styles.value}>
                                        {formatNumber(indexes['nifty-midcap-select']?.value || 0)} <span className={getColoredStyle(indexes['nifty-midcap-select']?.dayChange || 0, styles)}>
                                                {formatNumber(indexes['nifty-midcap-select']?.dayChange || 0)} ({formatNumber(indexes['nifty-midcap-select']?.dayChangePerc || 0)}%)
                                            </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*stocks details*/}
                <div className={styles['stock-table-container']}>
                    <div className={styles['stock-header']}>
                        <h3>Top by Market Cap</h3>
                        <div>
                            <a href="#" className={styles.seeMore} onClick={handleSeeMoreButtonClick}>See more</a>
                            <button className={`${styles.refreshBtn} ${isRotatingStock ? styles.rotated : ''}`}  onClick={handleRefreshStockClick}  aria-label="Refresh stocks">
                                🔄
                            </button>
                        </div>
                    </div>

                    <div className={styles['stock-table']}>
                        <div className={styles['stock-table-head']}>
                            <span><strong>Company</strong></span>
                            <span className={styles['hide-mobile']}><strong>Sector</strong></span>
                            <span><strong>Score</strong></span>
                            <span><strong>Market Price</strong></span>
                            <span className={styles['hide-mobile']}><strong>Market Cap (In Cr)</strong></span>
                            <span className={styles['hide-mobile']}><strong>Dividend</strong></span>
                        </div>

                        {stockList.map((stock, index) => (
                            <div
                                className={styles['stock-table-row']}
                                key={index}
                                onClick={() => navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)))}
                            >
                                <div className={styles['stock-company']}>
                                    <div>{stock.name}</div>
                                </div>
                                <div className={`${styles['stock-sector']} ${styles['hide-mobile']}`}>
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
                        ))}
                    </div>

                    {/*/!* Pagination *!/*/}
                    {/*<div className={styles['pagination_container']}>*/}
                    {/*    <Pagination*/}
                    {/*        className="pagination-bar"*/}
                    {/*        siblingCount={1}*/}
                    {/*        currentPage={currentPage}*/}
                    {/*        totalCount={pageData?.total_count || 0}*/}
                    {/*        pageSize={pageData?.page_size || 10}*/}
                    {/*        onPageChange={setCurrentPage}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
}

export default Dashboard;
