(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{33844:function(e,t,n){"use strict";n.d(t,{CH:function(){return u},CI:function(){return i},JY:function(){return a},h2:function(){return s},ou:function(){return l},oz:function(){return c}});var r=n(40324),o=n(48961),a=(0,r.Z)(["g","h","p","_","Y","x","6","S","E","W","5","y","c","9","f","A","N","a","A","G","7","t","o","d","Q","L","Y","5","W","S","V","X","p","I","4","J","0","v","k","5"]);(0,r.Z)(o.env.NEXT_GITHUB_BACKEND_TOKEN||"");var c="https://api.github.com",i="https://github.com",s="hankliu62",u="interview",l="2022-11-28"},4214:function(e,t,n){"use strict";n.d(t,{Yr:function(){return O},cp:function(){return w}});var r,o,a,c,i=n(26161),s=n(41608),u=n(30298),l=n.n(u),f=n(59969),p=n.n(f),d=n(33844);function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function m(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach(function(t){(0,i.Z)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var b=d.JY.join(""),x=new Map,j=new Map,y=(r=(0,s.Z)(l().mark(function e(t,n){var r,o,a,c,i=arguments;return l().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:for(c in r=i.length>2&&void 0!==i[2]?i[2]:{},o="".concat(d.oz,"/repos/").concat(d.h2,"/").concat(t,"/issues"),a=r.perPage||10,delete r.perPage,o+="?creator=".concat(d.h2,"&per_page=").concat(a,"&page=").concat(n||1),r)Object.prototype.hasOwnProperty.call(r,c)&&(o+="&".concat(c,"=").concat(r[c]));return e.abrupt("return",p()(o,{headers:{"X-GitHub-Api-Version":d.ou,Authorization:"Bearer ".concat(b)}}).then(function(e){return e.json()}));case 7:case"end":return e.stop()}},e)})),function(e,t){return r.apply(this,arguments)}),g=(o=(0,s.Z)(l().mark(function e(t){var n,r=arguments;return l().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=r.length>1&&void 0!==r[1]?r[1]:{},e.abrupt("return",new Promise(function(e){var r=[],o=1;function a(){return c.apply(this,arguments)}function c(){return(c=(0,s.Z)(l().mark(function c(){var i,s,u,f;return l().wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return c.next=2,y(t,o,m(m({},n),{},{perPage:100}));case 2:if((i=c.sent).length>0){s=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return v(e,void 0);var n=Object.prototype.toString.call(e).slice(8,-1);if("Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return v(e,void 0)}}(e))){n&&(e=n);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,c=!0,i=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return c=e.done,e},e:function(e){i=!0,a=e},f:function(){try{c||null==n.return||n.return()}finally{if(i)throw a}}}}(i);try{for(s.s();!(u=s.n()).done;)f=u.value,r.push(f)}catch(e){s.e(e)}finally{s.f()}o++,setTimeout(a,100)}else e(r);case 4:case"end":return c.stop()}},c)}))).apply(this,arguments)}a()}));case 2:case"end":return e.stop()}},e)})),function(e){return o.apply(this,arguments)}),w=(a=(0,s.Z)(l().mark(function e(t,n,r){var o,a=arguments;return l().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(o=a.length>3&&void 0!==a[3]?a[3]:{},r){e.next=3;break}return e.abrupt("return",y(t,n,o));case 3:return e.abrupt("return",new Promise(function(){var e=(0,s.Z)(l().mark(function e(a){var c,i,s,u;return l().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(i=(c=Date.now())-(j.get(t)||0)<36e5,s=[],!i){e.next=7;break}s=x.get(t),e.next=13;break;case 7:return e.next=9,g(t,o);case 9:u=e.sent,x.set(t,u),j.set(t,c),s=u;case 13:a(s.filter(function(e){var t;return e.title&&e.title.toLowerCase().includes(r.toLowerCase())||e.body&&e.body.toLowerCase().includes(r.toLowerCase())||(null===(t=e.labels)||void 0===t?void 0:t.some(function(e){return e.name.toLowerCase().includes(r.toLowerCase())}))}).slice((n-1)*10,10*n));case 14:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}()));case 4:case"end":return e.stop()}},e)})),function(e,t,n){return a.apply(this,arguments)}),O=(c=(0,s.Z)(l().mark(function e(t,n){var r;return l().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r="".concat(d.oz,"/repos/").concat(d.h2,"/").concat(n,"/issues/").concat(t),e.abrupt("return",p()(r,{headers:{"X-GitHub-Api-Version":d.ou,Authorization:"Bearer ".concat(b)}}).then(function(e){return e.json()}));case 2:case"end":return e.stop()}},e)})),function(e,t){return c.apply(this,arguments)})},88685:function(e,t,n){"use strict";n.r(t),n.d(t,{__N_SSG:function(){return $},default:function(){return F}}),n(22278);var r=n(56687),o=n.n(r);n(23651);var a=n(92091),c=n.n(a);n(61245);var i=n(43152),s=n.n(i);n(16385);var u=n(34146),l=n.n(u);n(81710);var f=n(34379),p=n.n(f);n(43185);var d=n(9496),v=n.n(d);n(86469);var h=n(84845),m=n.n(h);n(25615);var b=n(73382),x=n.n(b),j=n(26161),y=n(40324),g=n(41608);n(3480);var w=n(4285),O=n.n(w),N=n(30298),P=n.n(N),k=n(69012),C=n(19767),S=n(73351),_=n(73541),D=n(87702),E=n(82187),Z=n.n(E),A=n(7672),I=n.n(A),Y=n(12875),z=n(75271),H=n(29777),L=n(81417),T=n(80170),q=n(52676),M=["className","style","visible","disabled","indicator","onEnter"];function X(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function B(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?X(Object(n),!0).forEach(function(t){(0,j.Z)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):X(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function G(){return(0,q.jsx)("div",{className:"flex justify-center",children:(0,q.jsx)(L.Z,{spin:!0,className:"h-[1.125rem] text-lg leading-[1] text-[#1677ff]"})})}var V=function(e){var t=e.className,n=e.style,r=e.visible,o=e.disabled,a=void 0!==o&&o,c=e.indicator,i=void 0===c?(0,q.jsx)(G,{}):c,s=e.onEnter,u=(0,H.Z)(e,M);return void 0===r||r?(0,q.jsxs)("div",{className:Z()("py-3 text-center",t),style:n,children:[a?null:(0,q.jsx)(T.h,B(B({},u),{},{onEnter:function(e){!a&&s&&s(e)}})),i]}):null},J=n(33844),K=function(e,t){(0,z.useEffect)(function(){e()},t)},U=n(4214);function W(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function Q(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?W(Object(n),!0).forEach(function(t){(0,j.Z)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):W(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var R=function(e){var t=e.key,n=e.icon,r=e.text,o=e.onClick;return(0,q.jsxs)(O(),{onClick:o||function(){},children:[z.createElement(n),r]},t)},$=!0;function F(e){var t,n=e.labels,r=(0,Y.useRouter)(),a=(0,z.useState)(r.query.label),i=a[0],u=a[1],f=(0,z.useState)(!0),d=f[0],h=f[1],b=(0,z.useState)(!1),j=b[0],w=b[1],N=(0,z.useState)(!0),E=N[0],A=N[1],H=(0,z.useState)([]),L=H[0],T=H[1],M=(0,z.useState)(1),X=M[0],B=M[1],G=(0,z.useState)(),W=G[0],$=G[1],F=(t=(0,g.Z)(P().mark(function e(t,n,r){var o;return P().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return w(!0),1===t&&A(!1),console.log("fetch issues",t,r),e.next=5,(0,U.cp)(J.CH,t,n,{labels:[r].filter(Boolean).join(",")});case 5:o=e.sent,w(!1),B(t),1===t?T(o||[]):T(function(e){return[].concat((0,y.Z)(e),(0,y.Z)(o||[]))}),(null==o?void 0:o.length)===0&&A(!0);case 10:case"end":return e.stop()}},e)})),function(e,n,r){return t.apply(this,arguments)});K((0,g.Z)(P().mark(function e(){return P().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:F(1,W,r.query.label);case 1:case"end":return e.stop()}},e)})),[]);var ee=(0,z.useCallback)(function(e){u(null==e?void 0:e.name),F(1,W,null==e?void 0:e.name);var t=e?Q(Q({},r.query),{},{label:e.name}):Q({},r.query);e||delete t.label,r.replace({pathname:r.pathname,query:t})},[r,W]),et=(0,z.useCallback)(function(){F(X+1,W,i)},[X,W,i]),en=(0,z.useCallback)(function(e){$(e),F(1,e,i)},[i]);return(0,q.jsxs)("div",{className:"flex space-x-6 bg-white p-6",children:[(0,q.jsx)("div",{className:"w-64",children:(0,q.jsxs)(v(),{offsetTop:24,children:[(0,q.jsx)(x().Search,{placeholder:"输入关键词，按回车搜索",className:"mb-4 w-full",onSearch:en,size:"large",allowClear:!0}),(0,q.jsx)(m(),{className:"questions-collapse",defaultActiveKey:["labels"],onChange:function(e){h(e.includes("labels"))},expandIconPosition:"end",children:(0,q.jsx)(m().Panel,{extra:(0,q.jsx)("div",{className:"-mr-2",children:d?"收起":"展开"}),header:(0,q.jsx)("span",{className:"cursor-pointer text-base font-bold underline-offset-2 hover:text-[#1171ee] hover:underline",onClick:function(e){(null==e?void 0:e.preventDefault)&&e.preventDefault(),(null==e?void 0:e.stopPropagation)&&e.stopPropagation(),ee()},"aria-hidden":"true",children:"标签"}),children:(0,q.jsx)("div",{className:"max-h-[620px] overflow-y-auto p-[16px]",children:(n||[]).map(function(e){return(0,q.jsxs)("div",{className:Z()("group flex space-x-4 rounded-md p-2 hover:cursor-pointer hover:bg-[#f7f8fa]",{"bg-[#eaf2ff] hover:bg-[#eaf2ff]":e.name===i}),onClick:function(){return ee(e)},"aria-hidden":"true",children:[(0,q.jsx)("div",{className:"flex flex-col justify-center",children:(0,q.jsx)(k.Z,{style:{color:"#".concat(e.color)},className:"text-lg font-medium"})}),(0,q.jsx)("div",{className:Z()("text-base font-normal text-[#515767] group-hover:text-[#1171ee]",{"text-[#1e80ff] group-hover:text-[#1e80ff]":e.name===i}),children:e.title})]},e.id)})})},"labels")})]})}),(0,q.jsx)("div",{className:"flex-1 overflow-hidden",children:(0,q.jsxs)(o(),{size:"small",className:"issues-card min-h-full !border-[#d9d9d9]",children:[(0,q.jsx)(c(),{className:"issues-list",itemLayout:"vertical",size:"large",pagination:!1,dataSource:L,loading:j,renderItem:function(e){var t,n,o;return(0,q.jsxs)(c().Item,{className:"cursor-pointer rounded-md hover:bg-[#f6f8fa]",actions:[(0,q.jsxs)(O(),{onClick:function(t){(null==t?void 0:t.stopPropagation)&&t.stopPropagation(),(null==t?void 0:t.preventDefault)&&t.preventDefault(),window.open("".concat(J.CI,"/").concat(J.h2,"/").concat(J.CH,"/issues/").concat(e.number),"_blank")},className:"group cursor-pointer",children:[(0,q.jsx)(C.Z,{className:"group-hover:text-[#1171ee]"}),(0,q.jsx)("span",{className:"group-hover:text-[#1171ee]",children:"#".concat(e.number)})]},"list-vertical-id"),(0,q.jsxs)(O(),{onClick:function(t){(null==t?void 0:t.stopPropagation)&&t.stopPropagation(),(null==t?void 0:t.preventDefault)&&t.preventDefault(),window.open("".concat(J.CI,"/").concat(e.user.login),"_blank")},className:"group cursor-pointer",children:[(0,q.jsx)(S.Z,{className:"group-hover:text-[#1171ee]"}),(0,q.jsx)("span",{className:"group-hover:text-[#1171ee]",children:e.user.login})]},"list-vertical-user"),(0,q.jsx)(R,{icon:_.Z,text:I()(e.created_at).format("YYYY-MM-DD HH:mm:ss")},"list-vertical-time"),(0,q.jsx)(R,{icon:D.Z,text:e.state},"list-vertical-status"),(0,q.jsx)(O(),{children:(0,q.jsx)(l(),{title:"难度: ".concat(null!==(t=e.milestone)&&void 0!==t&&t.number?(null===(n=e.milestone)||void 0===n?void 0:n.number)+"颗\uD83C\uDF1F":"未设置"),children:(0,q.jsx)(p(),{defaultValue:(null===(o=e.milestone)||void 0===o?void 0:o.number)||0,disabled:!0})})},"list-difficulty")],onClick:function(){r.push({pathname:"".concat(r.pathname,"/").concat(e.number).replace(/\/\//g,"/")})},children:[(0,q.jsx)(c().Item.Meta,{className:"!mb-0",title:(0,q.jsxs)("div",{className:"flex items-center justify-start space-x-2",children:[(0,q.jsx)("div",{className:"issue-title underline-offset-2",children:e.title}),(0,q.jsx)("div",{className:"flex items-center justify-start",children:e.labels.map(function(e){return(0,q.jsx)(s(),{color:"#".concat(e.color),children:e.name},e.id)})})]})}),(0,q.jsx)("div",{className:"truncate empty:hidden",children:e.body||""})]},e.id)}}),(0,q.jsx)(V,{className:Z()({invisible:1===X}),disabled:j,visible:!E,onEnter:et})]})})]})}},69268:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(88685)}])}},function(e){e.O(0,[236,747,283,343,888,774,179],function(){return e(e.s=69268)}),_N_E=e.O()}]);