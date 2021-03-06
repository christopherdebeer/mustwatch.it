/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build reqwest bonzo qwery bean
  * =============================================================
  */


/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
(function(context){function require(identifier){var module=modules["$"+identifier]||window[identifier];if(!module)throw new Error("Ender Error: Requested module '"+identifier+"' has not been defined.");return module}function provide(name,what){return modules["$"+name]=what}function aug(o,o2){for(var k in o2)k!="noConflict"&&k!="_VERSION"&&(o[k]=o2[k]);return o}function Ender(s,opt_r){var elements,i;this.selector=s;if(typeof s=="undefined"){elements=[];this.selector=""}else typeof s=="string"||s.nodeName||s.length&&"item"in s||s==window?elements=ender._select(s,opt_r):elements=isFinite(s.length)?s:[s];this.length=elements.length;for(i=this.length;i--;)this[i]=elements[i]}function ender(s,opt_r){return new Ender(s,opt_r)}context.global=context;var modules={},old=context.$,oldRequire=context.require,oldProvide=context.provide;context.provide=provide;context.require=require;Ender.prototype.forEach=function(fn,opt_scope){var i,l;for(i=0,l=this.length;i<l;++i)i in this&&fn.call(opt_scope||this[i],this[i],i,this);return this};Ender.prototype.$=ender;ender._VERSION="0.4.5-dev";ender.fn=Ender.prototype;ender.ender=function(o,chain){aug(chain?Ender.prototype:ender,o)};ender._select=function(s,r){return typeof s=="string"?(r||document).querySelectorAll(s):s.nodeName?[s]:s};ender.noConflict=function(callback){context.$=old;if(callback){context.provide=oldProvide;context.require=oldRequire;callback(require,provide,this)}return this};typeof module!="undefined"&&module.exports&&(module.exports=ender);context.ender=context.$=context.ender||ender}(this));(function(){var module={exports:{}},exports=module.exports;
/*!
    * Reqwest! A general purpose XHR connection manager
    * (c) Dustin Diaz 2011
    * https://github.com/ded/reqwest
    * license MIT
    */
;!function(name,definition){typeof module!="undefined"?module.exports=definition():typeof define=="function"&&define.amd?define(name,definition):this[name]=definition()}("reqwest",function(){function handleReadyState(o,success,error){return function(){o&&o[readyState]==4&&(twoHundo.test(o.status)?success(o):error(o))}}function setHeaders(http,o){var headers=o.headers||{},h;headers.Accept=headers.Accept||defaultHeaders.accept[o.type]||defaultHeaders.accept["*"];!o.crossOrigin&&!headers[requestedWith]&&(headers[requestedWith]=defaultHeaders.requestedWith);headers[contentType]||(headers[contentType]=o.contentType||defaultHeaders.contentType);for(h in headers)headers.hasOwnProperty(h)&&http.setRequestHeader(h,headers[h])}function generalCallback(data){lastValue=data}function urlappend(url,s){return url+(/\?/.test(url)?"&":"?")+s}function handleJsonp(o,fn,err,url){var reqId=uniqid++,cbkey=o.jsonpCallback||"callback",cbval=o.jsonpCallbackName||"reqwest_"+reqId,cbreg=new RegExp("((^|\\?|&)"+cbkey+")=([^&]+)"),match=url.match(cbreg),script=doc.createElement("script"),loaded=0;match?match[3]==="?"?url=url.replace(cbreg,"$1="+cbval):cbval=match[3]:url=urlappend(url,cbkey+"="+cbval);win[cbval]=generalCallback;script.type="text/javascript";script.src=url;script.async=!0;if(typeof script.onreadystatechange!="undefined"){script.event="onclick";script.htmlFor=script.id="_reqwest_"+reqId}script.onload=script.onreadystatechange=function(){if(script[readyState]&&script[readyState]!=="complete"&&script[readyState]!=="loaded"||loaded)return!1;script.onload=script.onreadystatechange=null;script.onclick&&script.onclick();o.success&&o.success(lastValue);lastValue=undefined;head.removeChild(script);loaded=1};head.appendChild(script)}function getRequest(o,fn,err){var method=(o.method||"GET").toUpperCase(),url=typeof o=="string"?o:o.url,data=o.processData!==!1&&o.data&&typeof o.data!="string"?reqwest.toQueryString(o.data):o.data||null,http;if((o.type=="jsonp"||method=="GET")&&data){url=urlappend(url,data);data=null}if(o.type=="jsonp")return handleJsonp(o,fn,err,url);http=xhr();http.open(method,url,!0);setHeaders(http,o);http.onreadystatechange=handleReadyState(http,fn,err);o.before&&o.before(http);http.send(data);return http}function Reqwest(o,fn){this.o=o;this.fn=fn;init.apply(this,arguments)}function setType(url){var m=url.match(/\.(json|jsonp|html|xml)(\?|$)/);return m?m[1]:"js"}function init(o,fn){function complete(resp){o.timeout&&clearTimeout(self.timeout);self.timeout=null;o.complete&&o.complete(resp)}function success(resp){var r=resp.responseText;if(r)switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp);o.success&&o.success(resp);complete(resp)}function error(resp,msg,t){o.error&&o.error(resp,msg,t);complete(resp)}this.url=typeof o=="string"?o:o.url;this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){};o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout));this.request=getRequest(o,success,error)}function reqwest(o,fn){return new Reqwest(o,fn)}function normalize(s){return s?s.replace(/\r?\n/g,"\r\n"):""}function serial(el,cb){var n=el.name,t=el.tagName.toLowerCase(),optCb=function(o){o&&!o.disabled&&cb(n,normalize(o.attributes.value&&o.attributes.value.specified?o.value:o.text))};if(el.disabled||!n)return;switch(t){case"input":if(!/reset|button|image|file/i.test(el.type)){var ch=/checkbox/i.test(el.type),ra=/radio/i.test(el.type),val=el.value;(!ch&&!ra||el.checked)&&cb(n,normalize(ch&&val===""?"on":val))}break;case"textarea":cb(n,normalize(el.value));break;case"select":if(el.type.toLowerCase()==="select-one")optCb(el.selectedIndex>=0?el.options[el.selectedIndex]:null);else for(var i=0;el.length&&i<el.length;i++)el.options[i].selected&&optCb(el.options[i])}}function eachFormElement(){var cb=this,e,i,j,serializeSubtags=function(e,tags){for(var i=0;i<tags.length;i++){var fa=e[byTag](tags[i]);for(j=0;j<fa.length;j++)serial(fa[j],cb)}};for(i=0;i<arguments.length;i++){e=arguments[i];/input|select|textarea/i.test(e.tagName)&&serial(e,cb);serializeSubtags(e,["input","select","textarea"])}}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var hash={};eachFormElement.apply(function(name,value){if(name in hash){hash[name]&&!isArray(hash[name])&&(hash[name]=[hash[name]]);hash[name].push(value)}else hash[name]=value},arguments);return hash}var win=window,doc=document,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",head=doc[byTag]("head")[0],uniqid=0,lastValue,xmlHttpRequest="XMLHttpRequest",isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},requestedWith:xmlHttpRequest},xhr=win[xmlHttpRequest]?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}};reqwest.serializeArray=function(){var arr=[];eachFormElement.apply(function(name,value){arr.push({name:name,value:value})},arguments);return arr};reqwest.serialize=function(){if(arguments.length===0)return"";var opt,fn,args=Array.prototype.slice.call(arguments,0);opt=args.pop();opt&&opt.nodeType&&args.push(opt)&&(opt=null);opt&&(opt=opt.type);opt=="map"?fn=serializeHash:opt=="array"?fn=reqwest.serializeArray:fn=serializeQueryString;return fn.apply(null,args)};reqwest.toQueryString=function(o){var qs="",i,enc=encodeURIComponent,push=function(k,v){qs+=enc(k)+"="+enc(v)+"&"};if(isArray(o))for(i=0;o&&i<o.length;i++)push(o[i].name,o[i].value);else for(var k in o){if(!Object.hasOwnProperty.call(o,k))continue;var v=o[k];if(isArray(v))for(i=0;i<v.length;i++)push(k,v[i]);else push(k,o[k])}return qs.replace(/&$/,"").replace(/%20/g,"+")};reqwest.compat=function(o,fn){if(o){o.type&&(o.method=o.type)&&delete o.type;o.dataType&&(o.type=o.dataType);o.jsonpCallback&&(o.jsonpCallbackName=o.jsonpCallback)&&delete o.jsonpCallback;o.jsonp&&(o.jsonpCallback=o.jsonp)}return new Reqwest(o,fn)};return reqwest});provide("reqwest",module.exports);!function($){var r=require("reqwest"),integrate=function(method){return function(){var args=Array.prototype.slice.call(arguments,0),i=this&&this.length||0;while(i--)args.unshift(this[i]);return r[method].apply(null,args)}},s=integrate("serialize"),sa=integrate("serializeArray");$.ender({ajax:r,serialize:r.serialize,serializeArray:r.serializeArray,toQueryString:r.toQueryString});$.ender({serialize:s,serializeArray:sa},!0)}(ender)})();(function(){var module={exports:{}},exports=module.exports;
/*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
(function(name,definition,context){typeof module!="undefined"&&module.exports?module.exports=definition():typeof context["define"]=="function"&&context.define.amd?define(name,definition):context[name]=definition()})("bonzo",function(){function classReg(c){return new RegExp("(^|\\s+)"+c+"(\\s+|$)")}function each(ar,fn,opt_scope){for(var i=0,l=ar.length;i<l;i++)fn.call(opt_scope||ar[i],ar[i],i,ar);return ar}function deepEach(ar,fn,opt_scope){for(var i=0,l=ar.length;i<l;i++)if(isNode(ar[i])){deepEach(ar[i].childNodes,fn,opt_scope);fn.call(opt_scope||ar[i],ar[i],i,ar)}return ar}function camelize(s){return s.replace(/-(.)/g,function(m,m1){return m1.toUpperCase()})}function decamelize(s){return s?s.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase():s}function data(el){el[getAttribute]("data-node-uid")||el[setAttribute]("data-node-uid",++uuids);var uid=el[getAttribute]("data-node-uid");return uidMap[uid]||(uidMap[uid]={})}function clearData(el){var uid=el[getAttribute]("data-node-uid");uid&&delete uidMap[uid]}function dataValue(d){var f;try{return d===null||d===undefined?undefined:d==="true"?!0:d==="false"?!1:d==="null"?null:(f=parseFloat(d))==d?f:d}catch(e){}return undefined}function isNode(node){return node&&node.nodeName&&(node.nodeType==1||node.nodeType==11)}function some(ar,fn,opt_scope){for(var i=0,j=ar.length;i<j;++i)if(fn.call(opt_scope||null,ar[i],i,ar))return!0;return!1}function styleProperty(p){p=="transform"&&(p=features.transform)||/^transform-?[Oo]rigin$/.test(p)&&(p=features.transform+"Origin")||p=="float"&&(p=features.cssFloat);return p?camelize(p):null}function insert(target,host,fn){var i=0,self=host||this,r=[],nodes=query&&typeof target=="string"&&target.charAt(0)!="<"?query(target):target;each(normalize(nodes),function(t){each(self,function(el){var n=!el[parentNode]||el[parentNode]&&!el[parentNode][parentNode]?function(){var c=el.cloneNode(!0),cloneElems,elElems;if(self.$&&typeof self.cloneEvents=="function"){self.$(c).cloneEvents(el);cloneElems=self.$(c).find("*");elElems=self.$(el).find("*");for(var i=0;i<elElems.length;i++)self.$(cloneElems[i]).cloneEvents(elElems[i])}return c}():el;fn(t,n);r[i]=n;i++})},this);each(r,function(e,i){self[i]=e});self.length=i;return self}function xy(el,x,y){var $el=bonzo(el),style=$el.css("position"),offset=$el.offset(),rel="relative",isRel=style==rel,delta=[parseInt($el.css("left"),10),parseInt($el.css("top"),10)];if(style=="static"){$el.css("position",rel);style=rel}isNaN(delta[0])&&(delta[0]=isRel?0:el.offsetLeft);isNaN(delta[1])&&(delta[1]=isRel?0:el.offsetTop);x!=null&&(el.style.left=x-offset.left+delta[0]+px);y!=null&&(el.style.top=y-offset.top+delta[1]+px)}function setter(el,v){return typeof v=="function"?v(el):v}function Bonzo(elements){this.length=0;if(elements){elements=typeof elements!="string"&&!elements.nodeType&&typeof elements.length!="undefined"?elements:[elements];this.length=elements.length;for(var i=0;i<elements.length;i++)this[i]=elements[i]}}function normalize(node){return typeof node=="string"?bonzo.create(node):isNode(node)?[node]:node}function scroll(x,y,type){var el=this[0];if(!el)return this;if(x==null&&y==null)return(isBody(el)?getWindowScroll():{x:el.scrollLeft,y:el.scrollTop})[type];if(isBody(el))win.scrollTo(x,y);else{x!=null&&(el.scrollLeft=x);y!=null&&(el.scrollTop=y)}return this}function isBody(element){return element===win||/^(?:body|html)$/i.test(element.tagName)}function getWindowScroll(){return{x:win.pageXOffset||html.scrollLeft,y:win.pageYOffset||html.scrollTop}}function bonzo(els){return new Bonzo(els)}var context=this,win=window,doc=win.document,html=doc.documentElement,parentNode="parentNode",query=null,specialAttributes=/^(checked|value|selected)$/i,specialTags=/^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,table=["<table>","</table>",1],td=["<table><tbody><tr>","</tr></tbody></table>",3],option=["<select>","</select>",1],noscope=["_","",0,1],tagMap={thead:table,tbody:table,tfoot:table,colgroup:table,caption:table,tr:["<table><tbody>","</tbody></table>",2],th:td,td:td,col:["<table><colgroup>","</colgroup></table>",2],fieldset:["<form>","</form>",1],legend:["<form><fieldset>","</fieldset></form>",2],option:option,optgroup:option,script:noscope,style:noscope,link:noscope,param:noscope,base:noscope},stateAttributes=/^(checked|selected)$/,ie=/msie/i.test(navigator.userAgent),hasClass,addClass,removeClass,uidMap={},uuids=0,digit=/^-?[\d\.]+$/,dattr=/^data-(.+)$/,px="px",setAttribute="setAttribute",getAttribute="getAttribute",byTag="getElementsByTagName",features=function(){var e=doc.createElement("p");e.innerHTML='<a href="#x">x</a><table style="float:left;"></table>';return{hrefExtended:e[byTag]("a")[0][getAttribute]("href")!="#x",autoTbody:e[byTag]("tbody").length!==0,computedStyle:doc.defaultView&&doc.defaultView.getComputedStyle,cssFloat:e[byTag]("table")[0].style.styleFloat?"styleFloat":"cssFloat",transform:function(){var props=["webkitTransform","MozTransform","OTransform","msTransform","Transform"],i;for(i=0;i<props.length;i++)if(props[i]in e.style)return props[i]}(),classList:"classList"in e}}(),trimReplace=/(^\s*|\s*$)/g,whitespaceRegex=/\s+/,toString=String.prototype.toString,unitless={lineHeight:1,zoom:1,zIndex:1,opacity:1,boxFlex:1,WebkitBoxFlex:1,MozBoxFlex:1},trim=String.prototype.trim?function(s){return s.trim()}:function(s){return s.replace(trimReplace,"")},getStyle=features.computedStyle?function(el,property){var value=null,computed=doc.defaultView.getComputedStyle(el,"");computed&&(value=computed[property]);return el.style[property]||value}:ie&&html.currentStyle?function(el,property){if(property=="opacity"){var val=100;try{val=el.filters["DXImageTransform.Microsoft.Alpha"].opacity}catch(e1){try{val=el.filters("alpha").opacity}catch(e2){}}return val/100}var value=el.currentStyle?el.currentStyle[property]:null;return el.style[property]||value}:function(el,property){return el.style[property]};if(features.classList){hasClass=function(el,c){return el.classList.contains(c)};addClass=function(el,c){el.classList.add(c)};removeClass=function(el,c){el.classList.remove(c)}}else{hasClass=function(el,c){return classReg(c).test(el.className)};addClass=function(el,c){el.className=trim(el.className+" "+c)};removeClass=function(el,c){el.className=trim(el.className.replace(classReg(c)," "))}}Bonzo.prototype={get:function(index){return this[index]||null},each:function(fn,opt_scope){return each(this,fn,opt_scope)},deepEach:function(fn,opt_scope){return deepEach(this,fn,opt_scope)},map:function(fn,opt_reject){var m=[],n,i;for(i=0;i<this.length;i++){n=fn.call(this,this[i],i);opt_reject?opt_reject(n)&&m.push(n):m.push(n)}return m},html:function(h,opt_text){function append(el){each(normalize(h),function(node){el.appendChild(node)})}var method=opt_text?html.textContent===undefined?"innerText":"textContent":"innerHTML";return typeof h!="undefined"?this.empty().each(function(el){!opt_text&&specialTags.test(el.tagName)?append(el):function(){try{el[method]=h}catch(e){append(el)}}()}):this[0]?this[0][method]:""},text:function(opt_text){return this.html(opt_text,!0)},append:function(node){return this.each(function(el){each(normalize(node),function(i){el.appendChild(i)})})},prepend:function(node){return this.each(function(el){var first=el.firstChild;each(normalize(node),function(i){el.insertBefore(i,first)})})},appendTo:function(target,opt_host){return insert.call(this,target,opt_host,function(t,el){t.appendChild(el)})},prependTo:function(target,host){return insert.call(this,target,host,function(t,el){t.insertBefore(el,t.firstChild)})},before:function(node){return this.each(function(el){each(bonzo.create(node),function(i){el[parentNode].insertBefore(i,el)})})},after:function(node){return this.each(function(el){each(bonzo.create(node),function(i){el[parentNode].insertBefore(i,el.nextSibling)})})},insertBefore:function(target,host){return insert.call(this,target,host,function(t,el){t[parentNode].insertBefore(el,t)})},insertAfter:function(target,host){return insert.call(this,target,host,function(t,el){var sibling=t.nextSibling;sibling?t[parentNode].insertBefore(el,sibling):t[parentNode].appendChild(el)})},replaceWith:function(html){this.deepEach(clearData);return this.each(function(el){el.parentNode.replaceChild(bonzo.create(html)[0],el)})},addClass:function(c){c=toString.call(c).split(whitespaceRegex);return this.each(function(el){each(c,function(c){c&&!hasClass(el,setter(el,c))&&addClass(el,setter(el,c))})})},removeClass:function(c){c=toString.call(c).split(whitespaceRegex);return this.each(function(el){each(c,function(c){c&&hasClass(el,setter(el,c))&&removeClass(el,setter(el,c))})})},hasClass:function(c){c=toString.call(c).split(whitespaceRegex);return some(this,function(el){return some(c,function(c){return c&&hasClass(el,c)})})},toggleClass:function(c,opt_condition){c=toString.call(c).split(whitespaceRegex);return this.each(function(el){each(c,function(c){c&&(typeof opt_condition!="undefined"?opt_condition?addClass(el,c):removeClass(el,c):hasClass(el,c)?removeClass(el,c):addClass(el,c))})})},show:function(opt_type){return this.each(function(el){el.style.display=opt_type||""})},hide:function(){return this.each(function(el){el.style.display="none"})},toggle:function(opt_callback,opt_type){this.each(function(el){el.style.display=el.offsetWidth||el.offsetHeight?"none":opt_type||""});opt_callback&&opt_callback();return this},first:function(){return bonzo(this.length?this[0]:[])},last:function(){return bonzo(this.length?this[this.length-1]:[])},next:function(){return this.related("nextSibling")},previous:function(){return this.related("previousSibling")},parent:function(){return this.related(parentNode)},related:function(method){return this.map(function(el){el=el[method];while(el&&el.nodeType!==1)el=el[method];return el||0},function(el){return el})},focus:function(){this.length&&this[0].focus();return this},blur:function(){this.length&&this[0].blur();return this},css:function(o,opt_v){function fn(el,p,v){for(var k in iter)if(iter.hasOwnProperty(k)){v=iter[k];(p=styleProperty(k))&&digit.test(v)&&!(p in unitless)&&(v+=px);el.style[p]=setter(el,v)}}var p;if(opt_v===undefined&&typeof o=="string"){opt_v=this[0];if(!opt_v)return null;if(opt_v===doc||opt_v===win){p=opt_v===doc?bonzo.doc():bonzo.viewport();return o=="width"?p.width:o=="height"?p.height:""}return(o=styleProperty(o))?getStyle(opt_v,o):null}var iter=o;if(typeof o=="string"){iter={};iter[o]=opt_v}if(ie&&iter.opacity){iter.filter="alpha(opacity="+iter.opacity*100+")";iter.zoom=o.zoom||1;delete iter.opacity}return this.each(fn)},offset:function(opt_x,opt_y){if(typeof opt_x=="number"||typeof opt_y=="number")return this.each(function(el){xy(el,opt_x,opt_y)});if(!this[0])return{top:0,left:0,height:0,width:0};var el=this[0],width=el.offsetWidth,height=el.offsetHeight,top=el.offsetTop,left=el.offsetLeft;while(el=el.offsetParent){top+=el.offsetTop;left+=el.offsetLeft;if(el!=doc.body){top-=el.scrollTop;left-=el.scrollLeft}}return{top:top,left:left,height:height,width:width}},dim:function(){if(!this.length)return{height:0,width:0};var el=this[0],orig=!el.offsetWidth&&!el.offsetHeight?function(t){var s={position:el.style.position||"",visibility:el.style.visibility||"",display:el.style.display||""};t.first().css({position:"absolute",visibility:"hidden",display:"block"});return s}(this):null,width=el.offsetWidth,height=el.offsetHeight;orig&&this.first().css(orig);return{height:height,width:width}},attr:function(k,opt_v){var el=this[0];if(typeof k=="string"||k instanceof String)return typeof opt_v=="undefined"?el?specialAttributes.test(k)?stateAttributes.test(k)&&typeof el[k]=="string"?!0:el[k]:k!="href"&&k!="src"||!features.hrefExtended?el[getAttribute](k):el[getAttribute](k,2):null:this.each(function(el){specialAttributes.test(k)?el[k]=setter(el,opt_v):el[setAttribute](k,setter(el,opt_v))});for(var n in k)k.hasOwnProperty(n)&&this.attr(n,k[n]);return this},removeAttr:function(k){return this.each(function(el){stateAttributes.test(k)?el[k]=!1:el.removeAttribute(k)})},val:function(s){return typeof s=="string"?this.attr("value",s):this.length?this[0].value:null},data:function(opt_k,opt_v){var el=this[0],uid,o,m;if(typeof opt_v=="undefined"){if(!el)return null;o=data(el);if(typeof opt_k=="undefined"){each(el.attributes,function(a){(m=(""+a.name).match(dattr))&&(o[camelize(m[1])]=dataValue(a.value))});return o}typeof o[opt_k]=="undefined"&&(o[opt_k]=dataValue(this.attr("data-"+decamelize(opt_k))));return o[opt_k]}return this.each(function(el){data(el)[opt_k]=opt_v})},remove:function(){this.deepEach(clearData);return this.each(function(el){el[parentNode]&&el[parentNode].removeChild(el)})},empty:function(){return this.each(function(el){deepEach(el.childNodes,clearData);while(el.firstChild)el.removeChild(el.firstChild)})},detach:function(){return this.each(function(el){el[parentNode].removeChild(el)})},scrollTop:function(y){return scroll.call(this,null,y,"y")},scrollLeft:function(x){return scroll.call(this,x,null,"x")}};bonzo.setQueryEngine=function(q){query=q;delete bonzo.setQueryEngine};bonzo.aug=function(o,target){for(var k in o)o.hasOwnProperty(k)&&((target||Bonzo.prototype)[k]=o[k])};bonzo.create=function(node){return typeof node=="string"&&node!==""?function(){var tag=/^\s*<([^\s>]+)/.exec(node),el=doc.createElement("div"),els=[],p=tag?tagMap[tag[1].toLowerCase()]:null,dep=p?p[2]+1:1,ns=p&&p[3],pn=parentNode,tb=features.autoTbody&&p&&p[0]=="<table>"&&!/<tbody/i.test(node);el.innerHTML=p?p[0]+node+p[1]:node;while(dep--)el=el.firstChild;ns&&el&&el.nodeType!==1&&(el=el.nextSibling);do(!tag||el.nodeType==1)&&(!tb||el.tagName.toLowerCase()!="tbody")&&els.push(el);while(el=el.nextSibling);each(els,function(el){el[pn]&&el[pn].removeChild(el)});return els}():isNode(node)?[node.cloneNode(!0)]:[]};bonzo.doc=function(){var vp=bonzo.viewport();return{width:Math.max(doc.body.scrollWidth,html.scrollWidth,vp.width),height:Math.max(doc.body.scrollHeight,html.scrollHeight,vp.height)}};bonzo.firstChild=function(el){for(var c=el.childNodes,i=0,j=c&&c.length||0,e;i<j;i++)c[i].nodeType===1&&(e=c[j=i]);return e};bonzo.viewport=function(){return{width:ie?html.clientWidth:self.innerWidth,height:ie?html.clientHeight:self.innerHeight}};bonzo.isAncestor="compareDocumentPosition"in html?function(container,element){return(container.compareDocumentPosition(element)&16)==16}:"contains"in html?function(container,element){return container!==element&&container.contains(element)}:function(container,element){while(element=element[parentNode])if(element===container)return!0;return!1};return bonzo},this);provide("bonzo",module.exports);(function($){function indexOf(ar,val){for(var i=0;i<ar.length;i++)if(ar[i]===val)return i;return-1}function uniq(ar){var r=[],i=0,j=0,k,item,inIt;for(;item=ar[i];++i){inIt=!1;for(k=0;k<r.length;++k)if(r[k]===item){inIt=!0;break}inIt||(r[j++]=item)}return r}function dimension(type,opt_v){return typeof opt_v=="undefined"?b(this).dim()[type]:this.css(type,opt_v)}var b=require("bonzo");b.setQueryEngine($);$.ender(b);$.ender(b(),!0);$.ender({create:function(node){return $(b.create(node))}});$.id=function(id){return $([document.getElementById(id)])};$.ender({parents:function(selector,closest){if(!this.length)return this;var collection=$(selector),j,k,p,r=[];for(j=0,k=this.length;j<k;j++){p=this[j];while(p=p.parentNode)if(~indexOf(collection,p)){r.push(p);if(closest)break}}return $(uniq(r))},parent:function(){return $(uniq(b(this).parent()))},closest:function(selector){return this.parents(selector,!0)},first:function(){return $(this.length?this[0]:this)},last:function(){return $(this.length?this[this.length-1]:[])},next:function(){return $(b(this).next())},previous:function(){return $(b(this).previous())},appendTo:function(t){return b(this.selector).appendTo(t,this)},prependTo:function(t){return b(this.selector).prependTo(t,this)},insertAfter:function(t){return b(this.selector).insertAfter(t,this)},insertBefore:function(t){return b(this.selector).insertBefore(t,this)},siblings:function(){var i,l,p,r=[];for(i=0,l=this.length;i<l;i++){p=this[i];while(p=p.previousSibling)p.nodeType==1&&r.push(p);p=this[i];while(p=p.nextSibling)p.nodeType==1&&r.push(p)}return $(r)},children:function(){var i,l,el,r=[];for(i=0,l=this.length;i<l;i++){if(!(el=b.firstChild(this[i])))continue;r.push(el);while(el=el.nextSibling)el.nodeType==1&&r.push(el)}return $(uniq(r))},height:function(v){return dimension.call(this,"height",v)},width:function(v){return dimension.call(this,"width",v)}},!0)})(ender)})();(function(){var module={exports:{}},exports=module.exports;
/*!
    * @preserve Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2012
    * MIT License
    */
(function(name,definition,context){typeof module!="undefined"&&module.exports?module.exports=definition():typeof context["define"]=="function"&&context.define.amd?define(name,definition):context[name]=definition()})("qwery",function(){function cache(){this.c={}}function classRegex(c){return classCache.g(c)||classCache.s(c,"(^|\\s+)"+c+"(\\s+|$)",1)}function each(a,fn){var i=0,l=a.length;for(;i<l;i++)fn(a[i])}function flatten(ar){for(var r=[],i=0,l=ar.length;i<l;++i)arrayLike(ar[i])?r=r.concat(ar[i]):r[r.length]=ar[i];return r}function arrayify(ar){var i=0,l=ar.length,r=[];for(;i<l;i++)r[i]=ar[i];return r}function previous(n){while(n=n.previousSibling)if(n[nodeType]==1)break;return n}function q(query){return query.match(chunker)}function interpret(whole,tag,idsAndClasses,wholeAttribute,attribute,qualifier,value,wholePseudo,pseudo,wholePseudoVal,pseudoVal){var i,m,k,o,classes;if(this[nodeType]!==1)return!1;if(tag&&tag!=="*"&&this[tagName]&&this[tagName].toLowerCase()!==tag)return!1;if(idsAndClasses&&(m=idsAndClasses.match(id))&&m[1]!==this.id)return!1;if(idsAndClasses&&(classes=idsAndClasses.match(clas)))for(i=classes.length;i--;)if(!classRegex(classes[i].slice(1)).test(this.className))return!1;if(pseudo&&qwery.pseudos[pseudo]&&!qwery.pseudos[pseudo](this,pseudoVal))return!1;if(wholeAttribute&&!value){o=this.attributes;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k)&&(o[k].name||k)==attribute)return this}return wholeAttribute&&!checkAttr(qualifier,getAttr(this,attribute)||"",value)?!1:this}function clean(s){return cleanCache.g(s)||cleanCache.s(s,s.replace(specialChars,"\\$1"))}function checkAttr(qualify,actual,val){switch(qualify){case"=":return actual==val;case"^=":return actual.match(attrCache.g("^="+val)||attrCache.s("^="+val,"^"+clean(val),1));case"$=":return actual.match(attrCache.g("$="+val)||attrCache.s("$="+val,clean(val)+"$",1));case"*=":return actual.match(attrCache.g(val)||attrCache.s(val,clean(val),1));case"~=":return actual.match(attrCache.g("~="+val)||attrCache.s("~="+val,"(?:^|\\s+)"+clean(val)+"(?:\\s+|$)",1));case"|=":return actual.match(attrCache.g("|="+val)||attrCache.s("|="+val,"^"+clean(val)+"(-|$)",1))}return 0}function _qwery(selector,_root){var r=[],ret=[],i,l,m,token,tag,els,intr,item,root=_root,tokens=tokenCache.g(selector)||tokenCache.s(selector,selector.split(tokenizr)),dividedTokens=selector.match(dividers);if(!tokens.length)return r;token=(tokens=tokens.slice(0)).pop();tokens.length&&(m=tokens[tokens.length-1].match(idOnly))&&(root=byId(_root,m[1]));if(!root)return r;intr=q(token);els=root!==_root&&root[nodeType]!==9&&dividedTokens&&/^[+~]$/.test(dividedTokens[dividedTokens.length-1])?function(r){while(root=root.nextSibling)root[nodeType]==1&&(intr[1]?intr[1]==root[tagName].toLowerCase():1)&&(r[r.length]=root);return r}([]):root[byTag](intr[1]||"*");for(i=0,l=els.length;i<l;i++)if(item=interpret.apply(els[i],intr))r[r.length]=item;if(!tokens.length)return r;each(r,function(e){ancestorMatch(e,tokens,dividedTokens)&&(ret[ret.length]=e)});return ret}function is(el,selector,root){if(isNode(selector))return el==selector;if(arrayLike(selector))return!!~flatten(selector).indexOf(el);var selectors=selector.split(","),tokens,dividedTokens;while(selector=selectors.pop()){tokens=tokenCache.g(selector)||tokenCache.s(selector,selector.split(tokenizr));dividedTokens=selector.match(dividers);tokens=tokens.slice(0);if(interpret.apply(el,q(tokens.pop()))&&(!tokens.length||ancestorMatch(el,tokens,dividedTokens,root)))return!0}return!1}function ancestorMatch(el,tokens,dividedTokens,root){function crawl(e,i,p){while(p=walker[dividedTokens[i]](p,e))if(isNode(p)&&interpret.apply(p,q(tokens[i]))){if(!i)return p;if(cand=crawl(p,i-1,p))return cand}}var cand;return(cand=crawl(el,tokens.length-1,el))&&(!root||isAncestor(cand,root))}function isNode(el,t){return el&&typeof el=="object"&&(t=el[nodeType])&&(t==1||t==9)}function uniq(ar){var a=[],i,j;e:for(i=0;i<ar.length;++i){for(j=0;j<a.length;++j)if(a[j]==ar[i])continue e;a[a.length]=ar[i]}return a}function arrayLike(o){return typeof o=="object"&&isFinite(o.length)}function normalizeRoot(root){return root?typeof root=="string"?qwery(root)[0]:!root[nodeType]&&arrayLike(root)?root[0]:root:doc}function byId(root,id,el){return root[nodeType]===9?root.getElementById(id):root.ownerDocument&&((el=root.ownerDocument.getElementById(id))&&isAncestor(el,root)&&el||!isAncestor(root,root.ownerDocument)&&select('[id="'+id+'"]',root)[0])}function qwery(selector,_root){var m,el,root=normalizeRoot(_root);if(!root||!selector)return[];if(selector===window||isNode(selector))return!_root||selector!==window&&isNode(root)&&isAncestor(selector,root)?[selector]:[];if(selector&&arrayLike(selector))return flatten(selector);if(m=selector.match(easy)){if(m[1])return(el=byId(root,m[1]))?[el]:[];if(m[2])return arrayify(root[byTag](m[2]));if(hasByClass&&m[3])return arrayify(root[byClass](m[3]))}return select(selector,root)}function collectSelector(root,collector){return function(s){var oid,nid;if(splittable.test(s)){if(root[nodeType]!==9){(nid=oid=root.getAttribute("id"))||root.setAttribute("id",nid="__qwerymeupscotty");s='[id="'+nid+'"]'+s;collector(root.parentNode||root,s,!0);oid||root.removeAttribute("id")}return}s.length&&collector(root,s,!1)}}var doc=document,html=doc.documentElement,byClass="getElementsByClassName",byTag="getElementsByTagName",qSA="querySelectorAll",useNativeQSA="useNativeQSA",tagName="tagName",nodeType="nodeType",select,id=/#([\w\-]+)/,clas=/\.[\w\-]+/g,idOnly=/^#([\w\-]+)$/,classOnly=/^\.([\w\-]+)$/,tagOnly=/^([\w\-]+)$/,tagAndOrClass=/^([\w]+)?\.([\w\-]+)$/,splittable=/(^|,)\s*[>~+]/,normalizr=/^\s+|\s*([,\s\+\~>]|$)\s*/g,splitters=/[\s\>\+\~]/,splittersMore=/(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/,specialChars=/([.*+?\^=!:${}()|\[\]\/\\])/g,simple=/^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,attr=/\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,pseudo=/:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/,easy=new RegExp(idOnly.source+"|"+tagOnly.source+"|"+classOnly.source),dividers=new RegExp("("+splitters.source+")"+splittersMore.source,"g"),tokenizr=new RegExp(splitters.source+splittersMore.source),chunker=new RegExp(simple.source+"("+attr.source+")?"+"("+pseudo.source+")?"),walker={" ":function(node){return node&&node!==html&&node.parentNode},">":function(node,contestant){return node&&node.parentNode==contestant.parentNode&&node.parentNode},"~":function(node){return node&&node.previousSibling},"+":function(node,contestant,p1,p2){return node?(p1=previous(node))&&(p2=previous(contestant))&&p1==p2&&p1:!1}};cache.prototype={g:function(k){return this.c[k]||undefined},s:function(k,v,r){v=r?new RegExp(v):v;return this.c[k]=v}};var classCache=new cache,cleanCache=new cache,attrCache=new cache,tokenCache=new cache,isAncestor="compareDocumentPosition"in html?function(element,container){return(container.compareDocumentPosition(element)&16)==16}:"contains"in html?function(element,container){container=container[nodeType]===9||container==window?html:container;return container!==element&&container.contains(element)}:function(element,container){while(element=element.parentNode)if(element===container)return 1;return 0},getAttr=function(){var e=doc.createElement("p");return(e.innerHTML='<a href="#x">x</a>')&&e.firstChild.getAttribute("href")!="#x"?function(e,a){return a==="class"?e.className:a==="href"||a==="src"?e.getAttribute(a,2):e.getAttribute(a)}:function(e,a){return e.getAttribute(a)}}(),hasByClass=!!doc[byClass],hasQSA=doc.querySelector&&doc[qSA],selectQSA=function(selector,root){var result=[],ss,e;try{if(root[nodeType]===9||!splittable.test(selector))return arrayify(root[qSA](selector));each(ss=selector.split(","),collectSelector(root,function(ctx,s){e=ctx[qSA](s);e.length==1?result[result.length]=e.item(0):e.length&&(result=result.concat(arrayify(e)))}));return ss.length>1&&result.length>1?uniq(result):result}catch(ex){}return selectNonNative(selector,root)},selectNonNative=function(selector,root){var result=[],items,m,i,l,r,ss;selector=selector.replace(normalizr,"$1");if(m=selector.match(tagAndOrClass)){r=classRegex(m[2]);items=root[byTag](m[1]||"*");for(i=0,l=items.length;i<l;i++)r.test(items[i].className)&&(result[result.length]=items[i]);return result}each(ss=selector.split(","),collectSelector(root,function(ctx,s,rewrite){r=_qwery(s,ctx);for(i=0,l=r.length;i<l;i++)if(ctx[nodeType]===9||rewrite||isAncestor(r[i],root))result[result.length]=r[i]}));return ss.length>1&&result.length>1?uniq(result):result},configure=function(options){typeof options[useNativeQSA]!="undefined"&&(select=options[useNativeQSA]?hasQSA?selectQSA:selectNonNative:selectNonNative)};configure({useNativeQSA:!0});qwery.configure=configure;qwery.uniq=uniq;qwery.is=is;qwery.pseudos={};return qwery},this);provide("qwery",module.exports);(function($){var q=function(){var r;try{r=require("qwery")}catch(ex){r=require("qwery-mobile")}finally{return r}}();$.pseudos=q.pseudos;$._select=function(s,r){return($._select=function(){var b;if(typeof $.create=="function")return function(s,r){return/^\s*</.test(s)?$.create(s,r):q(s,r)};try{b=require("bonzo");return function(s,r){return/^\s*</.test(s)?b.create(s,r):q(s,r)}}catch(e){}return q}())(s,r)};$.ender({find:function(s){var r=[],i,l,j,k,els;for(i=0,l=this.length;i<l;i++){els=q(s,this[i]);for(j=0,k=els.length;j<k;j++)r.push(els[j])}return $(q.uniq(r))},and:function(s){var plus=$(s);for(var i=this.length,j=0,l=this.length+plus.length;i<l;i++,j++)this[i]=plus[j];this.length+=plus.length;return this},is:function(s,r){var i,l;for(i=0,l=this.length;i<l;i++)if(q.is(this[i],s,r))return!0;return!1}},!0)})(ender)})();(function(){var module={exports:{}},exports=module.exports;
/*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
;!function(name,context,definition){typeof module!="undefined"?module.exports=definition(name,context):typeof define=="function"&&typeof define.amd=="object"?define(definition):context[name]=definition(name,context)}("bean",this,function(name,context){var win=window,old=context[name],overOut=/over|out/,namespaceRegex=/[^\.]*(?=\..*)\.|.*/,nameRegex=/\..*/,addEvent="addEventListener",attachEvent="attachEvent",removeEvent="removeEventListener",detachEvent="detachEvent",ownerDocument="ownerDocument",targetS="target",qSA="querySelectorAll",doc=document||{},root=doc.documentElement||{},W3C_MODEL=root[addEvent],eventSupport=W3C_MODEL?addEvent:attachEvent,slice=Array.prototype.slice,mouseTypeRegex=/click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i,mouseWheelTypeRegex=/mouse.*(wheel|scroll)/i,textTypeRegex=/^text/i,touchTypeRegex=/^touch|^gesture/i,ONE={},nativeEvents=function(hash,events,i){for(i=0;i<events.length;i++)hash[events[i]]=1;return hash}({},("click dblclick mouseup mousedown contextmenu mousewheel mousemultiwheel DOMMouseScroll mouseover mouseout mousemove selectstart selectend keydown keypress keyup orientationchange focus blur change reset select submit load unload beforeunload resize move DOMContentLoaded readystatechange message error abort scroll "+(W3C_MODEL?"show input invalid touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend readystatechange pageshow pagehide popstate hashchange offline online afterprint beforeprint dragstart dragenter dragover dragleave drag drop dragend loadstart progress suspend emptied stalled loadmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange volumechange cuechange checking noupdate downloading cached updateready obsolete ":"")).split(" ")),customEvents=function(){function check(event){var related=event.relatedTarget;return related?related!==this&&related.prefix!=="xul"&&!/document/.test(this.toString())&&!isAncestor(related,this):related===null}var cdp="compareDocumentPosition",isAncestor=cdp in root?function(element,container){return container[cdp]&&(container[cdp](element)&16)===16}:"contains"in root?function(element,container){container=container.nodeType===9||container===window?root:container;return container!==element&&container.contains(element)}:function(element,container){while(element=element.parentNode)if(element===container)return 1;return 0};return{mouseenter:{base:"mouseover",condition:check},mouseleave:{base:"mouseout",condition:check},mousewheel:{base:/Firefox/.test(navigator.userAgent)?"DOMMouseScroll":"mousewheel"}}}(),fixEvent=function(){var commonProps="altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which".split(" "),mouseProps=commonProps.concat("button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" ")),mouseWheelProps=mouseProps.concat("wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis".split(" ")),keyProps=commonProps.concat("char charCode key keyCode keyIdentifier keyLocation".split(" ")),textProps=commonProps.concat(["data"]),touchProps=commonProps.concat("touches targetTouches changedTouches scale rotation".split(" ")),messageProps=commonProps.concat(["data","origin","source"]),preventDefault="preventDefault",createPreventDefault=function(event){return function(){event[preventDefault]?event[preventDefault]():event.returnValue=!1}},stopPropagation="stopPropagation",createStopPropagation=function(event){return function(){event[stopPropagation]?event[stopPropagation]():event.cancelBubble=!0}},createStop=function(synEvent){return function(){synEvent[preventDefault]();synEvent[stopPropagation]();synEvent.stopped=!0}},copyProps=function(event,result,props){var i,p;for(i=props.length;i--;){p=props[i];!(p in result)&&p in event&&(result[p]=event[p])}};return function(event,isNative){var result={originalEvent:event,isNative:isNative};if(!event)return result;var props,type=event.type,target=event[targetS]||event.srcElement;result[preventDefault]=createPreventDefault(event);result[stopPropagation]=createStopPropagation(event);result.stop=createStop(result);result[targetS]=target&&target.nodeType===3?target.parentNode:target;if(isNative){if(type.indexOf("key")!==-1){props=keyProps;result.keyCode=event.keyCode||event.which}else if(mouseTypeRegex.test(type)){props=mouseProps;result.rightClick=event.which===3||event.button===2;result.pos={x:0,y:0};if(event.pageX||event.pageY){result.clientX=event.pageX;result.clientY=event.pageY}else if(event.clientX||event.clientY){result.clientX=event.clientX+doc.body.scrollLeft+root.scrollLeft;result.clientY=event.clientY+doc.body.scrollTop+root.scrollTop}overOut.test(type)&&(result.relatedTarget=event.relatedTarget||event[(type==="mouseover"?"from":"to")+"Element"])}else touchTypeRegex.test(type)?props=touchProps:mouseWheelTypeRegex.test(type)?props=mouseWheelProps:textTypeRegex.test(type)?props=textProps:type==="message"&&(props=messageProps);copyProps(event,result,props||commonProps)}return result}}(),targetElement=function(element,isNative){return!W3C_MODEL&&!isNative&&(element===doc||element===win)?root:element},RegEntry=function(){function entry(element,type,handler,original,namespaces){var isNative=this.isNative=nativeEvents[type]&&element[eventSupport];this.element=element;this.type=type;this.handler=handler;this.original=original;this.namespaces=namespaces;this.custom=customEvents[type];this.eventType=W3C_MODEL||isNative?type:"propertychange";this.customType=!W3C_MODEL&&!isNative&&type;this[targetS]=targetElement(element,isNative);this[eventSupport]=this[targetS][eventSupport]}entry.prototype={inNamespaces:function(checkNamespaces){var i,j;if(!checkNamespaces)return!0;if(!this.namespaces)return!1;for(i=checkNamespaces.length;i--;)for(j=this.namespaces.length;j--;)if(checkNamespaces[i]===this.namespaces[j])return!0;return!1},matches:function(checkElement,checkOriginal,checkHandler){return this.element===checkElement&&(!checkOriginal||this.original===checkOriginal)&&(!checkHandler||this.handler===checkHandler)}};return entry}(),registry=function(){var map={},forAll=function(element,type,original,handler,fn){if(!type||type==="*")for(var t in map)t.charAt(0)==="$"&&forAll(element,t.substr(1),original,handler,fn);else{var i=0,l,list=map["$"+type],all=element==="*";if(!list)return;for(l=list.length;i<l;i++)if(all||list[i].matches(element,original,handler))if(!fn(list[i],list,i,type))return}},has=function(element,type,original){var i,list=map["$"+type];if(list)for(i=list.length;i--;)if(list[i].matches(element,original,null))return!0;return!1},get=function(element,type,original){var entries=[];forAll(element,type,original,null,function(entry){return entries.push(entry)});return entries},put=function(entry){(map["$"+entry.type]||(map["$"+entry.type]=[])).push(entry);return entry},del=function(entry){forAll(entry.element,entry.type,null,entry.handler,function(entry,list,i){list.splice(i,1);list.length===0&&delete map["$"+entry.type];return!1})},entries=function(){var t,entries=[];for(t in map)t.charAt(0)==="$"&&(entries=entries.concat(map[t]));return entries};return{has:has,get:get,put:put,del:del,entries:entries}}(),selectorEngine=doc[qSA]?function(s,r){return r[qSA](s)}:function(){throw new Error("Bean: No selector engine installed")},setSelectorEngine=function(e){selectorEngine=e},listener=W3C_MODEL?function(element,type,fn,add){element[add?addEvent:removeEvent](type,fn,!1)}:function(element,type,fn,add,custom){custom&&add&&element["_on"+custom]===null&&(element["_on"+custom]=0);element[add?attachEvent:detachEvent]("on"+type,fn)},nativeHandler=function(element,fn,args){var beanDel=fn.__beanDel,handler=function(event){event=fixEvent(event||((this[ownerDocument]||this.document||this).parentWindow||win).event,!0);beanDel&&(event.currentTarget=beanDel.ft(event[targetS],element));return fn.apply(element,[event].concat(args))};handler.__beanDel=beanDel;return handler},customHandler=function(element,fn,type,condition,args,isNative){var beanDel=fn.__beanDel,handler=function(event){var target=beanDel?beanDel.ft(event[targetS],element):this;if(condition?condition.apply(target,arguments):W3C_MODEL?!0:event&&event.propertyName==="_on"+type||!event){if(event){event=fixEvent(event||((this[ownerDocument]||this.document||this).parentWindow||win).event,isNative);event.currentTarget=target}fn.apply(element,event&&(!args||args.length===0)?arguments:slice.call(arguments,event?0:1).concat(args))}};handler.__beanDel=beanDel;return handler},once=function(rm,element,type,fn,originalFn){return function(){rm(element,type,originalFn);fn.apply(this,arguments)}},removeListener=function(element,orgType,handler,namespaces){var i,l,entry,type=orgType&&orgType.replace(nameRegex,""),handlers=registry.get(element,type,handler);for(i=0,l=handlers.length;i<l;i++)if(handlers[i].inNamespaces(namespaces)){(entry=handlers[i])[eventSupport]&&listener(entry[targetS],entry.eventType,entry.handler,!1,entry.type);registry.del(entry)}},addListener=function(element,orgType,fn,originalFn,args){var entry,type=orgType.replace(nameRegex,""),namespaces=orgType.replace(namespaceRegex,"").split(".");if(registry.has(element,type,fn))return element;type==="unload"&&(fn=once(removeListener,element,type,fn,originalFn));if(customEvents[type]){customEvents[type].condition&&(fn=customHandler(element,fn,type,customEvents[type].condition,args,!0));type=customEvents[type].base||type}entry=registry.put(new RegEntry(element,type,fn,originalFn,namespaces[0]&&namespaces));entry.handler=entry.isNative?nativeHandler(element,entry.handler,args):customHandler(element,entry.handler,type,!1,args,!1);entry[eventSupport]&&listener(entry[targetS],entry.eventType,entry.handler,!0,entry.customType)},del=function(selector,fn,$){var findTarget=function(target,root){var i,array=typeof selector=="string"?$(selector,root):selector;for(;target&&target!==root;target=target.parentNode)for(i=array.length;i--;)if(array[i]===target)return target},handler=function(e){var match=findTarget(e[targetS],this);match&&fn.apply(match,arguments)};handler.__beanDel={ft:findTarget,selector:selector,$:$};return handler},remove=function(element,typeSpec,fn){var k,type,namespaces,i,rm=removeListener,isString=typeSpec&&typeof typeSpec=="string";if(isString&&typeSpec.indexOf(" ")>0){typeSpec=typeSpec.split(" ");for(i=typeSpec.length;i--;)remove(element,typeSpec[i],fn);return element}type=isString&&typeSpec.replace(nameRegex,"");type&&customEvents[type]&&(type=customEvents[type].type);if(!typeSpec||isString){if(namespaces=isString&&typeSpec.replace(namespaceRegex,""))namespaces=namespaces.split(".");rm(element,type,fn,namespaces)}else if(typeof typeSpec=="function")rm(element,null,typeSpec);else for(k in typeSpec)typeSpec.hasOwnProperty(k)&&remove(element,k,typeSpec[k]);return element},add=function(element,events,fn,delfn,$){var type,types,i,args,originalFn=fn,isDel=fn&&typeof fn=="string";if(events&&!fn&&typeof events=="object")for(type in events)events.hasOwnProperty(type)&&add.apply(this,[element,type,events[type]]);else{args=arguments.length>3?slice.call(arguments,3):[];types=(isDel?fn:events).split(" ");isDel&&(fn=del(events,originalFn=delfn,$||selectorEngine))&&(args=slice.call(args,1));this===ONE&&(fn=once(remove,element,events,fn,originalFn));for(i=types.length;i--;)addListener(element,types[i],fn,originalFn,args)}return element},one=function(){return add.apply(ONE,arguments)},fireListener=W3C_MODEL?function(isNative,type,element){var evt=doc.createEvent(isNative?"HTMLEvents":"UIEvents");evt[isNative?"initEvent":"initUIEvent"](type,!0,!0,win,1);element.dispatchEvent(evt)}:function(isNative,type,element){element=targetElement(element,isNative);isNative?element.fireEvent("on"+type,doc.createEventObject()):element["_on"+type]++},fire=function(element,type,args){var i,j,l,names,handlers,types=type.split(" ");for(i=types.length;i--;){type=types[i].replace(nameRegex,"");if(names=types[i].replace(namespaceRegex,""))names=names.split(".");if(!names&&!args&&element[eventSupport])fireListener(nativeEvents[type],type,element);else{handlers=registry.get(element,type);args=[!1].concat(args);for(j=0,l=handlers.length;j<l;j++)handlers[j].inNamespaces(names)&&handlers[j].handler.apply(element,args)}}return element},clone=function(element,from,type){var i=0,handlers=registry.get(from,type),l=handlers.length,args,beanDel;for(;i<l;i++)if(handlers[i].original){beanDel=handlers[i].handler.__beanDel;beanDel?args=[element,beanDel.selector,handlers[i].type,handlers[i].original,beanDel.$]:args=[element,handlers[i].type,handlers[i].original];add.apply(null,args)}return element},bean={add:add,one:one,remove:remove,clone:clone,fire:fire,setSelectorEngine:setSelectorEngine,noConflict:function(){context[name]=old;return this}};if(win[attachEvent]){var cleanup=function(){var i,entries=registry.entries();for(i in entries)entries[i].type&&entries[i].type!=="unload"&&remove(entries[i].element,entries[i].type);win[detachEvent]("onunload",cleanup);win.CollectGarbage&&win.CollectGarbage()};win[attachEvent]("onunload",cleanup)}return bean});provide("bean",module.exports);!function($){var b=require("bean"),integrate=function(method,type,method2){var _args=type?[type]:[];return function(){for(var i=0,l=this.length;i<l;i++){!arguments.length&&method=="add"&&type&&(method="fire");b[method].apply(this,[this[i]].concat(_args,Array.prototype.slice.call(arguments,0)))}return this}},add=integrate("add"),remove=integrate("remove"),fire=integrate("fire"),methods={on:add,addListener:add,bind:add,listen:add,delegate:add,one:integrate("one"),off:remove,unbind:remove,unlisten:remove,removeListener:remove,undelegate:remove,emit:fire,trigger:fire,cloneEvents:integrate("clone"),hover:function(enter,leave,i){for(i=this.length;i--;){b.add.call(this,this[i],"mouseenter",enter);b.add.call(this,this[i],"mouseleave",leave)}return this}},shortcuts="blur change click dblclick error focus focusin focusout keydown keypress keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup mousemove resize scroll select submit unload".split(" ");for(var i=shortcuts.length;i--;)methods[shortcuts[i]]=integrate("add",shortcuts[i]);b.setSelectorEngine($);$.ender(methods,!0)}(ender)})()



$mustwatch = $.noConflict();

	
var mustwatch = {
	providers: {
		youtube: {
			isValidUrl: /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
			extractId: function (str) {
				if (mustwatch.providers.youtube.isValidUrl.test(str)) {
					//return XRegExp.exec(str,isYoutubeLink)[1];
					return str.match(mustwatch.providers.youtube.isValidUrl)[1];
				} else return false;
			},
			getInfo: function(id, callback){
				$mustwatch.ajax({
					url: "http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json&callback=?",
					method: 'get',
					type: 'jsonp',
					success: function (resp) {
				      var info = {
				      	title: resp.entry.title.$t || null,
				      	thumbnail: resp.entry.media$group.media$thumbnail[1].url
				      }
				      callback(null, info);
				    },
				    error: function(err){
				    	console.log("error getting youtube info for video: ", id)
				    	callback(err, null);
				    }
				})
			}
		},
		vimeo: {
			isValidUrl: /http:\/\/(www\.|player\.)?vimeo.com\/\D*\/?(\d+)($|\/?.*)/,  // end ($|\/.+)
			extractId: function (str) {
				if (mustwatch.providers.vimeo.isValidUrl.test(str)) {
					// return XRegExp.exec(str, isVimeoLink)[2];
					return str.match(mustwatch.providers.vimeo.isValidUrl)[2];
				} else return false;
			},
			getInfo: function(id, callback){
				$mustwatch.ajax({
					url: "http://vimeo.com/api/v2/video/"+id+".json?callback=?",
					method: 'get',
					type: 'jsonp',
					success: function (resp) {
				      var info = {
				      	title: resp[0].title,
				      	thumbnail: resp[0].thumbnail_small
				      }
				      callback(null, info);
				    },
				    error: function(err){
				    	console.log("error getting vimeo info for video: ", id)
				    	callback(err, null);
				    }
				})
			}
		}
	},
	methods: {
		getAllUrls: function(){
			var allLinks = mustwatch.methods.getAllLinks();
			var allMetaUrls = mustwatch.methods.getAllMetaUrls();
      var alliFrameUrls = mustwatch.methods.getAlliFrameUrls();

			return allLinks.concat(document.location.href, allMetaUrls, alliFrameUrls);
		},
		getAllLinks: function(){
			var allLinkElements = $mustwatch('[href]');
			var links = allLinkElements.map(function(el){
				return el.href;
			});

			return links;
		},
		getAllMetaUrls: function(){
			var allMetaUrls = $mustwatch('[itemprop="url"]');
			var urls = allMetaUrls.map(function (el) {
				return el.content;
			});

			return urls;
		},
    getAlliFrameUrls: function(){
      var alliFrameUrls = $mustwatch('iframe');
      var urls = alliFrameUrls.map(function (el) {
        return el.src;
      });

      return urls;
    },
		idAndProvider: function (str) {
			var youtubeId = mustwatch.providers.youtube.extractId(str);
			var vimeoId = mustwatch.providers.vimeo.extractId(str);

			if (youtubeId) return {provider: 'youtube', id: youtubeId};
			else if (vimeoId) return {provider: 'vimeo', id: vimeoId};
			else return false;
		},
    serialize: function(obj, prefix) {
      var str = [];
      for(var p in obj) {
          var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
          str.push(typeof v == "object" ? 
              mustwatch.methods.serialize(v, k) :
              encodeURIComponent(k).replace(/'/g, "%27") + "=" + encodeURIComponent(v).replace(/'/g, "%27"));
      }
      return str.join("&");
    },
    setupAndHandlers: function(){
      // IE indexOf() fix
      if (!Array.prototype.indexOf) { 
          Array.prototype.indexOf = function(obj, start) {
               for (var i = (start || 0), j = this.length; i < j; i++) {
                   if (this[i] === obj) { return i; }
               }
               return -1;
          }
      }

      // injectCSS
      (function(){
        var s=document.createElement('link');
        s.setAttribute('href','http://www.mustwatch.it/css/mustwatch-bookmarklet.css?c=' + Math.random());
        s.setAttribute('rel','stylesheet');s.setAttribute('type','text/css');
        document.getElementsByTagName('head')[0].appendChild(s);
      })();


      // event handlers
      $mustwatch(window).resize(mustwatch.ui.onResize);
      $mustwatch('body').delegate('#mustwatch_select_overlay .close', 'click', mustwatch.ui.onClose)
      $mustwatch('body').delegate('.mustwatch_vid', 'click', mustwatch.ui.onVideoClick)

      mustwatch.initd = true;
    },

    checkIfUserLoggedIn: function(callback){
      $mustwatch.ajax({
        url: "http://www.mustwatch.it/logincheck?callback=?", 
        method: "get", 
        type: "jsonp", 
        success: function(msg){ callback(null, msg); }, 
        error: function(e){ callback(e, null); }
      })
    },

    submitVideo: function(data, callback){

      var reqUrl = "http://www.mustwatch.it/addVideo?" + mustwatch.methods.serialize(data) + "&callback=?";

      $mustwatch.ajax({
        url: reqUrl,
        method: 'get',
        type: 'jsonp',
        success: function(resp){ callback(null, resp); },
        error: function(err){ callback(err, null); }
      })
    }

	},
	ui: {
		templates: {
			selectOverlay: '<div id="mustwatch_select_overlay"><div id="mustwatch_select_overlay_inner"><div class="header" ><a class="close" href="#">close</a><h1>mustwatch.it</h1><p><strong id="videoCount">0</strong> Video(s) found.<br/><strong>Select the video you want</strong> to save to your mustwatch.it list.</p></div><ul></ul></div></div>'
		},

    selectOverlaySelector: "#mustwatch_select_overlay",

		showSelectOverlay: function(){
			var selectOverlay = $mustwatch('#mustwatch_select_overlay');
			if (!selectOverlay.length) {
				$mustwatch('body').append(mustwatch.ui.templates.selectOverlay);
				selectOverlay = $mustwatch('#mustwatch_select_overlay');
			} else {
				selectOverlay.show();
				$mustwatch('#mustwatch_select_overlay ul').html("");
			}
			$mustwatch('body').addClass("mustwatchVisible");
			mustwatch.ui.onResize();
		},

    removeSelectOverlay: function(){
      $mustwatch('body').removeClass("mustwatchVisible");
      $mustwatch('#mustwatch_select_overlay').remove();
    },

		onResize: function(){
			var vHeight = $mustwatch.viewport().height,
				  vWidth = $mustwatch.viewport().width;

			if (vWidth > 600) $mustwatch('#mustwatch_select_overlay ul').height((vHeight / 100 * 70) - 140 );
			else $mustwatch('#mustwatch_select_overlay ul').height(vHeight - 140);			
		},

    onClose: function(ev){
      ev.preventDefault();
      mustwatch.ui.removeSelectOverlay();
      return false;
    },

    loginPopup: function (url) {
      
      newwindow=window.open(url,'Login to mustwatch.it', 'height=290,width=300');
      if (window.focus) {newwindow.focus()}
      return false;
    },

    onVideoClick: function(ev){
      ev.preventDefault();
      var self = $mustwatch(this).find("a:first");
      mustwatch.toAdd = mustwatch.videos[self.attr("data-provider") + "_" + self.attr("data-id")];

      mustwatch.methods.checkIfUserLoggedIn(function(err, resp){
        if (!err && resp.loggedIn) {

          var data = mustwatch.toAdd;
          data.user = resp.user;
          data.source =  document.location.href;

          mustwatch.methods.submitVideo(data, function(err, response) {
            if (!err) {
              
              $mustwatch('#mustwatch_select_overlay_inner ul').remove();
              $mustwatch('#mustwatch_select_overlay_inner').append("<p class='mustwatchSuccess'>Great Success!</p>");
              
              window.setTimeout(function(){
                mustwatch.ui.removeSelectOverlay();
                mustwatch.toAdd = null;
              }, 3000);

            } else {
              alert("Error submitting Video to mustwatch.it");
            }
          })

        } else mustwatch.ui.loginPopup('http://www.mustwatch.it/bookmarkletLogin');
      });
      

      return false;
    }
	},
  toAdd: null,
	videos: {},
  videoCount: 0,
	initd: false,
	init: function(){

		if (!mustwatch.initd) mustwatch.methods.setupAndHandlers();

		var allUrls = mustwatch.methods.getAllUrls();

		var allVideos = [];
		var allIds = []; // to check for duplicates

		for (var item in allUrls) {
			var ok = mustwatch.methods.idAndProvider(allUrls[item]);
			if (ok) {

				if (allIds.indexOf(ok.id) === -1) {
					allVideos.push(ok);
					allIds.push(ok.id);
				}
				// else console.log("duplicate id: ", ok.id);
			}
		}

		// console.log(allVideos.length, " video(s) found: ", allVideos);
		mustwatch.ui.showSelectOverlay();

    // if there is only one video
    if (allVideos.length === 1) $mustwatch(mustwatch.ui.selectOverlaySelector).addClass("singleVideo")


    mustwatch.videoCount = 0;
      
		for (var v in allVideos) {
			if (typeof allVideos[v].id !== 'undefined' && allVideos[v].id.toString() !== 'undefined') {

				// get title and thumbnail from ID
				(function(video){
					mustwatch.providers[video.provider].getInfo(video.id, function(err, info){
						if (!err) {
							mustwatch.videos[video.provider + "_" + video.id] = {
								id: video.id,
								title: info.title,
								thumbnail: info.thumbnail,
								provider: video.provider
							}
              mustwatch.videoCount++;
              console.log(mustwatch.videos);
							$mustwatch('#mustwatch_select_overlay #videoCount').html(mustwatch.videoCount)
							$mustwatch('#mustwatch_select_overlay ul').append("<li><div class='mustwatch_vid'><a href='#' data-id='"+video.id+"' data-provider='"+video.provider+"'><img src='" + info.thumbnail + "' /></a><p><a href='#' data-id='"+video.id+"' data-provider='"+video.provider+"'>" + info.title + "</a></p></div></li>");
						} else console.log("error getting info for video: ", video.id);
					})
				})(allVideos[v]);				
			}
		}


	}
}

mustwatch.init();

