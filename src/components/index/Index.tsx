import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Headers from "../layout/header/Header.tsx";
import styles from "./Index.module.scss";
import TabSwitcher from "../global/tab-switch/TabSwitcher.tsx";
import axiosInstance from "../../helpers/axiosInstance.ts";
// import {Routers} from "../../constants/AppConstants.ts";
import {formatNumber, getColoredStyle} from "../../helpers/StringTransform.ts";
import {Routers} from "../../constants/AppConstants.ts";

function Index() {

    const navigate = useNavigate();

    interface IndexItem {
        name: string;
        indexId: string;
        symbol: string;
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

    const TABS = [
        { key: 'INDIAN', label: 'Indian Indices' },
        { key: 'GLOBAL', label: 'Global Indices' }
    ];

    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [indexData, setIndexData] = useState<IndexItem[]>([]);

    const fetchIndexData = async (type: string) => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/index/widgets?index_type=${type}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            setIndexData(response.data.data);
        } catch (err) {
            console.error("Failed to fetch indices", err);
        }
    };

    const handleIndexWidget = (indexId : string) => navigate(Routers.IndexDetails.replace(':indexId', encodeURIComponent(indexId)));

    useEffect(() => {
        fetchIndexData(activeTab);
    }, [activeTab]);

    return (
        <>
            <Headers currentTab={null} />
            <div className={styles['main-div']}>
                <div className={styles['index-container']}>
                    <div className={styles['tabs-container']}>
                        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
                    </div>
                    <div className={styles['index-table']}>
                        <div className={styles['index-table-head']}>
                            <span className={styles['span-logo']}><strong></strong></span>
                            <span><strong>Index name</strong></span>
                            <span className={styles['span-right']}><strong>Last traded(1D)</strong></span>
                            <span className={styles['hide-mobile']}><strong>High</strong></span>
                            <span className={styles['hide-mobile']}><strong>Low</strong></span>
                            <span className={styles['hide-mobile']}><strong>Open</strong></span>
                            <span className={styles['hide-mobile']}><strong>Prev Close</strong></span>
                        </div>

                        {indexData.map((index, i) => (
                            <div className={styles['index-table-row']}
                                 key={i}
                                 onClick={() => handleIndexWidget(index.indexId)}
                            >
                                <div className={styles['index-row-logo']}><img src={index.logoUrl} className={styles['index-logo']} /></div>
                                <div className={styles['index-row']}>
                                    <div>{index.name}</div>
                                </div>

                                <div className={styles['index-row-right']}>
                                    <div>{formatNumber(index.value)}</div>
                                    <div>
                                        <span className={getColoredStyle(index?.dayChange || 0, styles)}>
                                            {formatNumber(index.dayChange)} ({formatNumber(index.dayChangePerc)}%)
                                        </span>
                                    </div>
                                </div>

                                <div className={`${styles['index-row']} ${styles['hide-mobile']}`}>
                                    <div>{formatNumber(index.high)}</div>
                                </div>

                                <div className={`${styles['index-row']} ${styles['hide-mobile']}`}>
                                    <div>{formatNumber(index.low)}</div>
                                </div>
                                <div className={`${styles['index-row']} ${styles['hide-mobile']}`}>
                                    <div>{formatNumber(index.open)}</div>
                                </div>
                                <div className={`${styles['index-row']} ${styles['hide-mobile']}`}>
                                    <div>{formatNumber(index.close)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
export default Index;