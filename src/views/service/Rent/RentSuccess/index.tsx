import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router'

import { useUserStore } from 'src/stores';

import ResponseDto from 'src/apis/response.dto';
import { getReserveRequest } from 'src/apis/payment';
import { ReserveResponseDto } from 'src/apis/payment/dto/response';

import { HOME_ABSOLUTE_PATH, MYPAGE_RENT_DETAIL_ABSOLUTE_PATH } from 'src/constants';

import './style.css'

//                    component                    //
export default function RentSuccess() {

    //                    state                    //
    const [cookies] = useCookies();

    const { loginUserId } = useUserStore();

    const { rentNumber } = useParams();
    const [rentPlace, setRentPlace] = useState<string>('');
    const [rentalPeriod, setRentalPeriod] = useState<string>('');
    const [reserveUserId, setReserveUserId] = useState<string>('');
    const [rentTotalPrice, setRentTotalPrice] = useState<number>(0);

    //                    function                    //
    const navigator = useNavigate();

    const getReserveResponse = (result: ReserveResponseDto | ResponseDto | null) => {
        const message = 
            !result ? '서버에 문제가 있습니다.' :
            result.code === 'VF' ? '유효하지 않은 아이디입니다.' :
            result.code === 'AF' ? '로그인 후 결제를 진행해주세요.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';
        
        if (!result || result.code !== 'SU') {
            alert(message);
            return;
        }

        const { userId, rentalPeriod, rentPlace, rentTotalPrice } = result as ReserveResponseDto;
        setReserveUserId(userId);
        setRentPlace(rentPlace);
        setRentTotalPrice(rentTotalPrice);
        setRentalPeriod(rentalPeriod);

        completePaymentRequest(Number(rentNumber), rentTotalPrice);
    };

    //                    event handler                    //
    const onMainClickHandler = () => navigator(HOME_ABSOLUTE_PATH);
    const onRentClickHandler = () => navigator(MYPAGE_RENT_DETAIL_ABSOLUTE_PATH);

    const completePaymentRequest = (rentNumber : number, paymentAmount : number) => {
        fetch('/complete_payment',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rentNumber: rentNumber,
                paymentAmount: paymentAmount,
            }),
        })
        .then(response => response.json())
    };

    //                    effect                    //
    useEffect(() => {
        if (!loginUserId || !cookies.accessToken) return;
        getReserveRequest(loginUserId, cookies.accessToken).then(getReserveResponse);
    }, [loginUserId]);

    //                    render                    //
    return (
        <div id='rent-success-wrapper'>
            <div className='rent-success-container'>
                <div className='rent-success-ment'>대여가 완료되었습니다.</div>
                <div className='rent-success-title'>나의 대여정보</div>
                <div className='rent-success-constant'>
                    <div className='rent-success-name'>
                        <div>대여자</div>
                        <div>{reserveUserId}</div>
                    </div>
                    <div className='rent-success-datetime'>
                        <div>대여기간</div>
                        {rentalPeriod.split('~').map((period, index) => (
                                <div key={index} className='rent-success-period'>{period.trim()}</div>
                            ))}
                    </div>
                    <div className='rent-success-spot'>
                        <div>대여지점</div>
                        <div>{rentPlace}</div>
                    </div>
                    <div className='rent-success-sum'>
                        <div>대여요금</div>
                        <div>{rentTotalPrice}</div>
                    </div>
                </div>
                <div className='rent-success-button'>
                    <div className='customer-support-button' onClick={onMainClickHandler}>메인으로 가기</div>
                    <div className='customer-support-button' onClick={onRentClickHandler}>대여 확인</div>
                </div>
            </div>
        </div>
    );
};