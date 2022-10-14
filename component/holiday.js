import {Alert, Calendar, Badge, Button,Radio} from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import 'moment/locale/zh-cn';
import moment from 'moment';
import React, {useState} from 'react';
import {useLoaderData} from 'react-router-dom'
import {queryRecords,set as holidaySet} from "../sie_db"
import {SIE_HOLIDAY} from '../constant'

export async function loader(){
    const holidays = await queryRecords();
    return { holidays };
}

const App = () => {
    const {holidays} =  useLoaderData();
    const [value, setValue] = useState(moment());
    const [selectedValue,setSelectedValue] = useState(moment());
    const [selectedList] = useState(new Map(holidays));
    const [isWorkday, setIsWorkday] = useState(null);

    // 头部时间切换
    const _headerRender = (value, onChange) => {
        let currentYear = value.format('YYYY年');
        let currentMonth = value.format('M月');
        const next = () => {
            let newMonth = moment(value).add(1, 'months');
            onChange(newMonth);
        };
        const prev = () => {
            let prevMonth = moment(value).subtract(1, 'months');
            onChange(prevMonth);
        };

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItem: 'cnter',
                    justifyContent: 'center',
                }}
            >
                <Radio.Group onChange={(e)=>{setIsWorkday(e.target.value)}} value={isWorkday}>
                    <Radio value={true}>班</Radio>
                    <Radio value={false}>休</Radio>
                    <Radio value={null}>清除</Radio>
                </Radio.Group>
                <Button
                    size="small"
                    type="text"
                    icon={<LeftOutlined/>}
                    onClick={() => prev()}
                />
                <div>
                    <span>{currentYear} </span>
                    <span>{currentMonth}</span>
                </div>
                <Button
                    size="small"
                    type="text"
                    icon={<RightOutlined/>}
                    onClick={() => next()}
                />
            </div>
        );
    };


    const onSelect = (newValue) => {
        const key = moment(newValue).format('YYYY-MM-DD');
        setSelectedValue(moment(newValue))
        setValue(moment(newValue));
        if (isWorkday === null) {
            if (selectedList.has(key) ) { selectedList.delete(key)}
        } else {
            selectedList.set(key, isWorkday);
        }
        holidaySet(SIE_HOLIDAY,selectedList)
        console.log("selectedList=", selectedList)
    };

    const onPanelChange = (newValue) => {
        setValue(newValue);
    };

    const dateCellRender = (value) => {

        let cell = selectedList.has(moment(value).format('YYYY-MM-DD'))

        return (


            cell ? <Badge status={selectedList.get(moment(value).format('YYYY-MM-DD')) ? "success" : "error"}
                          text={selectedList.get(moment(value).format('YYYY-MM-DD')) ? "班" : "休"}/> : ""

        );
    };


    return (
        <>
            <Alert message={`You selected date: ${selectedValue?.format('YYYY-MM-DD')}`}/>
            <Calendar value={value} onSelect={onSelect} onPanelChange={onPanelChange}
                      dateCellRender={value => dateCellRender(value)}
                      headerRender={({value, onChange}) =>
                          _headerRender(value, onChange)}


            />

        </>
    );
};

export default App;
