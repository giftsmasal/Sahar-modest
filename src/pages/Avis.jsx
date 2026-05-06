import React from "react";
import { Star, Heart, Sparkles, MessageCircle } from "lucide-react";

export default function Avis() {
    const avis = [
        {
            text: "جربت بركيني، جاني مستور كيف ما كنت بغيا، وحتى تقاشر عجباتني الفكرة",
        },
        {
            text: "Raha wslatni la commande zwina bzaaaf 3jbatni wnchae lah ranwli nakhd mn 3ndk merci beaucoup ❤️❤️",
        },
        {
            text: "شكرااا لك بزاف والله ما شاء الله حمقني 💖💖💖",
        },
        {
            text: "Chokran ja zwin lah ysahalik. Inchalah lmarra jaya n comondi wa7d akhor",
        },
        {
            text: "Bien reçu. Merci beaucoup. Zwin bezaf surtout la finition.",
        },
    ];

    return (
        <div className="avis-page">
            <div className="floating-shapes">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="marquee">
                <div className="marquee-track">
                    {Array(8).fill(null).map((_, i) => (
                        <React.Fragment key={i}>
                            <span>✨AVIS CLIENT✨</span>
                            <span>SAHAR BRAND</span>
                        </React.Fragment>
                    ))}
                </div>

            </div>

            <section className="avis-hero">
                <div className="badge">
                    <Sparkles size={18} />
                    Avis réels de nos clientes
                </div>

                <h1>
                    Elles ont commandés, <br />
                    elles ont adorés <span>SAHAR</span>
                </h1>

                <p>
                    Merci pour vos messages, votre confiance et votre amour. Chaque avis
                    nous motive à donner encore plus.
                </p>
            </section>

            <section className="avis-grid">
                {avis.map((item, index) => (
                    <div className={`avis-card card-${index + 1}`} key={index}>
                        <div className="card-top">
                            <div className="avatar">
                                <MessageCircle size={22} />
                            </div>
                            <div>
                                <h3>Client</h3>
                                <div className="stars">
                                    <Star size={15} fill="currentColor" />
                                    <Star size={15} fill="currentColor" />
                                    <Star size={15} fill="currentColor" />
                                    <Star size={15} fill="currentColor" />
                                    <Star size={15} fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        <p>{item.text}</p>

                        <div className="heart-row">
                            <Heart size={18} fill="currentColor" />
                            <span>Commande vérifiée</span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="bottom-marquee">
                <div className="marquee-track">
                    {Array(3).fill(null).map((_, i) => (
                        <React.Fragment key={i}>
                            <span>SAHAR BRAND ✦ AVIS CLIENT ✦ SATISFACTION ✦ QUALITÉ ✦</span>
                            <span>SAHAR BRAND ✦ AVIS CLIENT ✦ SATISFACTION ✦ QUALITÉ ✦</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>


            <style>{`
  .avis-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 10% 15%, rgba(197,169,146,0.38), transparent 28%),
      radial-gradient(circle at 90% 70%, rgba(139,111,90,0.32), transparent 30%),
      linear-gradient(135deg, #fffaf6, #f4e9df);
    padding: 0 18px 70px;
    overflow: hidden;
    position: relative;
    font-family: sans-serif;
  }

  .floating-shapes span {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(139,111,90,0.13);
    animation: floatMove 6s infinite ease-in-out;
    filter: blur(1px);
    pointer-events: none;
  }

  .floating-shapes span:nth-child(1) { top: 12%; left: 5%; }
  .floating-shapes span:nth-child(2) { top: 42%; right: 4%; animation-delay: 1s; }
  .floating-shapes span:nth-child(3) { bottom: 14%; left: 10%; animation-delay: 2s; }
  .floating-shapes span:nth-child(4) { bottom: 35%; right: 18%; animation-delay: 3s; }

  .marquee,
  .bottom-marquee {
    width: calc(100% + 36px);
    margin-left: -18px;
    margin-right: -18px;
    overflow: hidden;
    background: #1f1b18;
    color: #fff;
    border-radius: 0;
    padding: 15px 0;
    box-shadow: 0 18px 40px rgba(0,0,0,0.18);
    position: relative;
    z-index: 5;
  }

  .marquee {
    margin-bottom: 55px;
  }

  .marquee-track,
  .bottom-track {
    display: flex;
    width: max-content;
    animation: marqueeMove 16s linear infinite;
    font-weight: 950;
    letter-spacing: 3px;
    font-size: 14px;
    text-transform: uppercase;
  }

  .marquee-track span,
  .bottom-track span {
    white-space: nowrap;
    padding: 0 30px;
  }

  .bottom-marquee {
    margin-top: 70px;
    margin-bottom: 0;
    background: linear-gradient(90deg, #8b6f5a, #1f1b18, #8b6f5a);
  }

  .bottom-track {
    animation-duration: 18s;
  }

  .avis-hero {
    text-align: center;
    max-width: 900px;
    margin: 0 auto 60px;
    position: relative;
    z-index: 2;
    animation: fadeUp 1s ease forwards;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.92);
    color: #8b6f5a;
    padding: 11px 20px;
    border-radius: 100px;
    font-weight: 900;
    box-shadow: 0 12px 30px rgba(139,111,90,0.18);
    margin-bottom: 20px;
    animation: pulseGlow 1.8s infinite;
  }

  .avis-hero h1 {
    font-size: clamp(36px, 6vw, 76px);
    line-height: 1.02;
    margin: 0;
    color: #1f1b18;
    font-weight: 950;
    letter-spacing: -2px;
    animation: titleMove 4s infinite ease-in-out;
  }

  .avis-hero h1 span {
    color: #8b6f5a;
    display: inline-block;
    animation: shakeSoft 2s infinite;
  }

  .avis-hero p {
    max-width: 620px;
    margin: 22px auto 0;
    color: #665b55;
    font-size: 17px;
    line-height: 1.75;
  }

  .avis-grid {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    position: relative;
    z-index: 2;
  }

  .avis-card {
    background: rgba(255,255,255,0.86);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 30px;
    padding: 25px;
    box-shadow: 0 20px 45px rgba(139,111,90,0.16);
    min-height: 235px;
    position: relative;
    overflow: hidden;
    animation: cardFloat 3.6s ease-in-out infinite;
    transition: all 0.35s ease;
    cursor: pointer;
  }

  .avis-card:hover {
    transform: translateY(-18px) scale(1.045) rotate(1.2deg);
    box-shadow: 0 35px 75px rgba(139,111,90,0.34);
    border-color: rgba(139,111,90,0.35);
  }

  .avis-card:hover .avatar {
    animation: avatarCrazy 0.7s infinite;
  }

  .avis-card:hover .stars {
    animation: starsDance 0.8s infinite;
  }

  .avis-card:hover p {
    transform: scale(1.02);
    color: #1f1b18;
  }

  .avis-card::before {
    content: "";
    position: absolute;
    top: -80px;
    right: -80px;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: rgba(197,169,146,0.28);
    animation: bubbleMove 4.5s infinite alternate;
  }

  .avis-card::after {
    content: "❤";
    position: absolute;
    bottom: -25px;
    right: 25px;
    font-size: 90px;
    color: rgba(139,111,90,0.07);
    animation: heartBg 3s infinite ease-in-out;
  }

  .card-1 { animation-delay: 0s; }
  .card-2 { animation-delay: .35s; }
  .card-3 { animation-delay: .7s; }
  .card-4 { animation-delay: 1.05s; }
  .card-5 { animation-delay: 1.4s; }

  .card-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 19px;
    background: linear-gradient(135deg, #8b6f5a, #c5a992);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: rotateTiny 2.7s infinite ease-in-out;
    box-shadow: 0 10px 22px rgba(139,111,90,0.28);
  }

  .card-top h3 {
    margin: 0 0 5px;
    color: #1f1b18;
    font-size: 17px;
    font-weight: 900;
  }

  .stars {
    display: flex;
    gap: 2px;
    color: #c5a992;
    transition: 0.3s ease;
  }

  .avis-card p {
    color: #2d2926;
    font-size: 16px;
    line-height: 1.85;
    margin: 0;
    position: relative;
    z-index: 1;
    transition: 0.35s ease;
  }

  .heart-row {
    margin-top: 22px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8b6f5a;
    font-weight: 900;
    font-size: 13px;
    position: relative;
    z-index: 1;
    animation: heartBeat 1.4s infinite;
  }

  @keyframes marqueeMove {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  @keyframes floatMove {
    0%, 100% { transform: translateY(0) translateX(0) scale(1); }
    50% { transform: translateY(-42px) translateX(30px) scale(1.18); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(35px) scale(.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 12px 30px rgba(139,111,90,0.18); transform: scale(1); }
    50% { box-shadow: 0 18px 45px rgba(139,111,90,0.38); transform: scale(1.04); }
  }

  @keyframes titleMove {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes shakeSoft {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-2deg) scale(1.04); }
    50% { transform: rotate(2deg) scale(1.08); }
    75% { transform: rotate(-1deg) scale(1.04); }
  }

  @keyframes cardFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-16px) rotate(.8deg); }
  }

  @keyframes bubbleMove {
    from { transform: scale(1) translate(0,0); }
    to { transform: scale(1.3) translate(-25px,25px); }
  }

  @keyframes rotateTiny {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(9deg) scale(1.06); }
  }

  @keyframes avatarCrazy {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-9deg) scale(1.08); }
    50% { transform: rotate(9deg) scale(1.12); }
    75% { transform: rotate(-5deg) scale(1.08); }
  }

  @keyframes starsDance {
    0%, 100% { transform: translateX(0) scale(1); }
    50% { transform: translateX(6px) scale(1.12); }
  }

  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.11); }
  }

  @keyframes heartBg {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: .7; }
    50% { transform: scale(1.2) rotate(8deg); opacity: 1; }
  }

  @media (max-width: 900px) {
    .avis-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
    }

    .avis-card {
      animation-duration: 3.2s;
    }
  }

  @media (max-width: 600px) {
    .avis-page {
      padding: 0 14px 55px;
    }

    .marquee,
    .bottom-marquee {
      width: calc(100% + 28px);
      margin-left: -14px;
      margin-right: -14px;
      padding: 13px 0;
    }

    .marquee {
      margin-bottom: 38px;
    }

    .marquee-track,
    .bottom-track {
      font-size: 12px;
      letter-spacing: 2.5px;
      animation-duration: 10s;
    }

    .marquee-track span,
    .bottom-track span {
      padding: 0 22px;
    }

    .avis-grid {
      grid-template-columns: 1fr;
      gap: 22px;
    }

    .avis-card {
      min-height: auto;
      padding: 22px;
      border-radius: 25px;
      animation: mobileCardMove 3s ease-in-out infinite;
    }

    .avis-card:hover,
    .avis-card:active {
      transform: translateY(-10px) scale(1.025) rotate(.7deg);
      box-shadow: 0 26px 58px rgba(139,111,90,0.30);
    }

    .avis-hero {
      margin-bottom: 38px;
    }

    .avis-hero p {
      font-size: 15px;
    }

    .avatar {
      width: 52px;
      height: 52px;
    }

    .avis-card p {
      font-size: 15px;
    }
  }

  @keyframes mobileCardMove {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-9px) scale(1.01); }
  }
`}</style>
        </div>
    );
}