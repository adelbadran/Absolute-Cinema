
import React, { useState } from 'react';
import { Player, GameConfig } from '../types';
import { Button } from './Button';
import { Copy, Users, LogOut, Settings, Timer, Hash } from 'lucide-react';

interface ScreenLobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  config: GameConfig;
  onUpdateSettings: (config: GameConfig) => void;
  onStart: () => void;
  onBack: () => void;
}

export const ScreenLobby: React.FC<ScreenLobbyProps> = ({ roomCode, players, isHost, config, onUpdateSettings, onStart, onBack }) => {
  const canStart = players.length >= 5 && players.length % 2 !== 0; 
  const devCanStart = players.length >= 3 && players.length % 2 !== 0;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in max-w-md mx-auto">
      
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-300">الاستقبال</h2>
          <button onClick={onBack} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm font-bold bg-zinc-900 px-3 py-2 rounded-lg transition-colors border border-zinc-800">
              <LogOut size={16} />
              خروج
          </button>
      </div>

      <div className="bg-gradient-to-r from-zinc-900 to-black rounded-2xl p-6 text-center mb-6 border border-zinc-800 shadow-xl relative overflow-hidden group" onClick={() => navigator.clipboard.writeText(roomCode)}>
        <div className="absolute top-0 right-0 p-2 opacity-5">
            <Copy size={80} />
        </div>
        <p className="text-zinc-500 text-sm mb-2">كود الروم</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-black tracking-widest text-red-600 drop-shadow-md">{roomCode}</span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">اضغط عشان تنسخ الكود</p>
      </div>

      {isHost && (
          <div className="mb-6 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex justify-between items-center p-4 text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              >
                  <span className="flex items-center gap-2 font-bold"><Settings size={18} /> إعدادات الروم</span>
                  <span className="text-xs bg-black px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                      {config.maxRounds} جولات | {config.roundDurationBase}ث
                  </span>
              </button>
              
              {showSettings && (
                  <div className="p-4 pt-0 border-t border-zinc-800 animate-enter">
                      <div className="space-y-4 mt-4">
                          {/* Rounds Setting */}
                          <div>
                              <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                  <Hash size={16} /> عدد الجولات
                              </label>
                              <div className="flex gap-2">
                                  {[1, 3, 5].map(num => (
                                      <button 
                                        key={num}
                                        onClick={() => onUpdateSettings({ ...config, maxRounds: num })}
                                        className={`flex-1 py-2 rounded-lg font-bold border transition-all ${config.maxRounds === num ? 'bg-red-600 border-red-500 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-500'}`}
                                      >
                                          {num}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {/* Time Setting */}
                          <div>
                              <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                  <Timer size={16} /> زمن التفكير (أول جولة)
                              </label>
                              <div className="flex gap-2">
                                  {[15, 20, 30, 45].map(sec => (
                                      <button 
                                        key={sec}
                                        onClick={() => onUpdateSettings({ ...config, roundDurationBase: sec })}
                                        className={`flex-1 py-2 rounded-lg font-bold border transition-all ${config.roundDurationBase === sec ? 'bg-yellow-600 border-yellow-500 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-500'}`}
                                      >
                                          {sec}ث
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      <div className="flex-1 overflow-y-auto mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Users size={20} className="text-yellow-500" />
            الموجودين ({players.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {players.map((p) => (
            <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 p-3 px-4 rounded-xl flex items-center gap-4 animate-fade-in hover:bg-zinc-900 transition-colors">
              <span className="text-3xl bg-black rounded-full w-12 h-12 flex items-center justify-center shadow-inner relative border border-zinc-800">
                  {p.avatar}
                  {p.score > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-black font-bold text-white">
                          {p.score}
                      </div>
                  )}
              </span>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate text-lg text-white">{p.name}</p>
                {p.isHost ? (
                    <span className="inline-block bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-500/20">المدير 👑</span>
                ) : (
                    <span className="text-xs text-zinc-500">ممثل جديد</span>
                )}
              </div>
              <div className="text-zinc-400 font-bold text-sm">
                  {p.score} نقطة
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-800">
        {!isHost && (
          <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700">
            <p className="animate-pulse text-zinc-300 font-medium">مستنيين المخرج يبدأ... 🎬</p>
            <div className="mt-2 text-xs text-zinc-500 flex justify-center gap-4">
                 <span>{config.maxRounds} جولات</span>
                 <span>{config.roundDurationBase} ثانية</span>
            </div>
          </div>
        )}
        
        {isHost && (
          <>
            <div className={`p-3 rounded-lg text-center text-xs mb-2 transition-colors ${devCanStart ? 'text-green-400 bg-green-900/10 border border-green-900' : 'text-red-400 bg-red-900/10 border border-red-900'}`}>
              {devCanStart ? "العدد تمام، جاهزين!" : "العدد لازم يكون فردي (3، 5، 7...)"}
            </div>
            <Button 
              fullWidth 
              onClick={onStart}
              disabled={!devCanStart}
              className="py-4 text-xl"
            >
              {devCanStart ? "يلا بينا! 🎬" : "لسه بدري..."}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
