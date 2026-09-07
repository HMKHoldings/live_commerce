import React,{createContext,useContext,useEffect,useState,useCallback,useMemo} from 'react';
import fallback from './data/storefront.json';
import { assetPath } from './assetPath';
import { api,API_ENABLED } from './storeApi';
const Context=createContext(null);
const numericId=id=>/^\d+$/.test(String(id))?Number(id):id;
function normalize(data){
  const media=item=>Object.fromEntries(Object.entries(item).map(([key,value])=>[['image','inset','logo','poster','videoUrl'].includes(key)&&value?[key,assetPath(value)]:[key,value]][0]));
  const inventory=(data.products||[]).map(p=>({...media(p),id:numericId(p.id),price:Number(p.price),likes:Number(p.likes||0),comments:Number(p.comments||0)}));
  return {...data,inventory,products:inventory.filter(p=>p.platform||p.popular),groupDeals:inventory.filter(p=>p.target>0),bestProducts:inventory.filter(p=>p.best).sort((a,b)=>(a.rank||99)-(b.rank||99)),
    reviews:(data.reviews||[]).map(r=>({...media(r),productId:numericId(r.productId)})),
    collections:(data.collections||[]).map(c=>({...media(c),products:(c.products||[]).map(id=>inventory.find(p=>String(p.id)===String(id))).filter(Boolean)})),
    banners:(data.banners||[]).map(media), settings:media(data.settings?.find(s=>s.id==='site')||fallback.settings[0]),
  };
}
export function StoreProvider({children}){
  const [data,setData]=useState(fallback),[connected,setConnected]=useState(false),[error,setError]=useState('');
  const refresh=useCallback(async()=>{
    if(!API_ENABLED)return;
    try{setData(await api('/content'));setConnected(true);setError('');}catch(e){setConnected(false);setError(e.message);}
  },[]);
  useEffect(()=>{refresh();const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);window.addEventListener('storage',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('storage',refresh);};},[refresh]);
  const normalized=useMemo(()=>normalize(data),[data]);
  return <Context.Provider value={{...normalized,connected,error,refresh}}>{children}</Context.Provider>;
}
export const useStore=()=>useContext(Context);
