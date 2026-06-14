"use client";

import React from 'react';

interface LocationProps {
  data: {
    link: string;
    description: string;
    time: string;
    address: string;
  } | null;
}

const LocationSection = ({ data }: LocationProps) => {
  const locationLink = data?.link || null; 
  const description = data?.description || "حيث تتحول قطع الخشب الصماء إلى قصص تروى في زوايا منزلك.";
  const workTime = data?.time || "9:00 ص - 10:00 م";
  const address = data?.address || "حي الروضة، برج الود التجاري";

  const getGoogleMapsSearchUrl = () => {
    if (!address) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <section 
      id="location"   // إضافة معرف للربط
      className="premium-location scroll-mt-20"   // إضافة مسافة عند التمرير
      dir="rtl"
    >
      <style jsx>{`
        .premium-location {
          background: #050505;
          padding: 40px 5%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px); 
          width: 100%;
        }

        .glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.1;
          z-index: 1;
        }
        .glow-orb.blue { top: -200px; left: -100px; background: #1c74e9; }
        .glow-orb.pink { bottom: -200px; right: -100px; background: #ff4d94; }

        .container-location {
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          position: relative;
          z-index: 10;
          width: 100%;
          align-items: center;
        }

        .info-content { color: white; text-align: right; }

        .location-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 25px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #ff4d94;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff4d94;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

        .gradient-text {
          background: linear-gradient(90deg, #1c74e9, #ff4d94);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }

        .section-title { font-size: clamp(2.5rem, 5vw, 3.8rem); margin: 0 0 30px 0; line-height: 1.1; font-weight: 900; }
        .description-text { color: #aaa; font-size: 1.1rem; line-height: 1.8; margin-bottom: 40px; max-width: 90%; }

        .feature-cards { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }

        .f-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border-right: 4px solid transparent;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .f-card.blue-glow { border-right-color: #1c74e9; }
        .f-card.pink-glow { border-right-color: #ff4d94; }
        .f-card:hover { transform: translateX(-10px); background: rgba(255, 255, 255, 0.08); }

        .nav-button {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-bottom: 2px solid #ff4d94;
          padding-bottom: 5px;
          transition: 0.3s;
        }
        .nav-button:hover { gap: 25px; color: #ff4d94; }

        .map-shrine {
          position: relative;
          height: 600px;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          background: #111;
        }

        .map-shrine iframe { width: 100%; height: 100%; border: 0; filter: contrast(1.1); }

        .corner-decoration {
          position: absolute;
          width: 120px;
          height: 120px;
          z-index: 5;
          pointer-events: none;
        }
        .top-left { top: 0; left: 0; border-top: 6px solid #1c74e9; border-left: 6px solid #1c74e9; border-radius: 40px 0 0 0; }
        .bottom-right { bottom: 0; right: 0; border-bottom: 6px solid #ff4d94; border-right: 6px solid #ff4d94; border-radius: 0 0 40px 0; }

        @media (max-width: 992px) {
          .premium-location { min-height: 100vh; padding: 100px 5%; }
          .container-location { grid-template-columns: 1fr; gap: 60px; text-align: center; }
          .info-content { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .f-card { justify-content: flex-start; border-right: none; border-bottom: 4px solid; width: 100%; text-align: right; }
          .map-shrine { height: 450px; }
        }
      `}</style>

      <div className="glow-orb blue"></div>
      <div className="glow-orb pink"></div>

      <div className="container-location">
        <div className="info-content">
          <div className="location-badge">
            <span className="pulse-dot"></span>
            موقعنا المعتمد
          </div>
          <h2 className="section-title">زوروا عالم <span className="gradient-text">بيت الود</span></h2>
          <p className="description-text">{description}</p>
          
          <div className="feature-cards">
            <div className="f-card blue-glow">
              <div className="text-3xl">📍</div>
              <div className="text-right">
                <h4 className="font-extrabold text-white text-xl">العنوان الرئيسي</h4>
                <p className="text-gray-400 mt-1">{address}</p>
              </div>
            </div>
            
            <div className="f-card pink-glow">
              <div className="text-3xl">🕒</div>
              <div className="text-right">
                <h4 className="font-extrabold text-white text-xl">ساعات العمل</h4>
                <p className="text-gray-400 mt-1">{workTime}</p>
              </div>
            </div>
          </div>
          
          <a 
            href={getGoogleMapsSearchUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-button"
          >
            <span>عرض الخريطة بشكل أكبر</span>
            <span className="text-xl">←</span>
          </a>
        </div>

        <div className="map-interactive-side">
          <div className="map-shrine">
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration bottom-right"></div>
            
            {locationLink ? (
              <iframe 
                src={locationLink}
                title="Google Maps"
                loading="lazy"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-700">بانتظار الرابط...</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;