"use client";

import React, { useState, useEffect } from 'react';

const scenario = [
    { text: "خـشـب يـحـكـي قـصـة", style: "style-bold", anim: "tunnelIn" },
    { text: "صـنـاعـة تـحـفـظ إرث", style: "style-neon", anim: "verticalSnap" },
    { text: "جـودة تـعـبـر عـنـك", style: "style-bold", anim: "sideSwing" },
    { text: "كـل غـرفـة لـقـصـة", style: "style-neon", anim: "tunnelIn" },
    { text: "كـل زاويـة لـذكـريـة", style: "style-bold", anim: "verticalSnap" },
    { text: "مـن أجـل بـيـتـك", style: "style-neon", anim: "sideSwing" }
];

interface LandingProps {
    hero?: any;
    contact?: any;
}

const LandingSection = ({ hero, contact }: LandingProps) => {
    const [stage, setStage] = useState<'intro' | 'final'>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (stage === 'intro') {
            const timer = setTimeout(() => {
                if (currentIndex < scenario.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setStage('final');
                }
            }, 1600);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, stage]);

    useEffect(() => {
        if (stage === 'final') {
            const handleMouseMove = (e: MouseEvent) => {
                const x = (window.innerWidth / 2 - e.pageX) / 50;
                const y = (window.innerHeight / 2 - e.pageY) / 50;
                setMousePos({ x, y });
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [stage]);

    const finalSentence = "فخامة تنسجم مع حياتك";

    return (
        <div 
            id="master-wrapper" 
            className="relative w-full overflow-hidden bg-[#050505] font-['Cairo'] flex flex-col"
            style={{ height: 'calc(100vh - 80px)' }} // طرح ارتفاع الناف بار لضمان ظهور كل شيء
            dir="rtl"
        >
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;900&display=swap');
                
                :root {
                    --primary-pink: #ff4d94;
                }

                .style-neon {
                    color: transparent;
                    -webkit-text-stroke: 1.5px var(--primary-pink);
                    filter: drop-shadow(0 0 15px var(--primary-pink));
                }

                .style-bold { color: #ffffff; }

                @keyframes tunnelIn {
                    0% { transform: scale(0.5) translateZ(-1000px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: scale(1.2) translateZ(0); opacity: 0; }
                }

                @keyframes verticalSnap {
                    0% { transform: translateY(-100px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(0); opacity: 0; }
                }

                @keyframes sideSwing {
                    0% { transform: translateX(100px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateX(0); opacity: 0; }
                }

                @keyframes kineticReveal {
                    to { opacity: 1; transform: translateY(0) rotate(0); }
                }

                @keyframes scrollMove {
                    0% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50% , 12px); }
                }

                @keyframes fadeIn { to { opacity: 1; } }
            `}</style>

            {stage === 'intro' && (
                <div className="flex-grow flex items-center justify-center relative [perspective:2000px]">
                    <div 
                        key={currentIndex}
                        className={`font-[900] text-center absolute ${scenario[currentIndex].style}`}
                        style={{
                            fontSize: 'clamp(2rem, 8vw, 6rem)',
                            animation: `${scenario[currentIndex].anim} 1.6s cubic-bezier(0.19, 1, 0.22, 1) forwards`
                        }}
                    >
                        {scenario[currentIndex].text}
                    </div>
                </div>
            )}

            {stage === 'final' && (
                <section className="flex-grow flex flex-col items-center justify-between relative py-12 px-4 animate-in fade-in duration-1000">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,116,233,0.08)_0%,transparent_70%)] pointer-events-none" />
                    
                    {/* Spacer to push content to center */}
                    <div className="h-0 md:h-20"></div>

                    {/* Content Central */}
                    <div className="relative z-10 text-center">
                        <div 
                            className="flex flex-wrap justify-center gap-4 md:gap-8 transition-transform duration-75 ease-out"
                            style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
                        >
                            {finalSentence.split(" ").map((word, idx) => (
                                <span 
                                    key={idx}
                                    className="inline-block text-[12vw] md:text-[7vw] font-[900] text-white opacity-0"
                                    style={{
                                        transform: 'translateY(80px) rotate(10deg)',
                                        animation: `kineticReveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
                                        animationDelay: `${idx * 0.15}s`,
                                        ...(idx === 1 ? {
                                            color: 'transparent',
                                            WebkitTextStroke: '1.5px var(--primary-pink)',
                                            filter: 'drop-shadow(0 0 8px var(--primary-pink))'
                                        } : {})
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                        </div>

                        <p className="text-gray-500 text-base md:text-xl mt-8 opacity-0 animate-[fadeIn_1s_ease_1.5s_forwards] font-medium max-w-xl mx-auto leading-relaxed">
                            مجموعتنا تعيد تعريف مفهوم المساحات الشخصية.
                        </p>
                    </div>

                    {/* Bottom Indicator - Fixed within the container */}
                    <div className="relative z-10 flex flex-col items-center gap-4 opacity-0 animate-[fadeIn_1s_ease_2s_forwards]">
                        <div className="w-[22px] h-[36px] border-2 border-gray-700 rounded-full relative">
                            {/* الخط الوردي المعدل ليكون في المنتصف تماماً */}
                              <div className="absolute top-2 left-[9.0px] w-1 h-2 bg-[#ff4d94] rounded-full animate-[scrollMove_2s_infinite]"></div>
                        </div>
                        <span className="text-gray-600 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase">اكتشف الفخامة</span>
                    </div>
                </section>
            )}
        </div>
    );
};

export default LandingSection;