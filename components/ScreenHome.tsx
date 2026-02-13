
import React, { useState, useEffect } from 'react';
import { Film, Users, HelpCircle, ArrowRight, Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { AVATARS } from '../constants';

interface ScreenHomeProps {
  onHost: (name: string, avatar: string) => Promise<void>;
  onJoin: (name: string, code: string, avatar: string) => Promise<void>;
  onTutorial: () => void;
}

export const ScreenHome: React.FC<ScreenHomeProps> = ({ onHost, onJoin, onTutorial }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [mode, setMode] = useState<'splash' | 'menu' | 'join'>('splash');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill room code from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
        setRoomCode(code);
        setMode('join');
    }
  }, []);

  // Fake Splash Screen
  useEffect(() => {
    if (mode === 'splash') {
        const timer = setTimeout(() => {
            // Check again if we moved to join via URL param logic
            setMode(prev => prev === 'join' ? 'join' : 'menu');
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [mode]);

  const changeAvatar = (dir: 1 | -1) => {
      setAvatarIndex(prev => {
          const next = prev + dir;
          if (next >= AVATARS.length) return 0;
          if (next < 0) return AVATARS.length - 1;
          return next;
      });
  };

  const handleHostClick = async () => {
      setIsLoading(true);
      await onHost(name, AVATARS[avatarIndex]);
      setIsLoading(false);
  };

  const handleJoinClick = async () => {
      setIsLoading(true);
      await onJoin(name, roomCode, AVATARS[avatarIndex]);
      setIsLoading(false);
  };

  if (mode === 'splash') {
      return (
          <div className="flex flex-col h-full items-center justify-center bg-black z-50 animate-fade-in">
              <div className="animate-pop text-center">
                  <Film size={80} className="text-red-600 mx-auto mb-4 animate-bounce" />
                  <h1 className="text-4xl font-black text-white tracking-widest uppercase">Absolute</h1>
                  <h1 className="text-4xl font-black text-red-600 tracking-widest uppercase">Cinema</h1>
              </div>
          </div>
      );
  }

  // Helper for Avatar UI
  const AvatarSelector = () => (
      <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center justify-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <button onClick={() => changeAvatar(-1)} className="p-2 text-zinc-500 hover:text-white transition-colors active:scale-90"><ChevronRight /></button>
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="text-6xl animate-pop select-none drop-shadow-lg">{AVATARS[avatarIndex]}</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-red-600 rounded-full opacity-50 blur-sm"></div>
            </div>
            <button onClick={() => changeAvatar(1)} className="p-2 text-zinc-500 hover:text-white transition-colors active:scale-90"><ChevronLeft /></button>
          </div>
          <p className="text-xs text-zinc-500">الأفاتار الخاص بك</p>
      </div>
  );

  if (mode === 'join') {
    return (
      <div className="h-full w-full overflow-y-auto">
          <div className="flex flex-col min-h-full items-center justify-center p-6 space-y-6 animate-enter max-w-md mx-auto">
            <div className="w-full flex justify-start">
                <button onClick={() => setMode('menu')} className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition text-white border border-zinc-700">
                    <ArrowRight size={24} />
                </button>
            </div>
            
            <div className="text-center w-full">
                <h2 className="text-3xl font-black text-white mb-2">تذاكر الدخول 🎟️</h2>
                <p className="text-zinc-500 text-sm">اختار شخصيتك وبياناتك</p>
            </div>
            
            <div className="w-full space-y-4">
                <AvatarSelector />
                
                <div className="glass-panel p-1 rounded-2xl">
                    <input
                    type="text"
                    placeholder="اسمك إيه يا نجم؟"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-white text-center text-xl p-4 outline-none placeholder-zinc-600 font-bold"
                    maxLength={10}
                    disabled={isLoading}
                    />
                </div>

                <div className="glass-panel p-1 rounded-2xl">
                    <input
                    type="number"
                    placeholder="كود الروم (4 أرقام)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full bg-transparent text-white text-center text-xl p-4 outline-none placeholder-zinc-600 font-bold tracking-widest"
                    maxLength={4}
                    disabled={isLoading}
                    />
                </div>
            </div>

            <div className="w-full pt-4 pb-8">
            <Button 
                fullWidth 
                variant="gold"
                onClick={handleJoinClick}
                disabled={!name.trim() || roomCode.length !== 4 || isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : "ادخل الروم"}
            </Button>
            </div>
            
            <div className="mt-auto w-full text-center pb-4 opacity-50">
               <p className="text-[10px] text-yellow-600/50 font-bold tracking-widest uppercase">جروب الفرح للإنتاج السينمائي - 2026</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
        <div className="flex flex-col min-h-full items-center justify-between p-6 py-12 animate-enter max-w-md mx-auto">
        
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 mb-8">
            <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <Film size={100} className="text-red-600 relative z-10 drop-shadow-2xl rotate-[-10deg]" />
            </div>
            
            <div>
                <h1 className="text-6xl font-black text-white leading-[0.9] text-glow tracking-tighter">
                ABSOLUTE<br/><span className="text-red-600">CINEMA</span>
                </h1>
                <div className="h-1 w-20 bg-red-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <p className="text-zinc-500 font-medium tracking-wide">كلامك هينجيك.. أو هيفضحك! 🎭</p>
        </div>

        <div className="w-full space-y-4 relative z-10 pb-4">
            <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-2xl">
                <AvatarSelector />
                
                <div className="border-b border-zinc-800 pb-4 mb-2">
                    <input
                        type="text"
                        placeholder="اسمك إيه يا مدير؟"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl text-white text-center text-lg p-3 outline-none focus:border-red-600 transition-colors placeholder-zinc-600 font-bold"
                        maxLength={10}
                        disabled={isLoading}
                    />
                </div>
            
                <Button 
                fullWidth 
                onClick={handleHostClick}
                disabled={!name.trim() || isLoading}
                className="text-lg"
                >
                {isLoading ? <Loader2 className="animate-spin" /> : <><Play fill="currentColor" size={20} /> إنشاء روم جديدة</>}
                </Button>
                
                <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setMode('join')}
                className="text-lg"
                disabled={isLoading}
                >
                <Users size={20} />
                دخول روم موجودة
                </Button>
            </div>

            <button 
            onClick={onTutorial}
            className="w-full text-zinc-600 text-sm flex items-center justify-center gap-2 hover:text-zinc-400 transition-colors py-2"
            >
            <HelpCircle size={16} />
            كيف تلعب؟
            </button>
        </div>
        
        <div className="mt-4 opacity-70">
           <p className="text-[10px] text-yellow-600 font-bold tracking-widest uppercase">جروب الفرح للإنتاج السينمائي - 2026</p>
        </div>
        </div>
    </div>
  );
};
