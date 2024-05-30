import { useState } from 'react';
import './style.css';
import { useReturnSelectStore, useReturnSiteShowStore, useReturnSiteStore } from 'src/stores';

//                    interface                    //
interface Prop {
    value: string;
    onChange: (value: string) => void;
}

//                    component                    //
export default function ReturnSiteSelectBox({ value, onChange }: Prop) {
    const RentSiteListItem = [
        { name: '서울', value: 'SEOUL' },
        { name: '부산', value: 'BUSAN' }
    ];

    //                    state                    //
    const { returnShow, setReturnShow } = useReturnSiteShowStore();
    const { returnSelectedItem, setReturnSelectedItem } = useReturnSelectStore();
    const { setReturnSite } = useReturnSiteStore();

    //                    event handler                    //
    const onButtonClickHandler = () => {
        setReturnShow(!returnShow);
    };

    const onItemClickHandler = (value: string) => {
        setReturnSelectedItem(value);
        onChange(value);
        setReturnSite(value);
        setReturnShow(true);
    };

    //                    render                    //
    return (
        <div className='select-box'>
            <div className='select-item-title'>반납지점</div>
            <div className={returnShow ? 'select-close-button' : 'select-open-button'} onClick={onButtonClickHandler}></div>
            {returnShow &&
                <div className='select-list'>
                    {RentSiteListItem.map((item) =>
                        <div
                            key={item.value}
                            className={returnSelectedItem === item.value ? 'select-list-item-selected' : 'select-list-item-box'}
                            onClick={() => onItemClickHandler(item.value)}>
                            <div className='select-item'>{item.name}</div>
                        </div>
                    )}
                </div>
            }
        </div>
    );
}