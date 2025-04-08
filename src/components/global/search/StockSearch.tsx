import { useState, useEffect } from "react";
import styles from "./StockSearch.module.scss";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import SearchIcon from '../../../assets/ic-action-search-24.svg';

function StockSearch({ onSearch } : {onSearch: any}) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token"); // assuming token is stored in localStorage

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 3) {
                fetchSuggestions(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400); // debounce delay

        return () => clearTimeout(timeoutId);
    }, [query]);

    const fetchSuggestions = async (name: string) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/search?name=${name}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("Stock widget: " + response.data);

            const data = response.data.data;

            setLoading(false);
            setSuggestions(data || []);
            setShowSuggestions(true);
        } catch (error) {
            setSuggestions([]);
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSelect = (stock: any) => {
        // setQuery(stock.name);
        setShowSuggestions(false);
        onSearch(stock);
    };

    return (
        <div className={styles["search-options"]}>
            <div className={styles["search-wrapper"]}>
                <span className={styles["search-icon"]}>
                    <img src={SearchIcon} alt="Search" />
                </span>
                <input
                    className={styles["search-box"]}
                    type="text"
                    placeholder="Search Stock..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {/*<button*/}
                {/*    className={styles["search-button"]}*/}
                {/*    onClick={() => {*/}
                {/*        const stock = suggestions.find(*/}
                {/*            (s) => s.name.toLowerCase() === query.toLowerCase()*/}
                {/*        );*/}
                {/*        if (stock) onSearch(stock);*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Search*/}
                {/*</button>*/}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className={styles["suggestion-list"]}>
                    {suggestions.map((stock, index) => (
                        <li
                            key={index}
                            className={styles["suggestion-item"]}
                            onClick={() => handleSelect(stock)}
                        >
                            {stock.name} ({stock.stockId})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default StockSearch;
