(function(){
var root=document.getElementById("share-spec");
if(!root)return;
var spec,q;
try{spec=JSON.parse(root.textContent)}catch(e){return}
q=new URLSearchParams(location.search);
function node(f){return document.getElementById(f[1])}
function ok(f,raw){
  var n=node(f),i,x;
  if(!n||raw==null)return 0;
  if(f[2]==="s"){
    for(i=0;i<n.options.length;i++)if(n.options[i].value===raw)return 1;
    return 0;
  }
  if(raw===""||!isFinite(x=+raw))return 0;
  if(n.min!==""&&x<+n.min)return 0;
  if(n.max!==""&&x>+n.max)return 0;
  return 1;
}
function link(c){
  var p=new URLSearchParams();
  if(spec.tab&&c.tab)p.set("tab",c.tab);
  c.fields.forEach(function(f){var n=node(f);if(n&&n.value!=="")p.set(f[0],n.value)});
  return location.pathname+(p+""?"?"+p:"");
}
function copy(text,status){
  function done(){status.textContent="Copied"}
  function fb(){
    var a=document.createElement("textarea");
    a.value=text;a.style.cssText="position:fixed;left:-9999px";
    document.body.appendChild(a);a.focus();a.select();
    try{document.execCommand("copy");done()}catch(e){status.textContent="Copy failed"}
    a.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,fb);else fb();
}
function arm(c){
  var box=document.getElementById(c.box);
  if(!box)return;
  new MutationObserver(function(){
    if(box.hidden||box.querySelector(".share-row")||!box.textContent.trim())return;
    var shown=box.innerText.trim(),row=document.createElement("p"),st=document.createElement("span");
    try{history.replaceState(null,"",link(c))}catch(e){}
    row.className="share-row";st.className="share-status";
    function btn(label,fn){var b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",fn);row.appendChild(b)}
    btn("Copy link to this result",function(){copy(location.href,st)});
    btn("Copy as text",function(){
      copy(c.name+" (Chicken Coop Calculator)\nInputs: "+c.fields.map(function(f){var n=node(f);return n&&n.value!==""?f[0]+" "+n.value:""}).filter(Boolean).join(" · ")+"\nResult: "+shown+"\nPlanning estimate, not a measured result. "+location.href,st);
    });
    row.appendChild(st);box.appendChild(row);
  }).observe(box,{childList:true,attributes:true,attributeFilter:["hidden"]});
}
function boot(c){
  var saw=0,ready=1;
  c.fields.forEach(function(f){
    var raw=q.get(f[0]);
    if(raw==null){if(f[3])ready=0;return}
    saw=1;
    if(ok(f,raw))node(f).value=raw;else if(f[3])ready=0;
  });
  if(c.panel&&typeof showTab==="function"&&(q.get("tab")===c.tab||(saw&&ready)))
    showTab(c.panel,document.querySelector('[data-panel="'+c.panel+'"]'));
  if(!(saw&&ready))return 0;
  var b=c.click&&document.getElementById(c.click);
  if(b)b.click();
  return 1;
}
document.addEventListener("DOMContentLoaded",function(){
  var ran=0,tab=q.get("tab"),list=spec.calcs||[];
  list.forEach(arm);
  list.forEach(function(c){
    if(spec.tab&&tab&&tab!==c.tab)return;
    if(spec.tab&&!tab&&ran)return;
    if(boot(c))ran=1;
  });
});
})();
