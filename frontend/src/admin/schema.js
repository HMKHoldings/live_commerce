export const modules = [
  ['dashboard','대시보드'],['products','상품 관리'],['banners','메인 배너'],['promos','프로모션 배너'],['collections','추천 컬렉션'],['categories','카테고리 메뉴'],['orders','주문 관리'],['reviews','리뷰 관리'],['questions','상품 문의'],['notices','공지사항'],['policies','회사 / 정책 안내'],['settings','사이트 설정'],['audit','활동 기록'],
];
export const labels={name:'상품명',title:'제목',desc:'상품 설명',description:'설명',price:'판매가격 (원)',originalPrice:'정상가격 (원)',discount:'할인율 (%)',stock:'재고',category:'카테고리',status:'게시 상태',image:'이미지',logo:'로고',videoUrl:'동영상 URL',poster:'동영상 썸네일',platform:'SNS 채널',views:'표시 조회수',likes:'표시 찜 수',comments:'표시 댓글 수',rating:'평점',reviews:'표시 리뷰 수',option:'상품 구성 / 옵션',origin:'원산지 / 제조사',specifications:'상세 고시',shipping:'배송 안내',endsAt:'공동구매 종료일 (ISO)',participants:'참여 인원',target:'목표 인원',best:'베스트 상품 표시',popular:'인기 상품 표시',rank:'베스트 순위',order:'노출 순서',products:'상품 ID 목록 (쉼표로 구분)',items:'하위 메뉴 (줄마다 하나)',theme:'디자인 테마',cta:'버튼 문구',action:'버튼 동작',eyebrow:'상단 문구',label:'배너 이름',inset:'보조 이미지',imageAlt:'이미지 설명',insetAlt:'보조 이미지 설명',artTitle:'이미지 제목',artEyebrow:'이미지 상단 문구',body:'내용',date:'작성일',author:'작성자',productId:'상품 ID',productName:'상품명 표시',answer:'관리자 답변',brandName:'브랜드 이름',tagline:'브랜드 슬로건',phone:'고객센터 전화',hours:'운영시간',company:'회사명',companyInfo:'사업자 정보',address:'주소',copyright:'저작권 문구',showLive:'SNS 섹션 표시',showPopular:'인기 상품 표시',showGroupDeals:'공동구매 표시',showCollections:'컬렉션 표시',showReviews:'리뷰 표시',showBest:'베스트 표시',tracking:'배송 추적 정보'};
export const defaults={
  products:{name:'',desc:'',price:0,originalPrice:0,discount:0,stock:0,category:'식품',status:'draft',image:'',option:'',origin:'',specifications:'',shipping:'',platform:'',videoUrl:'',poster:'',views:'0',likes:0,comments:0,popular:false,best:false,rank:1,order:0,target:0,participants:0,endsAt:''},
  banners:{label:'새 배너',title:'',description:'',eyebrow:'',cta:'둘러보기',category:'전체',theme:'fresh',image:'',imageAlt:'',inset:'',insetAlt:'',artTitle:'',artEyebrow:'',status:'draft',order:0},
  promos:{title:'',description:'',cta:'바로가기',theme:'green',action:'sustainable',image:'',status:'draft',order:0},
  collections:{title:'',desc:'',cta:'바로가기',theme:'peach',image:'',products:[],status:'draft',order:0},
  categories:{title:'',category:'',icon:'living',items:[],status:'draft',order:0},
  notices:{title:'',body:'',date:new Date().toISOString().slice(0,10),status:'draft',order:0},
  policies:{title:'',body:'',status:'published'},
  reviews:{productId:'',productName:'',title:'',body:'',author:'',rating:5,image:'',status:'pending'},
  questions:{productId:'',title:'',body:'',answer:'',date:new Date().toISOString().slice(0,10),status:'pending'},
};
export const numeric=new Set(['price','originalPrice','discount','stock','likes','comments','rating','rank','order','target','participants']);
export const media=new Set(['image','logo','inset','poster','videoUrl']);
export const large=new Set(['body','description','desc','specifications','shipping','answer','title','companyInfo']);
