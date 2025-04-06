import { useDispatch, useSelector } from "react-redux";
import Styles from "./Filters.module.scss"
import MultiCheckbox from "../../../global/Multi-Checkbox/MultiCheckbox";
import { formatString } from "../../../../helpers/stringTransform";
import Button from "../../../global/button/Button";
import { configData } from "../../../../app/config";
import { useState } from "react";
import { filterData, setFilterSliceData } from "../../../../app/filterSlice";
import { ITicketFilter } from "../../../../interfaces/TicketFiltersInterface";


function Filters({resetPagination, offices}) {
    const {global:config} = useSelector(configData);
    const defaultValue = useSelector(filterData);
    const dispatch = useDispatch();
    const [appliedFilters, setAppliedFilters] = useState<ITicketFilter>({})

    function showFilters(filter:string, idx:number){
        if(!filter){
            return <></>
        }
        switch (filter) {
            case 'Status':
                return (
                    <MultiCheckbox
                        placeholder={filter}
                        options={filterOptions(config?.status)}
                        sendData={(data) => getFilterData(data, filter)}
                        value={getDefaultFilter(defaultValue, filter)}
                        key={idx}
                    />
                )
            case 'Priority':
                return (
                    <MultiCheckbox
                        placeholder={filter}
                        options={filterOptions(config?.priority)}
                        sendData={(data) => getFilterData(data, filter)}
                        value={getDefaultFilter(defaultValue, filter)}
                        key={idx}
                    />
                )
            case 'Office':
                if (offices?.length > 0) {
                    return (
                        <MultiCheckbox
                            placeholder={filter}
                            options={filterOptions(offices)}
                            sendData={(data) => getFilterData(data, filter)}
                            value={getDefaultFilter(defaultValue, filter)}
                            key={idx}
                            showSelectAll={true}
                        />
                    )
                } else {
                    return <></>
                }
            case 'TicketType':
                return (
                    <MultiCheckbox
                        placeholder={'Ticket Type'}
                        options={filterOptions(config?.ticketType)}
                        sendData={(data) => getFilterData(data, filter)}
                        value={getDefaultFilter(defaultValue, filter)}
                        key={idx}
                    />
                )
            case 'Date':
                return (
                    <DateInput
                        sendData={(data) => getFilterData(data, filter)}
                        value={getDefaultFilter(defaultValue, filter)}
                        key={idx}
                    />
                )
            case 'Assignee':
                return <MultiCheckboxSearch sendData={(data) => getFilterData(data, filter)} key={idx} placeholder={filter} />
        }
    }
    function getDefaultFilter(defaultFilters, type){
        switch(type){
            case "Status":
                const defaultStatus = defaultFilters?.Status;
                return defaultStatus?defaultStatus:[]
            case "Priority":
                const defaultPriority = defaultFilters?.Priority
                return defaultPriority?defaultPriority:[]
            case "TicketType":
                const defaultType = defaultFilters?.TicketType
                return defaultType?defaultType:[]
            case "Date":
                const defaultDate = defaultFilters?.Date
                return defaultDate?defaultDate:[]
            default:
                return []
        }
    }
    function getFilterData(data: any, type: string) {
        const existingFilter = appliedFilters[type]
        if (existingFilter) {
            setAppliedFilters((prev) => {
                const updatedFilters = {...prev};
                updatedFilters[type] = data;
                return updatedFilters;
            });
        } else {
            setAppliedFilters((prev) => {return {...prev, [type]: [...data] }});
        }
    }
    function filterOptions(array: string[]){
        const res = array.map(name =>({value: name, label:formatString(name)}))
        return res;
    }
    function applyFilterHandler(){
        dispatch(setFilterSliceData(appliedFilters))
        resetPagination()
    }
    return (
        <div className={Styles['filter-container']}>
            {
                config && config?.filters?.length ? config?.filters.map((filter, idx) => showFilters(filter, idx)):<></>
            }
            {config && config?.filters?.length ?<Button text={"Apply"} onClick={applyFilterHandler} tip="Apply Filters" className={Styles["apply-btn"]}/>:<></>}

        </div>
    )
}

export default Filters