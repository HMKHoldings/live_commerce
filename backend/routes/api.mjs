import {recoveryController} from '../controllers/recovery.mjs';
import {customerController} from '../controllers/customer.mjs';
import {authController} from '../controllers/auth.mjs';
import {contentController} from '../controllers/content.mjs';
import {ordersController} from '../controllers/orders.mjs';
import {adminController} from '../controllers/admin.mjs';
const routes = [
 {matches:p=>p.startsWith('/api/customer/recovery/'),handle:recoveryController},
 {matches:p=>p.startsWith('/api/customer/'),handle:customerController},
 {matches: (p,m)=>p==='/api/auth/login'&&m==='POST'||p==='/api/auth/me'||p==='/api/auth/logout'&&m==='POST', handle:authController},
 {matches: (p,m)=>p==='/api/content'&&m==='GET'||['/api/contact','/api/questions','/api/reviews'].includes(p)&&m==='POST', handle:contentController},
 {matches: (p,m)=>p==='/api/orders'&&m==='POST',handle:ordersController},
 {matches: p=>p.startsWith('/api/admin/'),handle:adminController},
];
export async function dispatchApi(context) {
 const route=routes.find(r=>r.matches(context.path,context.req.method));
 if(!route)return false;
 await route.handle(context);
 return true;
}
