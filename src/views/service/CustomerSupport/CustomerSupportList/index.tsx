import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import './style.css'
import { BoardListItem } from 'src/types';
import { useNavigate } from 'react-router';
import { AUTH_ABSOLUTE_PATH, COUNT_PER_PAGE, COUNT_PER_SECTION, CUSTOMER_SUPPORT_ABSOLUTE_PATH, CUSTOMER_SUPPORT_DETAIL_ABSOLUTE_PATH, CUSTOMER_SUPPORT_WRITE_ABSOLUTE_PATH, HOME_ABSOLUTE_PATH } from 'src/constants';
import useUserStore from 'src/stores/user.store';
import { useCookies } from 'react-cookie';
import { GetBoardListResponseDto } from 'src/apis/board/dto/response';
import ResponseDto from 'src/apis/response.dto';
import { getBoardListRequest } from 'src/apis/board';

//                    component                    //
function ListItem ({ 
    receptionNumber, 
    status, 
    title, 
    writerId, 
    writeDatetime,  
}: BoardListItem) {

    //                    function                    //
    const navigator = useNavigate();

    //                    event handler                    //
    const onClickHandler = () => navigator(CUSTOMER_SUPPORT_DETAIL_ABSOLUTE_PATH(receptionNumber));

    //                    render                    //
    return (
        <div className='cs-list-table-tr' onClick={onClickHandler}>
            <div className='cs-list-table-reception-number'>{receptionNumber}</div>
            <div className='cs-list-table-status'>
                {status ? 
                <div className='cs-status-disable-button'>완료</div> :
                <div className='cs-status-primary-button'>접수</div>
                }
            </div>
            <div className='cs-list-table-title' style={{ textAlign: 'left' }}>{title}</div>
            <div className='cs-list-table-writer-id'>{writerId}</div>
            <div className='cs-list-table-write-date'>{writeDatetime}</div>
        </div>
    );
}


//                    component                    //
export default function CustomerSupportList() {
    //                    state                    //
    const {loginUserRole} = useUserStore();

    const [cookies] = useCookies();

    const [boardList, setBoardList] = useState<BoardListItem[]>([]);
    const [viewList, setViewList] = useState<BoardListItem[]>([]);
    const [totalLength, setTotalLength] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageList, setPageList] = useState<number[]>([1]);
    const [totalSection, setTotalSection] = useState<number>(1);
    const [currentSection, setCurrentSection] = useState<number>(1);
    const [isToggleOn, setToggleOn] = useState<boolean>(false);

    //                    function                    //
    const navigator = useNavigate();

    const changePage = (boardList: BoardListItem[], totalLength: number) => {
        if (!currentPage) return;
        const startIndex = (currentPage - 1) * COUNT_PER_PAGE;
        let endIndex = currentPage * COUNT_PER_PAGE;
        if (endIndex > totalLength - 1) endIndex = totalLength;
        const viewList = boardList.slice(startIndex, endIndex);
        setViewList(viewList);
    };

    const changeSection = (totalPage: number) => {
        if (!currentSection) return;
        const startPage = (currentSection * COUNT_PER_SECTION) - (COUNT_PER_SECTION - 1);
        let endPage = currentSection * COUNT_PER_SECTION;
        if (endPage > totalPage) endPage = totalPage;
        const pageList: number[] = [];
        for (let page = startPage; page <= endPage; page++) pageList.push(page);
        setPageList(pageList);
    };

    const changeBoardList = (boardList: BoardListItem[]) => {
        if (isToggleOn) boardList = boardList.filter(board => !board.status);
        setBoardList(boardList);

        const totalLength = boardList.length;
        setTotalLength(totalLength);

        const totalPage = Math.floor((totalLength - 1) / COUNT_PER_PAGE) + 1;
        setTotalPage(totalPage);

        const totalSection = Math.floor((totalPage - 1) / COUNT_PER_SECTION) + 1;
        setTotalSection(totalSection);

        changePage(boardList, totalLength);

        changeSection(totalPage);
    };

    const getBoardListResponse = (result: GetBoardListResponseDto | ResponseDto | null) => {
        const message = 
            !result ? '서버에 문제가 있습니다.' :
            result.code === 'AF' ? '인증에 실패했습니다.' : 
            result.code === 'AF' ? '권한이 없습니다.' : 
            result.code === 'FUF' ? '파일 업로드에 실패했습니다.' : 
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if (!result || result.code !== 'SU') {
            alert(message);
            if (result?.code === 'AF') navigator(AUTH_ABSOLUTE_PATH);
            return;
        }

        const { boardList } = result as GetBoardListResponseDto;
        changeBoardList(boardList);

        setCurrentPage(!boardList.length ? 0 : 1);
        setCurrentSection(!boardList.length ? 0 : 1);
    };

    //                    event handler                    //
    const onWriteButtonClickHandler = () => {
        if (loginUserRole !== 'ROLE_USER') return;
        navigator(CUSTOMER_SUPPORT_WRITE_ABSOLUTE_PATH);
    };

    const onToggleClickHandler = () => {
        if (loginUserRole !== 'ROLE_ADMIN') return;
        setToggleOn(!isToggleOn);
    };

    const onPageClickHandler = (page: number) => {
        setCurrentPage(page);
    };

    const onPreSectionClickHandler = () => {
        if (currentSection <= 1) return;
        setCurrentSection(currentSection - 1);
        setCurrentPage((currentSection - 1) * COUNT_PER_SECTION);
    };

    const onNextSectionClickHandler = () => {
        if (currentSection === totalSection) return;
        setCurrentSection(currentSection + 1);
        setCurrentPage(currentSection * COUNT_PER_SECTION + 1);
    };

    const onNextPageClickHandler = () => {
        if (currentPage === totalPage) return;
        setCurrentPage(currentPage + 1);
    }

    const onPrePageClickHandler = () => {
        if (currentPage <= 1) return;
        setCurrentPage(currentPage - 1);
    }

    //                    effect                    //
    useEffect(() => {
        if (!cookies.accessToken) return;
        getBoardListRequest(cookies.accessToken).then(getBoardListResponse);
    }, [isToggleOn]);

    useEffect(() => {
        if (!boardList.length) return;
        changePage(boardList, totalLength);
    }, [currentPage]);

    useEffect(() => {
        if (!boardList.length) return;
        changeSection(totalPage);
    }, [currentSection]);

    //                    render                    //
    const toggleClass = isToggleOn ? 'toggle-active' : 'toggle';
    return (
        <div id='cs-wrapper'>
            <div className='cs-image'>문의게시판</div>
            <div className= 'cs-list-wrapper'>
                {/* <div className='cs-list-size-text'>전체 <span className='emphasis'>{totalLength}건</span> | 페이지 <span className='emphasis'>{currentPage}/{totalPage}</span></div> */}
                <div className='cs-list-top'>
                    {loginUserRole === 'ROLE_USER' ?
                    <div className='customer-support-button' onClick={onWriteButtonClickHandler}>글쓰기</div> :
                    <div className='cs-list-top-admin-container'>
                        <div className={toggleClass} onClick={onToggleClickHandler}></div>
                        <div className='cs-list-top-admin-text'>미완료 보기</div>
                    </div>
                    }
                </div>
                <div className='cs-list-table'>
                    <div className='cs-list-table-th'>
                        <div className='cs-list-table-reception-number'>접수번호</div>
                        <div className='cs-list-table-status'>상태</div>
                        <div className='cs-list-table-title'>제목</div>
                        <div className='cs-list-table-writer-id'>작성자</div>
                        <div className='cs-list-table-write-date'>작성일</div>
                    </div>
                    {viewList.map(item => <ListItem {...item} />)}
                </div>
                <div className='cs-list-bottom'>
                    <div className='cs-list-pagination'>
                        <div className='cs-list-page-pre-section' onClick={onPreSectionClickHandler}></div>
                        <div className='cs-list-page-left' onClick={onPrePageClickHandler}></div>
                        <div className='cs-list-page-box'>
                            {pageList.map(page => page === currentPage ? <div className='cs-list-page-active'>{page}</div> : 
                            <div className='cs-list-page' onClick={() => onPageClickHandler(page)}>{page}</div>
                            )}
                        </div>
                        <div className='cs-list-page-right' onClick={onNextPageClickHandler}></div>
                        <div className='cs-list-page-next-section' onClick={onNextSectionClickHandler}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
