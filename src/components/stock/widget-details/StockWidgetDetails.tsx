import Headers from "../../layout/header/Header.tsx";
import styles from "./StockWidgetDetails.module.scss";
import {useEffect, useState} from "react";
import {useParams} from 'react-router-dom';
import axiosInstance from "../../../helpers/axiosInstance.ts";
import { formatNumber } from "../../../helpers/StringTransform.ts";

function StockWidgetDetails() {

    interface StockWidget {
        stockId: string;
        name: string;
        sector: string;
        marketCap: number;
        currentPrice: number;
        high: number;
        low: number;
        stockPE: number;
        dividendYield: number;
        roce: number;
        roe: number;
        score: number;
        prosList: string[];
        consList: string[];
    }

    const { stockId } = useParams();
    const [stock, setStock] = useState<StockWidget | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStockDetails = async (stockId: string | undefined) => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/widget-details/${stockId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget details: " + response.data);
            const stockWidget: StockWidget = response.data.data;
            setStock(stockWidget);
        } catch (error) {
            console.error('Failed to fetch stock details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockDetails(stockId);
    }, [stockId]);

    if (loading) {
        return (
            <>
                <Headers />
                <div>Loading...</div>
            </>
        );
    }
    if (!stock) {
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
                <div className={styles['stock-details']}>
                    <div className={styles['stock-title']}>
                        <h3>{stock.name}</h3>
                    </div>
                    <div className={styles['stock-info-div']}>
                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Score</span>
                                    <span className={styles.value}>{formatNumber(stock.score)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Stock P/E</span>
                                    <span className={styles.value}>{formatNumber(stock.stockPE)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Market Cap</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.marketCap)} Cr.</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Current Price</span>
                                    <span className={styles.value}>{formatNumber(stock.currentPrice)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Low</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.low)}</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>High</span>
                                    <span className={styles.value}>₹ {formatNumber(stock.high)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>ROCE</span>
                                    <span className={styles.value}>{formatNumber(stock.roce)} %</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>ROE</span>
                                    <span className={styles.value}>{formatNumber(stock.roe)} %</span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.flexRow}>
                                    <span className={styles.label}>Dividend Yield</span>
                                    <span className={styles.value}>{formatNumber(stock.dividendYield)} %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles['pros-cons-container']}>
                    <div className={styles['pros-cons-container-title']}>
                        <h3>Fundamental Analysis</h3>
                    </div>
                    <div className={styles['card-grid']}>
                        {/* Pros */}
                        <div className={styles['card-pros']}>
                            <h3 className={styles['card-heading']}>PROS</h3>
                            <ul className={styles['card-list']}>
                                {stock.prosList.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Cons */}
                        <div className={styles['card-cons']}>
                            <h3 className={styles['card-heading']}>CONS</h3>
                            <ul className={styles['card-list']}>
                                {stock.consList.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className={styles['disclaimer']}>
                        * The pros and cons are machine generated.{" "}
                        <div className={styles["tooltip-wrapper"]}>
                            <span className={styles["tooltip-icon"]}>ⓘ</span>
                            <div className={styles["custom-tooltip"]}>
                                These are AI generated insights. Please exercise caution and do your own analysis.
                            </div>
                        </div>
                    </p>
                </div>
            </div>
        </>
    );
}

export default StockWidgetDetails;