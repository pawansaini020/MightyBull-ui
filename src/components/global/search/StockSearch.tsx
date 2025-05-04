import { useState, useEffect, useCallback } from "react";
import styles from "./StockSearch.module.scss";
import axiosInstance from "../../../helpers/axiosInstance.ts";
import SearchIcon from '../../../assets/ic-action-search-24.svg';

interface Stock {
    name: string;
    stockId: string;
}

interface StockSearchProps {
    onSearch: (stock: Stock) => void;
}

function StockSearch({ onSearch }: StockSearchProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Stock[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async (name: string) => {
        if (name.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await axiosInstance.get(
                `${import.meta.env.VITE_MIGHTYBULL_BASE_URL}/v1/api/stock/search?name=${encodeURIComponent(name)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = response.data.data;
            setSuggestions(data || []);
            setShowSuggestions(true);
        } catch (error) {
            setError("Failed to fetch suggestions. Please try again.");
            setSuggestions([]);
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSuggestions(query);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query, fetchSuggestions]);

    const handleSelect = (stock: Stock) => {
        setQuery("");
        setShowSuggestions(false);
        onSearch(stock);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className={styles["search-options"]} role="search">
            <div className={styles["search-wrapper"]}>
                <span className={styles["search-icon"]} aria-hidden="true">
                    <img src={SearchIcon} alt="" />
                </span>
                <input
                    className={styles["search-box"]}
                    type="text"
                    placeholder="Search Stock..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search stocks"
                    aria-expanded={showSuggestions}
                    aria-controls="suggestion-list"
                />
            </div>

            {showSuggestions && (
                <ul 
                    id="suggestion-list"
                    className={styles["suggestion-list"]}
                    role="listbox"
                >
                    {isLoading ? (
                        <li className={styles["suggestion-loading"]}>Loading...</li>
                    ) : error ? (
                        <li className={styles["suggestion-error"]}>{error}</li>
                    ) : suggestions.length === 0 ? (
                        <li className={styles["suggestion-empty"]}>No results found</li>
                    ) : (
                        suggestions.map((stock, index) => (
                            <li
                                key={`${stock.stockId}-${index}`}
                                className={styles["suggestion-item"]}
                                onClick={() => handleSelect(stock)}
                                role="option"
                                tabIndex={0}
                            >
                                {stock.name} ({stock.stockId})
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

export default StockSearch;
