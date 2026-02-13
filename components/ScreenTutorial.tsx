
import React, { useState } from 'react';
import { Button } from './Button';
import { Users, Skull, MicOff, ArrowLeft, ArrowRight, Megaphone, Crown, Laugh, Drama, Calculator, Clock, Gift, Eye } from 'lucide-react';

interface ScreenTutorialProps {
  onBack: () => void;
}

export const ScreenTutorial: React.FC<ScreenTutorialProps> = ({ onBack }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "الحكاية إيه؟ 🤔",
      icon: <Users size={64} className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold text-white">إحنا فريقين ومواطن دخيل!</p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 text-right space-y-3">
             <div className="flex items-start gap-2">
                <span className="text-2xl">👥</span>
                <p className="text-zinc-300 text-xs leading-relaxed font-bold">
                    <span className="text-green-400 text-sm">فريق (A) وفريق (B):</span> دول المواطنين الصالحين. كل فريق معاه كلمة سرية "شبه" كلمة الفريق التاني جداً (مثلاً: "شاورما سوري" vs "شاورما مصري").
                </p>
             </div>
             <div className="flex items-start gap-2">
                <span className="text-2xl">🕵️</span>
                <p className="text-zinc-300 text-xs leading-relaxed font-bold">
                    <span className="text-red-500 text-sm">الدخيل (C):</span> ده لاعب واحد بس معاه كلمة تالتة مختلفة خالص، ومهمته يعمل نفسه فاهم هو في أنهي تيم ومايتكشفش!
                </p>
             </div>
             <p className="text-yellow-500 text-center text-xs mt-2 border-t border-zinc-700 pt-2 font-bold">
                 ⚠️ محدش عارف مين معاه في التيم ومين ضده!
             </p>
          </div>
        </div>
      )
    },
    {
      title: "نلعب إزاي؟ 🎤",
      icon: <Megaphone size={64} className="text-yellow-400" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 text-right space-y-3">
             <div className="flex items-center gap-3 mb-2">
                <Clock className="text-zinc-400" size={20} />
                <p className="text-white text-sm font-bold">الدور بالترتيب</p>
             </div>
             <p className="text-zinc-400 text-xs leading-relaxed font-bold">
                 كل لاعب هيجيله الدور يقول <span className="text-white">كلمة واحدة</span> أو جملة قصيرة تلمح لكلمته السرية.
             </p>
             
             <div className="bg-black/40 p-3 rounded-lg border border-red-500/20 mt-2">
                 <p className="text-red-400 font-bold text-xs mb-1">🔥 التحدي (المعضلة):</p>
                 <ul className="list-disc list-inside text-zinc-300 text-[10px] space-y-1">
                     <li>لو تلميحك "واضح أوي"، الدخيل هيفهم كلمتكم بسهولة وهيمثل عليكم.</li>
                     <li>ولو تلميحك "غامض أوي"، صاحبك (اللي في التيم التاني) مش هيعرفك وممكن يفتكرك الدخيل ويصوت ضدك!</li>
                 </ul>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "أدوار الحظ 🎁",
      icon: <Gift size={64} className="text-purple-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-xs font-bold">في بداية كل جولة، ممكن اللعبة توزع "أدوار هدية" عشوائية:</p>
          <div className="grid grid-cols-1 gap-2 text-right">
             <div className="bg-blue-900/20 p-2 rounded-lg border border-blue-500/30 flex items-center gap-3">
                <MicOff className="text-blue-400 shrink-0" size={20} />
                <div>
                    <p className="text-blue-200 font-bold text-xs">الصامت 🤐</p>
                    <p className="text-zinc-400 text-[10px]">ممنوع تتكلم أو تلمح الجولة دي! (دورك بيعدي، ومحدش يقدر يلومك).</p>
                </div>
             </div>
             
             <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-500/30 flex items-center gap-3">
                <Laugh className="text-purple-400 shrink-0" size={20} />
                <div>
                    <p className="text-purple-200 font-bold text-xs">المخادع (الجوكر) 🤡</p>
                    <p className="text-zinc-400 text-[10px]">هدفك تخلي الناس "تشك" فيك! لو الناس صوتت إنك الدخيل، هتاخد نقط زيادة.</p>
                </div>
             </div>

             <div className="bg-pink-900/20 p-2 rounded-lg border border-pink-500/30 flex items-center gap-3">
                <Drama className="text-pink-400 shrink-0" size={20} />
                <div>
                    <p className="text-pink-200 font-bold text-xs">الممثل 🎭</p>
                    <p className="text-zinc-400 text-[10px]">لازم تقول تلميحك بأداء تمثيلي مبالغ فيه (دراما، أكشن، حزن..).</p>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "وقت الحساب 🗳️",
      icon: <Skull size={64} className="text-red-500" />,
      content: (
        <div className="space-y-4 text-center">
           <p className="text-zinc-300 text-xs font-bold">بعد ما الجولات تخلص، كل واحد لازم يجاوب سؤالين:</p>
           
           <div className="flex flex-col gap-3">
               <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/30 text-right relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <p className="text-red-400 font-black text-sm mb-1">١. مين الدخيل؟</p>
                    <p className="text-zinc-400 text-[10px] leading-snug">
                        اختار الشخص اللي حسيته مش فاهم، أو كلامه غريب.<br/>
                        <span className="text-zinc-500">* لو إنت الدخيل، صوت على أي حد عشان تتوههم (أو على نفسك كتمويه).</span>
                    </p>
               </div>

               <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/30 text-right relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                   <p className="text-blue-400 font-black text-sm mb-1">٢. مين صاحبك؟</p>
                   <p className="text-zinc-400 text-[10px] leading-snug">
                       لازم تختار واحد "واثق" إنه معاك في نفس التيم (A أو B).<br/>
                       <span className="text-white font-bold">* لو شاكك إنك "الدخيل"، اختار (أنا الدخيل / مليش صاحب).</span>
                   </p>
               </div>
           </div>
        </div>
      )
    },
    {
      title: "توزيع النقط 🧮",
      icon: <Calculator size={64} className="text-green-500" />,
      content: (
        <div className="space-y-2 text-center w-full">
           {/* Innocents */}
           <div className="bg-zinc-800/60 p-2 rounded-lg border-r-4 border-green-500 text-right">
               <p className="text-green-400 font-bold text-xs mb-1">👤 للمواطن الصالح (فريق A و B)</p>
               <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-300 font-bold">
                   <div>✅ قفشتوا الدخيل: <span className="text-green-400 text-sm">+2</span></div>
                   <div>🤝 عرفت صاحبك: <span className="text-green-400 text-sm">+2</span></div>
                   <div className="col-span-2 text-red-400">❌ قولت "مليش صاحب" وأنت مواطن: <span className="text-sm">-2</span> (خصم)</div>
               </div>
           </div>

           {/* Outsider */}
           <div className="bg-zinc-800/60 p-2 rounded-lg border-r-4 border-red-500 text-right">
               <p className="text-red-400 font-bold text-xs mb-1">🤫 للدخيل (فريق C)</p>
               <div className="grid grid-cols-1 gap-1 text-[10px] text-zinc-300 font-bold">
                   <div>🏃 محدش عرفك (Absolute Cinema): <span className="text-red-400 text-lg">+5</span></div>
                   <div>🧠 عرفت إنك لوحدك (اخترت مليش صاحب): <span className="text-red-400 text-sm">+3</span></div>
               </div>
           </div>
           
           {/* Joker */}
           <div className="bg-zinc-800/60 p-2 rounded-lg border-r-4 border-purple-500 text-right">
               <p className="text-purple-400 font-bold text-xs mb-1">🤡 للمخادع (الجوكر)</p>
               <p className="text-[10px] text-zinc-300 font-bold">
                   أي صوت يجيلك (إنك دخيل) هتاخد عليه <span className="text-purple-400 text-sm">+2</span> بونص.
               </p>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full w-full overflow-y-auto flex flex-col bg-black">
        {/* Header */}
        <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i === step ? 'bg-red-600 w-12' : 'bg-zinc-800'}`} />
                    ))}
                </div>
                <button onClick={onBack} className="text-zinc-500 hover:text-white font-bold text-sm">تخطي</button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center p-6 animate-fade-in key={step}"> 
            <div className="mb-6 animate-pop">
                {steps[step].icon}
            </div>
            <h2 className="text-3xl font-black text-white mb-8">{steps[step].title}</h2>
            <div className="w-full max-w-md">
                {steps[step].content}
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pt-0 mt-auto">
            <div className="flex gap-4">
                {step > 0 && (
                    <Button variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1">
                        <ArrowRight size={20} /> السابق
                    </Button>
                )}
                
                {step < steps.length - 1 ? (
                    <Button onClick={() => setStep(s => s + 1)} className="flex-[2]">
                        التالي <ArrowLeft size={20} />
                    </Button>
                ) : (
                    <Button variant="gold" onClick={onBack} className="flex-[2] animate-pop">
                        فهمت، يلا نلعب! 🎬
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
};
