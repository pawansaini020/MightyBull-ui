import styles from './TabSwitcher.module.scss';

interface Tab {
    key: string;
    label: string;
}

interface TabSwitcherProps {
    tabs: Tab[];
    activeTab: string;
    setActiveTab: (key: string) => void;
}

function TabSwitcher({ tabs, activeTab, setActiveTab }: TabSwitcherProps) {
    return (
        <div className={styles.tabSwitcher}>
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`${styles.tab} ${tab.key === activeTab ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default TabSwitcher;
