import React, { useEffect, useState } from 'react';
import './style.css';
import RentSiteSelectBox from 'src/components/Selectbox/RentSiteSelectBox';
import { useCookies } from 'react-cookie';
import ReturnSiteSelectBox from 'src/components/Selectbox/ReturnSiteSelectBox';
import { useRentDateStore, useRentSiteStore,  useUserStore } from 'src/stores/index';
import ReactDatePicker from 'src/components/DateTimebox';
import { HOME_ABSOLUTE_PATH } from 'src/constants';
import { useNavigate } from 'react-router';
import ResponseDto from 'src/apis/response.dto';
import { dateFormat} from 'src/utils';
import RentSelectBox from 'src/components/Selectbox/RentItemSelectBox';
import { getAdminRentListRequest, getRentPossibilityListRequest } from 'src/apis/device';
import { DeviceListItem } from 'src/types';
import { GetDeviceListResponseDto } from 'src/apis/device/dto/response';
import Basket, { Payment } from 'src/components/BasketPayment';





//                    component                    //
export default function Rent() {

    //                    state                    //
    const { loginUserRole } = useUserStore();
    const [rentSelect, setRentSelect] = useState<string>('');
    const [returnSelect, setReturnSelect] = useState<string>('');
    const [rentItem, setRentItem] = useState<string>('');
    const { rentSite, setRentSite } = useRentSiteStore();
    const [cookies] = useCookies();
    const { startDate, endDate } = useRentDateStore();
    const [ place, setPlace ] = useState<string>(rentSite);
    const [rentViewList, setRentViewList] = useState<DeviceListItem[]>([]);

    //                    function                    //
    const navigator = useNavigate();
    const getDeviceListResponse = (result: GetDeviceListResponseDto | ResponseDto | null) => {
        const message =
            !result ? '서버에 문제가 있습니다.' :
            result.code === 'VF' ? '유효하지 않은 정보입니다.' :
            result.code === 'AF' ? '권한이 없습니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if (!result || result.code !== 'SU') {
            alert(message);
            if (result?.code === 'AF') navigator(HOME_ABSOLUTE_PATH);
            return;
        }

        const { deviceList } = result as GetDeviceListResponseDto;
        setRentViewList(deviceList);

    };

    const getAdminDeviceListResponse = (result: GetDeviceListResponseDto | ResponseDto | null) => {
        const message =
            !result ? '서버에 문제가 있습니다.' :
            result.code === 'VF' ? '유효하지 않은 정보입니다.' :
            result.code === 'AF' ? '관리자가 아닙니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if (!result || result.code !== 'SU') {
            alert(message);
            if (result?.code === 'AF') navigator(HOME_ABSOLUTE_PATH);
            return;
        }

        const { deviceList } = result as GetDeviceListResponseDto;
        setRentViewList(deviceList);
    };

    //                    event handler                    //
    const onRentChangeHandler = (rentSelect: string) => {
        setRentSelect(rentSelect);
        if (loginUserRole !== 'ROLE_USER') return;
        setPlace(rentSelect);
    };
    const onReturnChangeHandler = (returnSelect: string) => {
        setReturnSelect(returnSelect);
    };
    const onRentItemChangeHandler = (rentItem: string) => {
        setRentItem(rentItem);
    };
    const searchButtonClickHandler = () => {
        if (!cookies.accessToken) return;

        if (loginUserRole === 'ROLE_USER') {
            if (!startDate || !endDate || !place) {
                alert('대여지점, 대여날짜, 반납날짜를 선택해주세요');
                return;
            }
            const start = dateFormat(startDate);
            const end = dateFormat(endDate);
            setRentSite(place);
            getRentPossibilityListRequest(start, end, place, cookies.accessToken).then(getDeviceListResponse);
        } 
        
        if (loginUserRole === 'ROLE_ADMIN') {
            getAdminRentListRequest(cookies.accessToken).then(getAdminDeviceListResponse);
        }
    };

    //                    render                    //
    return (
        <div id='rent-wrapper'>
            <div className='rent-left-box'>
                {loginUserRole === 'ROLE_USER' ?
                <div className='rent-left-side'>
                    <div className='rent-left-side-site'>
                        <RentSiteSelectBox value={rentSelect} onChange={onRentChangeHandler} />
                    </div>
                    <div className='rent-left-side-site'>
                        <ReturnSiteSelectBox value={returnSelect} onChange={onReturnChangeHandler} />
                    </div>
                    <div className='rent-left-side-date'>
                        <ReactDatePicker />
                        {/* <TestCalenderApp /> */}
                    </div>
                    <div >
                    {loginUserRole === 'ROLE_USER' ?
                    <div className='button-class-role' onClick={searchButtonClickHandler}>검색하기</div> :
                    <div></div>
                    } 
                </div>
                </div> : <></>
                }
                
            </div>
            <div className='rent-item'>
                <div >
                    {loginUserRole === 'ROLE_ADMIN' ?
                    <div className='button-class-role' onClick={searchButtonClickHandler}>새로고침</div> :
                    <div></div>
                    } 
                </div>
                <RentSelectBox value={rentItem} onChange={onRentItemChangeHandler} rentViewList={rentViewList} setRentViewList={setRentViewList} />
                
            </div>
            {loginUserRole === 'ROLE_USER' ? 
            <div className='rent-right-side'>
                <div className='rent-right-side-top-basket'>장바구니</div>
                <div className='rent-right-side-basket'>
                    <Basket />
                </div>
                <div className='rent-right-side-payment'>
                    <Payment />
                </div>
            </div> : <></>
            }
        </div>
    );
}
