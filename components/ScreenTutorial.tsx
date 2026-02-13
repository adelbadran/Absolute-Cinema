
import React, { useState } from 'react';
import { Button } from './Button';
import { BookOpen, Users, Skull, Globe, MicOff, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Ban, Megaphone, Crown, Laugh, Drama } from 'lucide-react';

interface ScreenTutorialProps {
  onBack: () => void;
}

export const ScreenTutorial: React.FC<ScreenTutorialProps> = ({ onBack }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "أونلاين ومن أي مكان 🌐",
      icon: <Globe size={48} className="text-blue-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-xl font-bold text-white">العب مع صحابك حتى لو مش جنب بعض!</p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700">
            <p className="text-zinc-300 leading-relaxed text-sm">
              واحد يعمل <span className="text-yellow-400 font-bold">Host</span> ويبعت كود الروم للباقي.
              <br/>
              مش محتاجين تكونوا على نفس الواي فاي، اللعبة شغالة بالنت العادي من أي مكان في العالم.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "نظام التوأم 👯",
      icon: <Users size={48} className="text-green-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-sm">كل تيم مكون من <span className="text-green-400 font-bold">شخصين بس!</span></p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 text-right space-y-2 text-xs">
             <p className="text-white">🔹 إنت ومعاك واحد بس عنده نفس الكلمة.</p>
             <p className="text-white">🔹 مهمتك تلاقي "التوأم" بتاعك ده وسط الزحمة.</p>
             <p className="text-red-400 font-bold mt-2">🔸 إلا لو كنت الدخيل: أنت بطولك!</p>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">* في الأعداد الكبيرة ممكن التيم يزيد عن 2، بس الأساس إنك تلاقي صاحبك.</p>
        </div>
      )
    },
    {
      title: "إزاي نلعب؟ 🗣️",
      icon: <Megaphone size={48} className="text-yellow-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-sm">الذكاء في التلميح!</p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 text-right space-y-3 text-xs">
             <p className="text-white leading-relaxed">
               <span className="text-yellow-400 font-bold">١.</span> كل واحد عليه الدور يقول كلمة واحدة أو جملة قصيرة تلمح لكلمته السرية.
             </p>
             <p className="text-white leading-relaxed">
               <span className="text-yellow-400 font-bold">٢.</span> <span className="text-red-400 font-bold">المعضلة:</span> لو كنت واضح أوي، الدخيل هيفهم الكلمة ويمثل عليكم. ولو كنت غامض أوي، صاحبك مش هيعرفك وممكن يشك فيك!
             </p>
             <p className="text-zinc-400 italic text-center mt-2">"خير الكلام ما قل ودل"</p>
          </div>
        </div>
      )
    },
    {
      title: "شخصيات خاصة 🎭",
      icon: <Crown size={48} className="text-purple-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-zinc-300 text-sm">ممكن يطلعلك دور يغير اللعبة:</p>
          <div className="grid grid-cols-1 gap-2 text-right">
             <div className="bg-blue-900/20 p-2 rounded-lg border border-blue-500/30 flex items-center gap-3">
                <MicOff className="text-blue-400 shrink-0" size={20} />
                <div>
                    <p className="text-blue-200 font-bold text-xs">الصامت 🤐</p>
                    <p className="text-zinc-400 text-[10px]">دوره بيتعمله Skip، مش بيتكلم ولا بيلمح خالص!</p>
                </div>
             </div>
             
             <div className="bg-purple-900/20 p-2 rounded-lg border border-purple-500/30 flex items-center gap-3">
                <Laugh className="text-purple-400 shrink-0" size={20} />
                <div>
                    <p className="text-purple-200 font-bold text-xs">المخادع 🤡</p>
                    <p className="text-zinc-400 text-[10px]">عايز الناس تشك فيه وتطلعه برة عشان يكسب.</p>
                </div>
             </div>

             <div className="bg-pink-900/20 p-2 rounded-lg border border-pink-500/30 flex items-center gap-3">
                <Drama className="text-pink-400 shrink-0" size={20} />
                <div>
                    <p className="text-pink-200 font-bold text-xs">الممثل 🎭</p>
                    <p className="text-zinc-400 text-[10px]">لازم يقول تلميحه بأداء تمثيلي (حزين، سعيد، غضبان...).</p>
                </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "مهمة التصويت 🗳️",
      icon: <Skull size={48} className="text-red-500" />,
      content: (
        <div className="space-y-4 text-center">
           <p className="text-zinc-300 text-sm">في الآخر هتصوت مرتين:</p>
           
           <div className="flex flex-col gap-3">
               <div className="bg-red-900/20 p-2 rounded-xl border border-red-500/30 text-right">
                    <p className="text-red-400 font-bold text-sm">١. مين الدخيل؟</p>
                    <p className="text-zinc-500 text-[10px]">مسموح لك تختار نفسك لو شكيت إنك الدخيل.</p>
               </div>

               <div className="bg-blue-900/20 p-2 rounded-xl border border-blue-500/30 text-right">
                   <p className="text-blue-400 font-bold text-sm">٢. مين صاحبك؟</p>
                   <p className="text-zinc-500 text-[10px]">اختار الشخص اللي معاه نفس كلمتك.</p>
               </div>
           </div>
        </div>
      )
    },
    {
      title: "زرار \"مليش صاحب\" 🚫",
      icon: <Ban size={48} className="text-purple-500" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="bg-purple-900/20 p-4 rounded-2xl border border-purple-900/50">
            <p className="text-white font-bold mb-2">لو شكيت إنك الدخيل:</p>
            <ul className="space-y-2 text-zinc-300 text-right list-disc list-inside text-xs">
                <li>في اختيار الصاحب، دوس <span className="text-purple-400 font-bold">أنا الدخيل / مليش صاحب</span>.</li>
                <li>لو طلعت فعلاً الدخيل وعملت كدة، هتاخد <span className="text-green-400">+3 نقط</span> (ذكاء).</li>
                <li>بس حاسب! لو طلعت بريء وعملت كدة، هتخسر <span className="text-red-400">-2 نقط</span> (غباء).</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-black">
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
