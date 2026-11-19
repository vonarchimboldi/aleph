/* Shared full-file upload path for the subject workspace and packet reader. */
(()=>{
 const secret=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
 const mime=file=>file.type||(/\.pdf$/i.test(file.name)?'application/pdf':/\.png$/i.test(file.name)?'image/png':'image/jpeg');
 const base64=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Could not read this part of the file.'));r.readAsDataURL(blob);});
 async function uploadFile(file,request,{contextKey='current',onProgress=()=>{}}={}){
  if(!file||!file.size)throw Error('Choose a non-empty PDF or image.');
  onProgress('Checking the original file…');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');const key='aleph-calc-file:'+contextKey+':'+hash;let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
  state.uploadSecret||=secret();try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  const started=await request('upload-start',{fileName:file.name||'working.pdf',fileType:mime(file),size:file.size,sha256:hash,uploadSecret:state.uploadSecret});
  if(!started.completed)for(let i=0;i<started.parts;i++){onProgress('Uploading the full file: part '+(i+1)+' of '+started.parts+'…');const data=await base64(file.slice(i*started.chunkSize,Math.min(file.size,(i+1)*started.chunkSize)));let saved=false;for(let n=0;n<3;n++){try{await request('upload-part',{uploadId:started.uploadId,uploadToken:started.uploadToken,index:i,data});saved=true;break;}catch(error){if(n===2)throw error;await new Promise(r=>setTimeout(r,250*(n+1)));}}if(!saved)throw Error('This piece did not save. Retry the same file to resume.');}
  onProgress('Verifying the complete original file…');return request('upload-finish',{uploadId:started.uploadId,uploadToken:started.uploadToken});
 }
 async function uploadDataUrl(file,request,options){const [header,data]=file.fileDataUrl.split(',');const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));return uploadFile(new File([bytes],file.fileName||'working.pdf',{type:file.fileType||header.slice(5).split(';')[0]}),request,options);}
 window.AlephCalcUploads={uploadFile,uploadDataUrl};
})();
