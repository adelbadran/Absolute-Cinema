
import React, { useState } from 'react';
import { Button } from './Button';
import { BookOpen, Users, Skull, Globe, MicOff, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Ban, Megaphone, Crown, Laugh, Drama, Ear, Calculator } from 'lucide-react';

interface ScreenTutorialProps {
  onBack: () => void;
}

export const ScreenTutorial: React.FC<ScreenTutorialProps> = ({ onBack }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "قصة اللعبة 🎬",
      icon: <Users size={48} className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-xl font-bold text-white">إنتوا مجموعة في نفس التيم، بس فيكم واحد "دخيل"!</p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700">
            <p className="text-zinc-300 leading-relaxed text-sm font-bold">
              اللعبة هتقسمكم فريقين (A و B) ومعاكم دخيل (C).
            </p>
            <div className="mt-4 text-xs text-zinc-400 space-y-2">
                <p>✅ فريق A و B معاهم كلمات "شبه بعض جداً" (مثلاً: شاورما سوري vs شاورما مصري).</p>
                <p>😈 الدخيل معاه كلمة تالتة خالص.</p>
                <p className="text-yellow-500 font-bold">🎯 هدفك: تعرف مين معاك في التيم ومين الدخيل.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "إزاي نلعب؟ 🗣️",
      icon: <Megaphone size={48} className="text-yellow-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-sm">فن التلميح!</p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 text-right space-y-3 text-xs">
             <p className="text-white leading-relaxed">
               <span className="text-yellow-400 font-bold">١.</span> كل واحد عليه الدور يقول كلمة واحدة أو جملة قصيرة تلمح لكلمته السرية.
             </p>
             <p className="text-white leading-relaxed">
               <span className="text-yellow-400 font-bold">٢.</span> <span className="text-red-400 font-bold">المعضلة:</span> لو كنت واضح أوي، الدخيل هيفهم الكلمة ويمثل عليكم. ولو كنت غامض أوي، صاحبك مش هيعرفك وممكن يشك فيك!
             </p>
          </div>
        </div>
      )
    },
    {
      title: "أدوار هدايا 🎁",
      icon: <Crown size={48} className="text-purple-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-sm">كل جولة ممكن يطلعلك دور خاص:</p>
          <div className="grid grid-cols-1 gap-2 text-right">
             <div className="bg-blue-900/20 p-2 rounded-lg border border-blue-500/30 flex items-center gap-3">
                <MicOff className="text-blue-400 shrink-0" size={20} />
                <div>
                    <p className="text-blue-200 font-bold text-xs">الصامت 🤐</p>
                    <p className="text-zinc-400 text-[10px]">ممنوع تتكلم! دورك هيتعمله Skip تلقائي.</p>
                </div>
             </div>
             
             <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-500/30 flex items-center gap-3">
                <Laugh className="text-purple-400 shrink-0" size={20} />
                <div>
                    <p className="text-purple-200 font-bold text-xs">المخادع 🤡</p>
                    <p className="text-zinc-400 text-[10px]">مهمتك تخلي الناس تشك فيك وتصوت ضدك عشان تاخد نقط زيادة!</p>
                </div>
             </div>

             <div className="bg-pink-900/20 p-2 rounded-lg border border-pink-500/30 flex items-center gap-3">
                <Drama className="text-pink-400 shrink-0" size={20} />
                <div>
                    <p className="text-pink-200 font-bold text-xs">الممثل 🎭</p>
                    <p className="text-zinc-400 text-[10px]">لازم تقول تلميحك بأداء تمثيلي (دراما، أكشن، حزن...).</p>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "التصويت 🗳️",
      icon: <Skull size={48} className="text-red-500" />,
      content: (
        <div className="space-y-4 text-center">
           <p className="text-zinc-300 text-sm">في الآخر هتصوت على حاجتين:</p>
           
           <div className="flex flex-col gap-3">
               <div className="bg-red-900/20 p-2 rounded-xl border border-red-500/30 text-right">
                    <p className="text-red-400 font-bold text-sm">١. مين الدخيل؟</p>
                    <p className="text-zinc-500 text-[10px]">اختار الشخص المختلف. (لو إنت الدخيل، ممكن تختار نفسك عشان تموه).</p>
               </div>

               <div className="bg-blue-900/20 p-2 rounded-xl border border-blue-500/30 text-right">
                   <p className="text-blue-400 font-bold text-sm">٢. مين صاحبك (نفس التيم)؟</p>
                   <p className="text-zinc-500 text-[10px]">اختار الشخص اللي كان بيقول تلميحات ماشية معاك.</p>
               </div>
           </div>
        </div>
      )
    },
    {
      title: "نظام النقط 🧮",
      icon: <Calculator size={48} className="text-green-500" />,
      content: (
        <div className="space-y-3 text-center">
           <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 text-right">
               <p className="text-green-400 font-bold text-sm mb-1 border-b border-zinc-700 pb-1">👤 للمواطن الصالح (فريق A/B)</p>
               <ul className="text-[10px] text-zinc-300 space-y-1">
                   <li><span className="text-green-400 font-bold">+2</span> لو قفشتوا الدخيل (الأغلبية صوتت صح).</li>
                   <li><span className="text-green-400 font-bold">+2</span> لو اخترت صاحبك صح.</li>
                   <li><span className="text-red-400 font-bold">-2</span> لو قولت "مليش صاحب" وأنت أصلاً ليك.</li>
               </ul>
           </div>

           <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 text-right">
               <p className="text-red-400 font-bold text-sm mb-1 border-b border-zinc-700 pb-1">🤫 للدخيل (فريق C)</p>
               <ul className="text-[10px] text-zinc-300 space-y-1">
                   <li><span className="text-red-500 font-bold">+5</span> لو محدش عرفك (Absolute Cinema!).</li>
                   <li><span className="text-red-500 font-bold">+3</span> لو اخترت "مليش صاحب" (عرفت إنك لوحدك).</li>
               </ul>
           </div>
           
           <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 text-right">
               <p className="text-purple-400 font-bold text-sm mb-1 border-b border-zinc-700 pb-1">🤡 للمخادع (بونص)</p>
               <ul className="text-[10px] text-zinc-300 space-y-1">
                   <li><span className="text-purple-400 font-bold">+2</span> لكل صوت ضدك (حتى لو طلعت برة).</li>
               </ul>
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
