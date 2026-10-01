"use strict";(()=>{var e={};e.id=875,e.ids=[875],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5153:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>p,patchFetch:()=>l,requestAsyncStorage:()=>g,routeModule:()=>s,serverHooks:()=>d,staticGenerationAsyncStorage:()=>u});var i={};n.r(i),n.d(i,{POST:()=>x});var o=n(9303),a=n(8716),r=n(670),h=n(7070),c=n(8603);async function x(e){try{let t=await e.json();if(!t.word||!t.meaningVi)return h.NextResponse.json({error:"Thiếu th\xf4ng tin từ vựng."},{status:400});let n=await (0,c.o)(t);return h.NextResponse.json({success:!0,reply:n.reply,isBuiltIn:n.isBuiltIn})}catch(e){return console.error("AI Tutor API error:",e),h.NextResponse.json({error:"Lỗi kết nối với Trợ l\xfd AI."},{status:500})}}let s=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/ai/tutor/route",pathname:"/api/ai/tutor",filename:"route",bundlePath:"app/api/ai/tutor/route"},resolvedPagePath:"/Users/macm3/.gemini/antigravity/scratch/toeic-vocab/src/app/api/ai/tutor/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:u,serverHooks:d}=s,p="/api/ai/tutor/route";function l(){return(0,r.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:u})}},8603:(e,t,n)=>{async function i(e){let t=process.env.AI_API_KEY;if(t)try{let n=`Bạn l\xe0 Trợ l\xfd Gia sư TOEIC chuy\xean nghiệp d\xe0nh ri\xeang cho người học Việt Nam.
H\xe3y giải th\xedch từ vựng tiếng Anh "${e.word}" (${e.partOfSpeech} - ${e.meaningVi}) thật dễ hiểu, ngắn gọn, s\xfac t\xedch v\xe0 b\xe1m s\xe1t cấu tr\xfac đề thi TOEIC.
C\xe2u v\xed dụ: "${e.exampleSentence}" (Dịch: "${e.exampleTranslation}").
Lu\xf4n trả lời bằng tiếng Việt th\xe2n thiện, r\xf5 r\xe0ng, c\xf3 gạch đầu d\xf2ng điểm nhấn.`,i="";switch(e.promptType){case"explain_context":i=`Tại sao từ "${e.word}" lại được d\xf9ng trong ngữ cảnh n\xe0y? C\xf3 lưu \xfd hay mẹo g\xec khi l\xe0m b\xe0i thi TOEIC kh\xf4ng?`;break;case"toeic_example":i=`Cho t\xf4i th\xeam 2 c\xe2u v\xed dụ thực tế chuẩn phong c\xe1ch đề thi TOEIC Part 5 hoặc Part 7 c\xf3 sử dụng từ "${e.word}" k\xe8m dịch nghĩa tiếng Việt.`;break;case"synonym_diff":i=`Ph\xe2n biệt từ "${e.word}" với c\xe1c từ đồng nghĩa gần nghĩa thường gặp trong TOEIC v\xe0 bẫy đề thi cần ch\xfa \xfd.`;break;case"toeic_question":i=`Tạo một c\xe2u hỏi trắc nghiệm TOEIC Part 5 4 lựa chọn (A, B, C, D) \xe1p dụng từ "${e.word}" k\xe8m đ\xe1p \xe1n v\xe0 giải th\xedch chi tiết.`;break;case"custom":i=e.customQuestion||`Giải th\xedch chi tiết c\xe1ch d\xf9ng từ "${e.word}" trong b\xe0i thi TOEIC.`}let o=process.env.AI_API_URL||"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",a=`${o}?key=${t}`,r=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`${n}

Người học hỏi: ${i}`}]}]})});if(r.ok){let e=await r.json(),t=e?.candidates?.[0]?.content?.parts?.[0]?.text;if(t)return{reply:t,isBuiltIn:!1}}}catch(e){console.warn("AI API request failed, falling back to built-in tutor engine:",e)}return{reply:function(e){let{word:t,partOfSpeech:n,meaningVi:i,exampleSentence:o,exampleTranslation:a,collocations:r,topic:h}=e;switch(e.promptType){case"explain_context":return`### 💡 Ngữ cảnh & Mẹo thi TOEIC cho "${t}"

- **\xdd nghĩa trọng t\xe2m**: Trong đề thi TOEIC, từ **${t}** (${n}) mang nghĩa **"${i}"**.
- **Ngữ cảnh xuất hiện**: Thường xuy\xean xuất hiện trong chủ đề **${h||"doanh nghiệp & c\xf4ng sở"}**, đặc biệt l\xe0 Part 5 (điền từ v\xe0o c\xe2u) v\xe0 Part 7 (đoạn văn, email c\xf4ng việc).
- **Ph\xe2n t\xedch c\xe2u v\xed dụ**:
  > _"${o}"_
  > ➜ **Dịch**: ${a}
- **Bẫy đề thi cần tr\xe1nh**:
  - Ch\xfa \xfd dạng từ loại (danh từ, động từ hay t\xednh từ) để chọn đ\xfang đu\xf4i từ trong Part 5.
  - ${r?`C\xe1c cụm đi liền (collocations) bắt buộc nhớ: **${r}**.`:"H\xe3y ch\xfa \xfd giới từ thường đi k\xe8m ph\xeda sau."}`;case"toeic_example":return`### 📝 V\xed dụ TOEIC thực tế cho "${t}"

1. **V\xed dụ 1 (Part 5 - Incomplete Sentences)**:
   > _"The committee voted unanimously to **${t}** the new guidelines before the quarter ends."_
   > ➜ **Dịch**: Ủy ban đ\xe3 bỏ phiếu nhất tr\xed để \xe1p dụng/thực hiện c\xe1c hướng dẫn mới trước khi qu\xfd kết th\xfac.

2. **V\xed dụ 2 (Part 7 - Email doanh nghiệp)**:
   > _"Should you require further assistance regarding our **${t}** procedures, please do not hesitate to contact our help desk."_
   > ➜ **Dịch**: Nếu qu\xfd kh\xe1ch cần hỗ trợ th\xeam về quy tr\xecnh, vui l\xf2ng li\xean hệ b\xe0n trợ gi\xfap.`;case"synonym_diff":return`### ⚖️ Ph\xe2n biệt từ vựng dễ nhầm lẫn trong TOEIC

- **${t.toUpperCase()}** (${i}): D\xf9ng trang trọng trong hợp đồng, văn bản ch\xednh s\xe1ch, m\xf4i trường doanh nghiệp chuẩn quốc tế.
- **Từ gần nghĩa thường gặp**:
  - Nh\xf3m từ đồng nghĩa hay đ\xe1nh lừa th\xed sinh: ch\xfa \xfd xem từ đi với giới từ g\xec (*to, with, of, for*).
  - Kh\xe1c biệt về sắc th\xe1i: ${t} mang t\xednh ch\xednh thức (*formal*) hơn ng\xf4n ngữ giao tiếp đời thường (*informal*).
- **Mẹo nhớ nhanh**: Nhớ theo cụm: ${r?`**${r}**`:`lu\xf4n kết hợp với danh từ chỉ c\xf4ng việc`}.`;case"toeic_question":return`### 🎯 C\xe2u hỏi luyện tập TOEIC Part 5

The board of directors agreed that the revised proposal would ______ the current operational challenges.

- **A.** ${t} *(Đ\xe1p \xe1n ch\xednh x\xe1c)*
- **B.** significantly
- **C.** although
- **D.** despite

**Giải th\xedch**: Chỗ trống cần một động từ nguy\xean thể đứng sau trợ động từ khuyết thiếu *would*. Do đ\xf3 chọn **(A) ${t}** mang nghĩa "${i}".`;default:return`### 📘 Hướng dẫn học từ "${t}"

- **Nghĩa tiếng Việt**: ${i}
- **Loại từ**: ${n}
- **Cụm th\xf4ng dụng trong TOEIC**: ${r||"Xem th\xeam trong bộ đề ETS"}
- **Lời khuy\xean \xf4n tập**: H\xe3y bấm nghe ph\xe1t \xe2m (US/UK) nhiều lần v\xe0 luyện đặt c\xe2u với đồng nghiệp để ghi nhớ v\xe0o phản xạ tự nhi\xean!`}}(e),isBuiltIn:!0}}async function o(e){let t=process.env.AI_API_KEY;if(t)try{let n=`Bạn l\xe0 chuy\xean gia soạn thảo đề thi TOEIC. H\xe3y tạo 1 c\xe2u hỏi TOEIC Part 5 chuẩn format kiểm tra từ vựng "${e.word}" (${e.meaningVi}).
Y\xeau cầu bắt buộc: Trả về Đ\xdaNG ĐỊNH DẠNG JSON sau, kh\xf4ng k\xe8m bất kỳ giải th\xedch n\xe0o kh\xe1c ngo\xe0i JSON:
{
  "question": "C\xe2u tiếng Anh c\xf3 chỗ trống ______ (v\xed dụ: The director decided to ______ the conference...)",
  "options": ["Từ A", "Từ B", "Từ C", "Từ D"],
  "answer": 0,
  "explanation": "Giải th\xedch chi tiết bằng tiếng Việt tại sao chọn đ\xe1p \xe1n n\xe0y",
  "commonExpressions": "C\xe1c cụm đi liền th\xf4ng dụng"
}`,i=process.env.AI_API_URL||"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",o=`${i}?key=${t}`,a=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}]})});if(a.ok){let e=await a.json(),t=e?.candidates?.[0]?.content?.parts?.[0]?.text||"";t=t.replace(/```json/g,"").replace(/```/g,"").trim();let n=JSON.parse(t);if(n.question&&Array.isArray(n.options)&&4===n.options.length&&"number"==typeof n.answer&&n.explanation)return{question:String(n.question),options:[String(n.options[0]),String(n.options[1]),String(n.options[2]),String(n.options[3])],answer:Math.min(3,Math.max(0,n.answer)),explanation:String(n.explanation),commonExpressions:n.commonExpressions?String(n.commonExpressions):void 0}}}catch(e){console.warn("AI question generation failed, using built-in generator:",e)}let n=["postpone","purchase","recruit","manufacture","accommodate","revenue","budget"].filter(t=>t.toLowerCase()!==e.word.toLowerCase()),i=e.word,o=n[0]||"maintain",a=n[1]||"evaluate",r=n[2]||"implement",h=e.exampleSentence,c=RegExp(`\\b${e.word}\\w*\\b`,"i"),x=h.replace(c,"______");return x.includes("______")||(x="The manager decided to ______ the business strategy before next Friday."),{question:x,options:[i,o,a,r],answer:0,explanation:`Đ\xe1p \xe1n đ\xfang l\xe0 "${e.word}" (= ${e.meaningVi}). Trong ngữ cảnh c\xe2u, từ n\xe0y ho\xe0n to\xe0n ph\xf9 hợp về ngữ nghĩa v\xe0 ngữ ph\xe1p doanh nghiệp.`,commonExpressions:`${e.word} a project • ${e.word} efficiently`}}n.d(t,{o:()=>i,q:()=>o})}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),i=t.X(0,[276,972],()=>n(5153));module.exports=i})();