import styles from "./IndexWidgetDetails.module.scss";
import Headers from "../../layout/header/Header.tsx";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {formatNumber} from "../../../helpers/StringTransform.ts";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import {useParams} from "react-router-dom";
import {Page, Routers} from "../../../constants/AppConstants.ts";
import Pagination from "../../global/pagination/Pagination.tsx";

function IndexWidgetDetails() {

    interface IndexItem {
        name: string;
        indexId: string;
        symbol: string;
        type: string;
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
        companies: string[];
    }

    interface StockItem {
        stockId: string;
        name: string;
        sector: string;
        closePrice: number;
        change: string;
        isPositive: boolean;
        marketCap: number;
    }

    const {indexId} = useParams();
    const [index, setIndex] = useState<IndexItem | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<any>({})
    const [stockList, setStockList] = useState<StockItem[]>([])

    const navigate = useNavigate();

    const getPosition = (value: number, min: number, max: number) => {
        return ((value - min) / (max - min)) * 100;
    };

    const todayIndicator = getPosition(index?.value || 50, index?.low || 0, index?.high || 100);
    const weekIndicator = getPosition(index?.value || 75, index?.yearLowPrice || 0, index?.yearHighPrice || 100);

    const fetchIndexDetails = async (indexId : string | undefined) => {
        try {
            const response = await axiosInstance.get(`/v1/api/index/widget-details/${indexId}`);
            const indexWidget: IndexItem = response.data.data;
            setIndex(indexWidget);
        } catch (error) {
            console.error("Error occur while fetching index details: ", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchStocks = async (page: number, companies: string[] = []) => {
        try {
            const response = await axiosInstance.post(`/v1/api/stock/widgets?page_number=${page - 1}&page_size=${Page.default_size}`,
                companies
            );
            const data = response.data.data;
            const transformed: StockItem[] = data.data.map((item: any) => ({
                stockId: item.stockId,
                name: item.name,
                sector: item.sector,
                closePrice: item.closePrice,
                change: `(${item.yearlyLowPrice} - ${item.yearlyHighPrice})`,
                isPositive: item.closePrice >= (item.yearlyHighPrice + item.yearlyLowPrice)/2,
                marketCap: item.marketCap
            }));

            setStockList(transformed);
            setPageData(data.pagination);
        } catch (error) {
            console.error("Error fetching stocks", error);
        }
    };

    useEffect(() => {
        fetchIndexDetails(indexId);
    }, [indexId]);

    useEffect(() => {
        if (!index?.companies) return;

        fetchStocks(currentPage, index.companies);
    }, [index?.companies, currentPage]);

    if (loading) {
        return (
            <>
                <Headers />
                <div className={styles['index-title']}>Loading...</div>
            </>
        );
    }
    if (!index || !index.indexId) {
        return (
            <>
                <Headers />
                <div className={styles['main-div']}>
                    Stock data not found.
                </div>
            </>
        );
    }

    return (
        <>
            <Headers />
            <div className={styles['main-div']}>
                <div className={styles['index-details']}>
                    <div className={styles['index-title']}>
                        <h3>{index?.name}
                            {/*Performance <span title="Performance info"> ℹ️</span>*/}
                        </h3>
                    </div>
                    <div className={styles['index-info-div']}>
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Current Value</span>
                                    <span className={styles.value}>{formatNumber(index.value)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Today's Open</span>
                                    <span className={styles.value}>{formatNumber(index.open)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Previous Close</span>
                                    <span className={styles.value}>₹ {formatNumber(index.close)} Cr.</span>
                                </div>
                            </div>
                        </div>

                        {/* Today */}
                        <div className={styles["range-row"]}>
                            <div>
                                <div className={styles.label}>Today's Low</div>
                                <div className={styles.value}>{formatNumber(index?.low || 0)}</div>
                            </div>
                            <div className={styles["range-bar"]}>
                                <div className={styles.triangle}
                                    style={{ left: `${todayIndicator}%` }}
                                ></div>
                            </div>
                            <div className="text-right">
                                <div className={styles.label}>Today's High</div>
                                <div className={styles.value}>{formatNumber(index?.high || 0)}</div>
                            </div>
                        </div>

                        {/* 52 Week */}
                        <div className={styles["range-row"]}>
                            <div>
                                <div className={styles.label}>52W Low</div>
                                <div className={styles.value}>{formatNumber(index?.yearLowPrice || 0)}</div>
                            </div>
                            <div className={styles["range-bar"]}>
                                <div className={styles.triangle}
                                    style={{ left: `${weekIndicator}%` }}
                                ></div>
                            </div>
                            <div>
                                <div className={styles.label}>52W High</div>
                                <div className={styles.value}>{formatNumber(index?.yearHighPrice || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                { index.type == 'INDIAN' && index.companies.length !=0 && (
                    <div className={styles['index-details']}>
                        <div className={styles['index-title']}>
                            <h3>{index?.name} Companies</h3>
                        </div>
                        <div className={styles['stock-table']}>
                            <div className={styles['stock-table-head']}>
                                <span><strong>Company</strong></span>
                                <span className={styles['hide-mobile']}><strong>Market Cap (In Cr)</strong></span>
                                <span className={styles['span-right']}><strong>Market Price </strong></span>
                                <span className={styles['hide-mobile']}><strong>Sector</strong></span>
                            </div>

                            {stockList.map((stock, index) => (
                                <div
                                    className={styles['stock-table-row']}
                                    key={index}
                                    onClick={() => navigate(Routers.StockWidgetDetails.replace(':stockId', encodeURIComponent(stock.stockId)))}
                                >
                                    <div className={styles['row-text']}>
                                        <div>{stock.name}</div>
                                    </div>
                                    <div className={`${styles['row-text']} ${styles['hide-mobile']}`}>
                                        <div>{formatNumber(stock.marketCap)}</div>
                                    </div>
                                    <div className={styles['row-text-right']}>
                                        <div>{formatNumber(stock.closePrice)}</div>
                                        <div className={stock.isPositive ? styles.positive : styles.negative}>
                                            {stock.change}
                                        </div>
                                    </div>
                                    <div className={`${styles['row-text']} ${styles['hide-mobile']}`}>
                                        <div>{stock.sector}</div>
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
                )}
            </div>
        </>
    )
}
export default IndexWidgetDetails;