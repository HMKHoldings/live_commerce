import { backup } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { openDatabase } from './models/database.mjs';
const directory=resolve(process.env.BACKUP_DIR||'backend/data/backups');
mkdirSync(directory,{recursive:true});
const db=openDatabase();
const path=resolve(directory,`store-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
try{await backup(db,path);console.log(`Database backup saved: ${path}`);}finally{db.close();}
