import readline from 'node:readline/promises';
import { Writable } from 'node:stream';
import { openDatabase,createAdmin } from './models/database.mjs';
const username=process.argv[2];
if(!username) { console.error('Usage: npm run admin:create -- your-username'); process.exit(1); }
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted) process.stdout.write(chunk,encoding); callback();}});
const prompt=readline.createInterface({input:process.stdin,output,terminal:true});
process.stdout.write('New password (6-128 characters, hidden): ');
muted=true;
const password=await prompt.question('');
process.stdout.write('\nConfirm password: ');
const confirm=await prompt.question('');
prompt.close();
process.stdout.write('\n');
if(password!==confirm) {console.error('Passwords do not match.');process.exit(1);}
const db=openDatabase();
try {const updated=createAdmin(db,username,password);console.log(updated?'Admin password updated.':'Admin account created.');} catch(error){console.error(error.message);process.exitCode=1;} finally{db.close();}
