
// src/App.jsx
// 목적: 좌측 사이드바 + 우측 콘텐츠 레이아웃을 구성하고
//       간단한 Admin / User 화면을 탭 전환으로 보여줍니다.
//       (주석을 자세히 달아 파악하기 쉽게 했습니다.)

import React, { useEffect, useMemo, useState } from 'react'
import './styles.css' // CSS 불러오기
import { apiBase, getWorks, addWork, getReviews, addReview, getRecs } from './api'

// [유틸] 작품 종류 표시용 레이블
const KIND_LABEL = { movie: '영화', drama: '드라마', webtoon: '웹툰' }

export default function App(){
  // 어떤 화면을 볼지 선택 (admin | user)
  const [view, setView] = useState('user')

  // 현재 선택된 작품 (user 화면에서 사용)
  const [selectedWork, setSelectedWork] = useState(null)

  // 좌측 사이드바에서 클릭하면 화면 전환
  const switchView = (v) => { setView(v) }

  return (
    <div className="app">
      {/* 왼쪽: 사이드바 */}
      <aside className="sidebar">
        <div className="brand">
          <div className="dot" />
          <div>
            <h1>공쥬와 프로젝트</h1>
            <small className="muted">영화·드라마·웹툰 추천</small>
          </div>
        </div>

        <div className="menu">
          <button className={view==='user'?'active':''} onClick={()=>switchView('user')}>사용자 화면</button>
          <button className={view==='admin'?'active':''} onClick={()=>switchView('admin')}>관리자 화면</button>
          <div className="card">
            <div className="muted" style={{fontSize:12, lineHeight:1.6}}>
              API Base: <br/><span className="badge">{apiBase}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 오른쪽: 콘텐츠 */}
      <main className="content">
        {view === 'admin'
          ? <AdminView onSelectWork={setSelectedWork} />
          : <UserView selectedWork={selectedWork} onSelectWork={setSelectedWork} />}
      </main>
    </div>
  )
}

/** Admin 화면
 *  - 작품 등록
 *  - 전체 목록 보기
 *  - (옵션) 선택한 작품에 더미 리뷰 추가 버튼
 */
function AdminView({ onSelectWork }){
  const [works, setWorks] = useState([])
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('movie')
  const [busy, setBusy] = useState(false)

  // 마운트되면 작품 목록 불러오기
  useEffect(() => { refresh() }, [])

  async function refresh(){
    const data = await getWorks()
    setWorks(data)
  }

  async function onCreate(e){
    e.preventDefault()
    if(!title) return
    setBusy(true)
    try{
      await addWork({ title, kind })
      setTitle(''); setKind('movie')
      await refresh()
    } finally{
      setBusy(false)
    }
  }

  async function addDummyReview(work){
    // 빠르게 확인하기 위한 더미 데이터
    const samples = [
      { user_name:'테스터A', rating:5, comment:'최고였어요!' },
      { user_name:'테스터B', rating:4, comment:'재밌게 봤습니다.' },
      { user_name:'테스터C', rating:3, comment:'호불호가 갈릴 듯.' },
    ]
    for(const s of samples){
      await addReview(work.id, s)
    }
    alert('더미 리뷰 3개 등록 완료')
  }

  return (
    <div>
      <section className="section">
        <h2>관리자: 작품 등록</h2>
        <form onSubmit={onCreate} className="row">
          <input placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} style={{minWidth:260}} />
          <select value={kind} onChange={e=>setKind(e.target.value)}>
            <option value="movie">영화</option>
            <option value="drama">드라마</option>
            <option value="webtoon">웹툰</option>
          </select>
          <button type="submit" disabled={busy}>{busy?'등록 중...':'등록'}</button>
          <button type="button" className="ghost" onClick={refresh}>새로고침</button>
        </form>
      </section>

      <section className="section">
        <h2>작품 목록</h2>
        <div className="grid2">
          {works.map(w=>(
            <div className="card" key={w.id}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div><span className="badge">{KIND_LABEL[w.kind]||w.kind}</span></div>
                  <strong style={{fontSize:16}}>{w.title}</strong>
                </div>
                <div className="row">
                  <button type="button" className="ghost" onClick={()=>onSelectWork(w)}>선택</button>
                  <button type="button" onClick={()=>addDummyReview(w)}>더미 리뷰</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/** User 화면
 *  - 추천 TOP5
 *  - 좌측에서 작품을 선택하면 해당 리뷰 목록/작성 폼
 */
function UserView({ selectedWork, onSelectWork }){
  const [works, setWorks] = useState([])
  const [reviews, setReviews] = useState([])
  const [recs, setRecs] = useState([])

  const [userName, setUserName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  // 최초 로딩: 작품/추천 불러오기
  useEffect(()=>{
    (async () => {
      const w = await getWorks()
      setWorks(w)
      const r = await getRecs()
      setRecs(r)
    })()
  }, [])

  // 작품을 선택하면 해당 리뷰 목록 로딩
  useEffect(()=>{
    (async ()=>{
      if(!selectedWork){ setReviews([]); return }
      const rs = await getReviews(selectedWork.id)
      setReviews(rs)
    })()
  }, [selectedWork])

  async function onAddReview(e){
    e.preventDefault()
    if(!selectedWork){ alert('먼저 작품을 선택하세요'); return }
    await addReview(selectedWork.id, {
      user_name: userName || '익명',
      rating: parseInt(rating),
      comment
    })
    setUserName(''); setRating(5); setComment('')
    const rs = await getReviews(selectedWork.id)
    setReviews(rs)
    const rr = await getRecs()
    setRecs(rr)
  }

  return (
    <div className="grid2">
      {/* 좌측: 작품/추천 */}
      <section className="section">
        <h2>추천 TOP 5</h2>
        <ol>
          {recs.map(x => (
            <li key={x.id}>[{KIND_LABEL[x.kind]||x.kind}] {x.title} — 평균 {Number(x.avg_rating).toFixed(2)}점 ({x.review_count}명)</li>
          ))}
        </ol>

        <h3>작품 목록</h3>
        <ul>
          {works.map(w => (
            <li key={w.id} style={{cursor:'pointer'}} onClick={()=>onSelectWork(w)}>
              <span className="badge" style={{marginRight:8}}>{KIND_LABEL[w.kind]||w.kind}</span>
              {w.title}
            </li>
          ))}
        </ul>
      </section>

      {/* 우측: 리뷰 */}
      <section className="section">
        <h2>한줄평</h2>
        {!selectedWork && <p className="muted">왼쪽에서 작품을 선택하세요.</p>}
        {selectedWork && (
          <>
            <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{margin:0}}>{selectedWork.title}</h3>
              <span className="badge">{KIND_LABEL[selectedWork.kind]||selectedWork.kind}</span>
            </div>

            <div className="card" style={{marginTop:10, marginBottom:10}}>
              <strong>리뷰 목록</strong>
              <ul>
                {reviews.map(r => (
                  <li key={r.id}>({r.rating}/5) {r.user_name}: {r.comment}</li>
                ))}
                {reviews.length===0 && <li className="muted">아직 등록된 리뷰가 없습니다.</li>}
              </ul>
            </div>

            <form onSubmit={onAddReview} className="row" style={{alignItems:'center'}}>
              <input placeholder="이름(선택)" value={userName} onChange={e=>setUserName(e.target.value)} />
              <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)} style={{width:80}} />
              <input placeholder="한줄평" value={comment} onChange={e=>setComment(e.target.value)} style={{minWidth:260, flex:1}} />
              <button type="submit">등록</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
