import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { CheckCircle2, Home, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";

export default function ThankYou() {
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const fetchWhatsapp = async () => {
      const snap = await getDoc(doc(db, "settings", "contact"));
      if (snap.exists()) {
        setWhatsapp(snap.data().whatsapp || "");
      }
    };

    fetchWhatsapp();
  }, []);

  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  const whatsappText =
    "Bonjour, j'ai une question concernant ma commande.";
  const whatsappLink = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    whatsappText
  )}`;

  return (
    <div className="thankyou-page">
      <div className="thankyou-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="thankyou-card">
        <div className="success-icon">
          <CheckCircle2 size={72} />
        </div>

        <div className="mini-badge">
          <Sparkles size={16} />
          Commande envoyée
        </div>

        <h1>Merci pour votre commande !</h1>

        <p className="main-text">
          Votre commande a bien été reçue. Notre équipe vous contactera dans les
          plus brefs délais afin de confirmer les détails de livraison.
        </p>

        <div className="info-box">
          <MessageCircle size={22} />
          <p>
            Si vous avez des questions concernant votre commande, contactez-nous
            directement sur WhatsApp.
          </p>
        </div>

        {cleanWhatsapp && (
          <a
            className="whatsapp-btn"
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        )}

        <Link to="/" className="home-btn">
          <Home size={20} />
          Accueil
        </Link>

        <Link to="/" className="shop-btn">
          <ShoppingBag size={19} />
          Continuer mes achats
        </Link>
      </div>

      <style>{`
        .thankyou-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(139,111,90,0.28), transparent 35%),
            radial-gradient(circle at bottom right, rgba(197,169,146,0.35), transparent 35%),
            linear-gradient(135deg, #fffaf6, #f4ebe3);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 16px;
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
        }

        .thankyou-bg span {
          position: absolute;
          border-radius: 50%;
          background: rgba(139,111,90,0.13);
          animation: floating 7s ease-in-out infinite;
        }

        .thankyou-bg span:nth-child(1) {
          width: 130px;
          height: 130px;
          top: 12%;
          left: 8%;
        }

        .thankyou-bg span:nth-child(2) {
          width: 90px;
          height: 90px;
          right: 10%;
          top: 22%;
          animation-delay: 1.5s;
        }

        .thankyou-bg span:nth-child(3) {
          width: 160px;
          height: 160px;
          bottom: 8%;
          right: 20%;
          animation-delay: 3s;
        }

        .thankyou-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.95);
          border-radius: 34px;
          padding: 42px 28px;
          text-align: center;
          box-shadow: 0 30px 80px rgba(139,111,90,0.22);
          position: relative;
          z-index: 2;
          animation: popCard .8s ease forwards;
        }

        .success-icon {
          width: 132px;
          height: 132px;
          border-radius: 50%;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, #e9fff3, #ffffff);
          color: #0f8f63;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 45px rgba(15,143,99,0.18);
          animation: pulseSuccess 2s infinite;
        }

        .mini-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #f7eee7;
  color: #8b6f5a;
  padding: 9px 16px;
  border-radius: 14px; /* بدل 100px */
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 16px;
}

        .thankyou-card h1 {
          font-size: clamp(30px, 6vw, 48px);
          line-height: 1.1;
          margin: 0 0 18px;
          color: #24212a;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .main-text {
          color: #6e6670;
          font-size: 16px;
          line-height: 1.9;
          margin: 0 auto 24px;
          max-width: 430px;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fffaf6;
          border: 1px solid #eadbd0;
          padding: 15px;
          border-radius: 20px;
          margin-bottom: 18px;
          text-align: left;
          color: #5d514b;
        }

        .info-box p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 600;
        }

        .whatsapp-btn,
.home-btn,
.shop-btn {
  width: 100%;
  min-height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 900;
  margin-top: 12px;
  transition: .3s ease;
}

        .whatsapp-btn {
          background: linear-gradient(135deg, #18b85f, #0f8f4d);
          color: white;
          box-shadow: 0 16px 35px rgba(24,184,95,0.25);
        }

        .home-btn {
          background: linear-gradient(135deg, #8b6f5a, #6f5140);
          color: white;
          box-shadow: 0 16px 35px rgba(139,111,90,0.28);
        }

        .shop-btn {
          background: white;
          color: #8b6f5a;
          border: 1px solid #eadbd0;
        }

        .whatsapp-btn:hover,
        .home-btn:hover,
        .shop-btn:hover {
          transform: translateY(-4px) scale(1.02);
        }

        @keyframes popCard {
          from { opacity: 0; transform: translateY(35px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulseSuccess {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 45px rgba(15,143,99,0.18); }
          50% { transform: scale(1.06); box-shadow: 0 25px 65px rgba(15,143,99,0.32); }
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-35px) translateX(25px) scale(1.12); }
        }

        @media (max-width: 520px) {
          .thankyou-card {
            padding: 34px 20px;
            border-radius: 28px;
          }

          .success-icon {
            width: 112px;
            height: 112px;
          }

          .main-text {
            font-size: 15px;
          }

          .info-box {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}