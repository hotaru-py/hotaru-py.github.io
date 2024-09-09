var gt=Object.defineProperty;var mt=(e,t,n)=>t in e?gt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var Z=(e,t,n)=>mt(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const v of l.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&r(v)}).observe(document,{childList:!0,subtree:!0});function n(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(o){if(o.ep)return;o.ep=!0;const l=n(o);fetch(o.href,l)}})();function h(){}function ft(e){return e()}function st(){return Object.create(null)}function R(e){e.forEach(ft)}function pt(e){return typeof e=="function"}function H(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}function ht(e){return Object.keys(e).length===0}function f(e,t){e.appendChild(t)}function x(e,t,n){e.insertBefore(t,n||null)}function _(e){e.parentNode&&e.parentNode.removeChild(e)}function p(e){return document.createElement(e)}function S(e){return document.createTextNode(e)}function E(){return S(" ")}function K(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function d(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function bt(e){return Array.from(e.childNodes)}function u(e,t,n){e.classList.toggle(t,!!n)}let A;function N(e){A=e}function _t(){if(!A)throw new Error("Function called outside component initialization");return A}function vt(e){_t().$$.on_mount.push(e)}const C=[],ut=[];let F=[];const ct=[],xt=Promise.resolve();let et=!1;function kt(){et||(et=!0,xt.then(dt))}function nt(e){F.push(e)}const tt=new Set;let T=0;function dt(){if(T!==0)return;const e=A;do{try{for(;T<C.length;){const t=C[T];T++,N(t),$t(t.$$)}}catch(t){throw C.length=0,T=0,t}for(N(null),C.length=0,T=0;ut.length;)ut.pop()();for(let t=0;t<F.length;t+=1){const n=F[t];tt.has(n)||(tt.add(n),n())}F.length=0}while(C.length);for(;ct.length;)ct.pop()();et=!1,tt.clear(),N(e)}function $t(e){if(e.fragment!==null){e.update(),R(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(nt)}}function yt(e){const t=[],n=[];F.forEach(r=>e.indexOf(r)===-1?t.push(r):n.push(r)),n.forEach(r=>r()),F=t}const z=new Set;let P;function wt(){P={r:0,c:[],p:P}}function It(){P.r||R(P.c),P=P.p}function L(e,t){e&&e.i&&(z.delete(e),e.i(t))}function O(e,t,n,r){if(e&&e.o){if(z.has(e))return;z.add(e),P.c.push(()=>{z.delete(e),r&&(n&&e.d(1),r())}),e.o(t)}else r&&r()}function V(e){e&&e.c()}function M(e,t,n){const{fragment:r,after_update:o}=e.$$;r&&r.m(t,n),nt(()=>{const l=e.$$.on_mount.map(ft).filter(pt);e.$$.on_destroy?e.$$.on_destroy.push(...l):R(l),e.$$.on_mount=[]}),o.forEach(nt)}function Q(e,t){const n=e.$$;n.fragment!==null&&(yt(n.after_update),R(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function Bt(e,t){e.$$.dirty[0]===-1&&(C.push(e),kt(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function U(e,t,n,r,o,l,v=null,B=[-1]){const b=A;N(e);const i=e.$$={fragment:null,ctx:[],props:l,update:h,not_equal:o,bound:st(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(b?b.$$.context:[])),callbacks:st(),dirty:B,skip_bound:!1,root:t.target||b.$$.root};v&&v(i.root);let y=!1;if(i.ctx=n?n(e,t.props||{},(m,g,...c)=>{const a=c.length?c[0]:g;return i.ctx&&o(i.ctx[m],i.ctx[m]=a)&&(!i.skip_bound&&i.bound[m]&&i.bound[m](a),y&&Bt(e,m)),g}):[],i.update(),y=!0,R(i.before_update),i.fragment=r?r(i.ctx):!1,t.target){if(t.hydrate){const m=bt(t.target);i.fragment&&i.fragment.l(m),m.forEach(_)}else i.fragment&&i.fragment.c();t.intro&&L(e.$$.fragment),M(e,t.target,t.anchor),dt()}N(b)}class D{constructor(){Z(this,"$$");Z(this,"$$set")}$destroy(){Q(this,1),this.$destroy=h}$on(t,n){if(!pt(n))return h;const r=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return r.push(n),()=>{const o=r.indexOf(n);o!==-1&&r.splice(o,1)}}$set(t){this.$$set&&!ht(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const jt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(jt);function Et(e){let t,n,r,o,l,v,B,b,i,y,m,g;return{c(){t=p("main"),n=p("div"),r=p("span"),o=S("Hello, I’m "),l=p("span"),l.textContent="Prajesh",v=S(`, an undergrad student at Shiv Nadar University Chennai, pursuing my\r
      Bachelors in Computer Science.`),B=E(),b=p("div"),i=p("span"),i.textContent=`I’m a developer, currently focused on Full Stack Development and picking\r
      up Game Development for something I’ve planned in the long run.`,y=E(),m=p("div"),g=p("span"),g.textContent=`With my love for art and design, combined with my lifelong interest in\r
      development, I love to identify problems and create solutions that are\r
      visually appealing, highly functional and accessible to people.`,d(l,"class","font-bold"),u(l,"text-[#1B4965]",e[0]),u(l,"text-pink-500",!e[0]),d(r,"class","text-2xl bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:100%_40px] bg-no-repeat transition-all duration-1500 ease-out"),u(r,"bg-[length:0%_30px]",e[0]),u(r,"bg-[length:100%_30px]",!e[0]),u(r,"text-black",e[0]),u(r,"text-pink-500",!e[0]),d(n,"class","p-4 group transition-all duration-800"),d(i,"class","text-2xl bg-right-bottom bg-gradient-to-l from-pink-500 to-pink-500 bg-no-repeat transition-all duration-1500 ease-out"),u(i,"bg-[length:0%_30px]",e[1]),u(i,"bg-[length:100%_30px]",!e[1]),u(i,"text-black",e[1]),u(i,"text-pink-500",!e[1]),d(b,"class","p-4 group transition-all duration-800"),d(g,"class","text-2xl bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:100%_40px] bg-no-repeat transition-all duration-1500 ease-out"),u(g,"bg-[length:0%_30px]",e[2]),u(g,"bg-[length:100%_30px]",!e[2]),u(g,"text-black",e[2]),u(g,"text-pink-500",!e[2]),d(m,"class","p-4 group transition-all duration-800"),d(t,"class","w-1/2 mt-6 ml-8")},m(c,a){x(c,t,a),f(t,n),f(n,r),f(r,o),f(r,l),f(r,v),f(t,B),f(t,b),f(b,i),f(t,y),f(t,m),f(m,g)},p(c,[a]){a&1&&u(l,"text-[#1B4965]",c[0]),a&1&&u(l,"text-pink-500",!c[0]),a&1&&u(r,"bg-[length:0%_30px]",c[0]),a&1&&u(r,"bg-[length:100%_30px]",!c[0]),a&1&&u(r,"text-black",c[0]),a&1&&u(r,"text-pink-500",!c[0]),a&2&&u(i,"bg-[length:0%_30px]",c[1]),a&2&&u(i,"bg-[length:100%_30px]",!c[1]),a&2&&u(i,"text-black",c[1]),a&2&&u(i,"text-pink-500",!c[1]),a&4&&u(g,"bg-[length:0%_30px]",c[2]),a&4&&u(g,"bg-[length:100%_30px]",!c[2]),a&4&&u(g,"text-black",c[2]),a&4&&u(g,"text-pink-500",!c[2])},i:h,o:h,d(c){c&&_(t)}}}function Pt(e,t,n){let r=!1,o=!1,l=!1;return vt(()=>{setTimeout(()=>{n(0,r=!0)},800),setTimeout(()=>{n(1,o=!0)},1200),setTimeout(()=>{n(2,l=!0)},1600)}),[r,o,l]}class St extends D{constructor(t){super(),U(this,t,Pt,Et,H,{})}}function Lt(e){let t;return{c(){t=p("main"),t.innerHTML=`<p class="text-2xl p-4">I’m a <span class="text-[#1B4965] font-bold">Full Stack Developer</span> and
    a proficient <span class="text-[#1B4965] font-bold">UI/UX designer</span>,
    focusing on balancing functionality, design, usability and aesthetics from
    the user’s perspective.</p> <p class="text-2xl p-4">I work primarily with Svelte and have used React and Next.js extensively in
    my other projects. I make UI mockups and concepts on Figma.</p> <p class="text-2xl p-4">I’ve worked with Python and FastAPI for backend, which I’m still exploring
    as part of my migration from Frontend to Full Stack Development.</p> <p class="text-2xl p-4">I’ve dabbled <span class="italic">(and still occasionally dabble)</span> in graphic
    design, animation and digital art over the years.</p> <p class="text-2xl p-4">I’m also learning Game Development (Unreal Engine &amp; Blender) for something
    I’ve planned in the long run, a magnum opus of sorts.</p>`,d(t,"class","w-1/2 mt-6 ml-8")},m(n,r){x(n,t,r)},p:h,i:h,o:h,d(n){n&&_(t)}}}class Tt extends D{constructor(t){super(),U(this,t,null,Lt,H,{})}}function Ct(e){let t;return{c(){t=p("main"),t.innerHTML=`<div><div class="text-2xl p-4">Here are some of my
      <span class="text-[#1B4965] font-bold">Projects:</span></div> <div class="mt-8"><a class="group transition-all duration-400" href="https://github.com/hotaru-hspr/hotaru-hspr.github.io" target="_blank" rel="noopener noreferrer"><span class="text-2xl p-4 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ This website <span class="italic">(duh)</span> ] - WIP</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="https://github.com/hotaru-hspr/Starboard" target="_blank" rel="noopener noreferrer"><span class="text-2xl p-4 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ Starboard (Private) ] - WIP</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="https://github.com/Shivsrijit/PhiTector" target="_blank" rel="noopener noreferrer"><span class="text-2xl p-4 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ PhiTector ]</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="https://skibidigpt.vercel.app/" target="_blank" rel="noopener noreferrer"><span class="text-2xl p-4 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ SkibidiGPT ]</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="https://github.com/EditaCTF/Envithon-EcoQuests" target="_blank" rel="noopener noreferrer"><span class="text-2xl p-4 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ EcoQuests ]</span></a></div></div>`,d(t,"class","flex w-1/2 mt-6 ml-8")},m(n,r){x(n,t,r)},p:h,i:h,o:h,d(n){n&&_(t)}}}class Ft extends D{constructor(t){super(),U(this,t,null,Ct,H,{})}}function Ot(e){let t;return{c(){t=p("main"),t.innerHTML='<p class="text-2xl p-4">I’m <span class="text-[#1B4965] font-bold">open to projects and internships</span>, and to reach out to me:</p> <div><div class="mt-8"><a class="group transition-all duration-400" href="https://linkedin.com/in/prajesh-raam" target="_blank" rel="noopener noreferrer"><span class="text-2xl ml-4 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ LinkedIn ]</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="mailto:stu.prajeshraam@gmail.com" target="_blank" rel="noopener noreferrer"><span class="text-2xl ml-4 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ E-mail ]</span></a></div> <div class="mt-12"><a class="group transition-all duration-400" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"><span class="text-2xl ml-4 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-400 ease-out">[ Resume ]</span></a></div></div>',d(t,"class","w-1/2 mt-6 ml-8")},m(n,r){x(n,t,r)},p:h,i:h,o:h,d(n){n&&_(t)}}}class Nt extends D{constructor(t){super(),U(this,t,null,Ot,H,{})}}function At(e){let t,n;return t=new Nt({}),{c(){V(t.$$.fragment)},m(r,o){M(t,r,o),n=!0},i(r){n||(L(t.$$.fragment,r),n=!0)},o(r){O(t.$$.fragment,r),n=!1},d(r){Q(t,r)}}}function Rt(e){let t,n;return t=new Ft({}),{c(){V(t.$$.fragment)},m(r,o){M(t,r,o),n=!0},i(r){n||(L(t.$$.fragment,r),n=!0)},o(r){O(t.$$.fragment,r),n=!1},d(r){Q(t,r)}}}function Ht(e){let t,n;return t=new Tt({}),{c(){V(t.$$.fragment)},m(r,o){M(t,r,o),n=!0},i(r){n||(L(t.$$.fragment,r),n=!0)},o(r){O(t.$$.fragment,r),n=!1},d(r){Q(t,r)}}}function Mt(e){let t,n;return t=new St({}),{c(){V(t.$$.fragment)},m(r,o){M(t,r,o),n=!0},i(r){n||(L(t.$$.fragment,r),n=!0)},o(r){O(t.$$.fragment,r),n=!1},d(r){Q(t,r)}}}function Qt(e){let t;return{c(){t=S("Reach out")},m(n,r){x(n,t,r)},d(n){n&&_(t)}}}function Ut(e){let t;return{c(){t=S("Projects")},m(n,r){x(n,t,r)},d(n){n&&_(t)}}}function Dt(e){let t;return{c(){t=S("Skills")},m(n,r){x(n,t,r)},d(n){n&&_(t)}}}function Wt(e){let t;return{c(){t=S("About me")},m(n,r){x(n,t,r)},d(n){n&&_(t)}}}function Gt(e){let t,n,r;return{c(){t=p("button"),d(t,"class","arrow up mt-3 border-black")},m(o,l){x(o,t,l),n||(r=K(t,"click",e[1]),n=!0)},p:h,d(o){o&&_(t),n=!1,r()}}}function Xt(e){let t,n,r;return{c(){t=p("button"),d(t,"class","arrow up mt-3 border-gray-400 cursor-default")},m(o,l){x(o,t,l),n||(r=K(t,"click",e[1]),n=!0)},p:h,d(o){o&&_(t),n=!1,r()}}}function qt(e){let t,n,r;return{c(){t=p("button"),d(t,"class","arrow down mt-2 border-black")},m(o,l){x(o,t,l),n||(r=K(t,"click",e[2]),n=!0)},p:h,d(o){o&&_(t),n=!1,r()}}}function zt(e){let t,n,r;return{c(){t=p("button"),d(t,"class","arrow down mt-2 border-gray-400 cursor-default")},m(o,l){x(o,t,l),n||(r=K(t,"click",e[2]),n=!0)},p:h,d(o){o&&_(t),n=!1,r()}}}function Kt(e){let t,n,r,o,l,v,B,b,i,y,m,g,c,a,J,W;const rt=[Mt,Ht,Rt,At],j=[];function ot(s,I){return s[0]==1?0:s[0]==2?1:s[0]==3?2:3}n=ot(e),r=j[n]=rt[n](e);function lt(s,I){return s[0]==1?Wt:s[0]==2?Dt:s[0]==3?Ut:Qt}let G=lt(e),w=G(e);function it(s,I){return s[0]==1?Xt:Gt}let X=it(e),k=X(e);function at(s,I){return s[0]==4?zt:qt}let q=at(e),$=q(e);return{c(){t=p("div"),r.c(),o=E(),l=p("footer"),v=p("div"),B=E(),b=p("div"),i=p("div"),i.innerHTML='<div><a class="group transition-all duration-150" href="https://github.com/hotaru-hspr" target="_blank" rel="noopener noreferrer"><span class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out">GitHub</span></a></div> <div><a class="group transition-all duration-200" href="https://linkedin.com/in/prajesh-raam" target="_blank" rel="noopener noreferrer"><span class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out">LinkedIn</span></a></div> <div><a class="group transition-all duration-200" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"><span class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out">Resume</span></a></div> <div><a class="group transition-all duration-200" href="mailto:stu.prajeshraam@gmail.com" target="_blank" rel="noopener noreferrer"><span class="ml-8 p-1 hover:text-[#1B4965] hover:font-bold bg-left-bottom bg-gradient-to-r from-pink-500 to-pink-500 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-200 ease-out">E-mail</span></a></div>',y=E(),m=p("div"),g=p("h1"),w.c(),c=E(),a=p("div"),k.c(),J=E(),$.c(),d(v,"class","bg-[#000000] h-0.5 m-8"),d(i,"class","flex"),d(g,"class","text-6xl my-4"),d(a,"class","ml-8 flex flex-col"),d(m,"class","ml-auto flex items-center justify-center mr-8"),d(b,"class","flex m-8 mb-10 items-center justify-center"),d(t,"class","bg-[#F4F4F4] flex flex-col min-h-screen justify-between")},m(s,I){x(s,t,I),j[n].m(t,null),f(t,o),f(t,l),f(l,v),f(l,B),f(l,b),f(b,i),f(b,y),f(b,m),f(m,g),w.m(g,null),f(m,c),f(m,a),k.m(a,null),f(a,J),$.m(a,null),W=!0},p(s,[I]){let Y=n;n=ot(s),n!==Y&&(wt(),O(j[Y],1,1,()=>{j[Y]=null}),It(),r=j[n],r||(r=j[n]=rt[n](s),r.c()),L(r,1),r.m(t,o)),G!==(G=lt(s))&&(w.d(1),w=G(s),w&&(w.c(),w.m(g,null))),X===(X=it(s))&&k?k.p(s,I):(k.d(1),k=X(s),k&&(k.c(),k.m(a,J))),q===(q=at(s))&&$?$.p(s,I):($.d(1),$=q(s),$&&($.c(),$.m(a,null)))},i(s){W||(L(r),W=!0)},o(s){O(r),W=!1},d(s){s&&_(t),j[n].d(),w.d(),k.d(),$.d()}}}function Vt(e,t,n){let r=1;function o(){r>1&&n(0,r-=1)}function l(){r<4&&n(0,r+=1)}return[r,o,l]}class Jt extends D{constructor(t){super(),U(this,t,Vt,Kt,H,{})}}new Jt({target:document.getElementById("app")});
