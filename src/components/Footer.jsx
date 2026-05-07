import { Link } from "react-router-dom";
import { Phone, Camera, Truck, MessageSquare, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

function formatWhatsappNumber(number) {
  let clean = String(number || "").replace(/\D/g, "");

  if (!clean) return "";

  if (clean.startsWith("00")) {
    clean = clean.substring(2);
  }

  if (clean.startsWith("0")) {
    clean = "212" + clean.substring(1);
  }

  if (!clean.startsWith("212")) {
    clean = "212" + clean;
  }

  return clean;
}

function getWhatsappLink(number, text) {
  const cleanNumber = formatWhatsappNumber(number);
  if (!cleanNumber) return "#";

  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(
    text
  )}`;
}

export default function Footer() {
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "contact"), (snap) => {
      if (snap.exists()) setWhatsapp(snap.data().whatsapp || "");
    });

    return () => unsub();
  }, []);

  const whatsappLink = getWhatsappLink(
    whatsapp,
    "Bonjour."
  );

  return (
    <footer className="footer-v2">
      <div className="footer-grid container">
        <div className="footer-brand-col">
          <h2 className="footer-logo">SAHAR</h2>
          <p>
            L’élégance, la pudeur et le style moderne réunis dans une seule
            marque marocaine.
          </p>

          <div className="footer-socials">
            {whatsapp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Phone size={20} />
              </a>
            )}

            <a
              href="https://instagram.com/sahar_modestbrand"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Camera size={20} />
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h3>Navigation</h3>
          <Link to="/">Accueil</Link>
          <Link to="/about">À propos</Link>
          <Link to="/reclamation">Réclamation / Échange</Link>
        </div>

        <div className="footer-info-col">
          <h3>Services</h3>
          <p>
            <Truck size={18} color="#8b6f5a" /> Livraison partout au Maroc
          </p>
          <p>
            <MessageSquare size={18} color="#8b6f5a" /> Support client 7j/7
          </p>
          <p>
            <ShieldCheck size={18} color="#8b6f5a" /> Paiement à la livraison
          </p>
        </div>
      </div>

      <div className="footer-copyright">
        <p>
          © {new Date().getFullYear()} <Link to="/admin">SAHAR</Link> — Tous
          droits réservés.
        </p>
      </div>

      <style>{`
        .footer-v2 {
          background: #1a1a1a;
          color: #f9f9f9;
          padding: 70px 20px 20px;
          margin-top: 80px;
        }

        .footer-grid {
          max-width: 1200px;
          margin: 0 auto 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .footer-logo {
          font-size: 32px;
          margin-bottom: 15px;
          color: #fff;
          letter-spacing: 2px;
        }

        .footer-brand-col p {
          color: #888;
          font-size: 14px;
          line-height: 1.7;
          max-width: 300px;
        }

        .footer-socials {
          display: flex;
          gap: 12px;
          margin-top: 25px;
        }

        .footer-socials a {
          color: #fff;
          background: #333;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
        }

        .footer-socials a:hover {
          background: #8b6f5a;
          transform: translateY(-3px);
        }

        .footer-links-col h3,
        .footer-info-col h3 {
          font-size: 18px;
          margin-bottom: 25px;
          color: #fff;
          font-weight: 600;
        }

        .footer-links-col a {
          display: block;
          color: #888;
          text-decoration: none;
          margin-bottom: 15px;
          font-size: 15px;
          transition: 0.2s;
        }

        .footer-links-col a:hover {
          color: #8b6f5a;
          padding-left: 5px;
        }

        .footer-info-col p {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #888;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .footer-copyright {
          border-top: 1px solid #333;
          padding-top: 25px;
          text-align: center;
          font-size: 13px;
          color: #555;
        }

        .footer-copyright a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </footer>
  );
}