// Build-time rendering: no CDN or runtime math dependency in the lesson pages.
const fs=require('node:fs'), path=require('node:path');
const katex=require(process.argv[2]||'katex');
const root=__dirname;
let equations=0;
for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.source.html'))){
 let source=fs.readFileSync(path.join(root,name),'utf8');
 source=source.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g,(_,display,inline)=>{
  equations++;
  const formula=katex.renderToString(display??inline,{displayMode:display!==undefined,output:'mathml',throwOnError:true,strict:'error',trust:false});
  return display!==undefined?`<div class="formula">${formula}</div>`:formula;
 });
 if(/\\\[|\\\(/.test(source))throw Error('Unrendered math in '+name);
 fs.writeFileSync(path.join(root,name.replace('.source.html','.html')),source);
 fs.unlinkSync(path.join(root,name));
}
console.log(`Rendered ${equations} expressions as native MathML.`);
