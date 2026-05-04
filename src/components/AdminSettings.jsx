import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, MessageCircle, Settings as SettingsIcon, Ticket, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSettings() {
  const [whatsapp, setWhatsapp] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [percentage, setPercentage] = useState("");
  const [activeCodes, setActiveCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ref = doc(db, "settings", "contact");

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setWhatsapp(snap.data().whatsapp || "");
        setActiveCodes(snap.data().promoCodes || []);
      }
    };
    fetchData();
  }, []);

  const handleSaveWhatsapp = async () => {
    if (!whatsapp) return Swal.fire("Erreur", "Veuillez entrer un numéro WhatsApp", "error");
    try {
      setLoading(true);
      await updateDoc(ref, { whatsapp: whatsapp });
      Swal.fire("Succès", "WhatsApp mis à jour", "success");
    } catch (err) {
      Swal.fire("Erreur", "Problème de mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromo = async () => {
    if (!promoCode || !percentage) return Swal.fire("Erreur", "Remplissez le code et le pourcentage", "error");
    const newPromo = { code: promoCode.toUpperCase().trim(), discount: Number(percentage) };
    
    try {
      setLoading(true);
      await updateDoc(ref, { promoCodes: arrayUnion(newPromo) });
      setActiveCodes([...activeCodes, newPromo]);
      setPromoCode("");
      setPercentage("");
      Swal.fire("Ajouté", "Code promo activé", "success");
    } catch (err) {
      Swal.fire("Erreur", "Problème lors de l'ajout", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromo = async (promo) => {
    try {
      await updateDoc(ref, { promoCodes: arrayRemove(promo) });
      setActiveCodes(activeCodes.filter(c => c.code !== promo.code));
      Swal.fire("Supprimé", "Code promo retiré", "success");
    } catch (err) {
      Swal.fire("Erreur", "Problème de suppression", "error");
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="container">
        <header className="settings-header">
          <button onClick={() => navigate("/admin")} className="back-btn-v2">
            <ArrowLeft size={18} /> <span>Retour</span>
          </button>
          <div className="settings-title">
            <SettingsIcon size={24} color="#8b6f5a" />
            <h1>Paramètres Généraux</h1>
          </div>
        </header>

        <div className="settings-grid">
          <div className="left-side">
            <div className="settings-card mb-30">
              <div className="card-head">
                <MessageCircle size={24} color="#25D366" />
                <h3>Configuration WhatsApp</h3>
              </div>
              <div className="input-group-v2">
                <input type="text" placeholder="2126XXXXXXXX" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <button className="save-btn-v2" onClick={handleSaveWhatsapp} disabled={loading}>
                <Save size={18} /> {loading ? "Enregistrement..." : "Enregistrer WhatsApp"}
              </button>
            </div>

            <div className="settings-card">
              <div className="card-head">
                <Ticket size={24} color="#8b6f5a" />
                <h3>Gestion des Codes Promos</h3>
              </div>
              <div className="promo-inputs">
                <input type="text" placeholder="CODE (Ex: SAHAR10)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                <input type="number" placeholder="Remise %" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
                <button className="add-promo-btn" onClick={handleAddPromo} disabled={loading}>
                   <Plus size={20} />
                </button>
              </div>

              <div className="active-codes-list">
                {activeCodes.map((c, i) => (
                  <div key={i} className="code-tag">
                    <span><strong>{c.code}</strong> (-{c.discount}%)</span>
                    <button onClick={() => handleDeletePromo(c)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="info-side-card">
            <h4>Aide & Conseils</h4>
            <ul>
              <li>Les codes promos s'appliquent sur le total du panier.</li>
              <li>Le pourcentage doit être un nombre (ex: 10 pour 10%).</li>
              <li>Un code supprimé ne fonctionnera plus pour les clients.</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .admin-settings-page { background: #fdfbf9; min-height: 100vh; padding: 40px 15px; }
        .settings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .settings-title { display: flex; align-items: center; gap: 12px; }
        .settings-title h1 { font-size: 24px; color: #2d2d2d; margin: 0; font-weight: 800; }
        .back-btn-v2 { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #f0eee8; padding: 8px 16px; border-radius: 50px; cursor: pointer; font-weight: 600; color: #888; transition: 0.3s; }
        .back-btn-v2:hover { background: #8b6f5a; color: #fff; }
        .settings-grid { display: grid; grid-template-columns: 1fr 300px; gap: 30px; }
        .settings-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #f0eee8; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .mb-30 { margin-bottom: 30px; }
        .card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .card-head h3 { margin: 0; font-size: 18px; color: #2d2d2d; }
        .input-group-v2 { margin-bottom: 15px; }
        .input-group-v2 input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 16px; background: #f8fafc; outline: none; box-sizing: border-box;}
        .save-btn-v2 { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #8b6f5a; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .promo-inputs { display: flex; gap: 10px; margin-bottom: 20px; }
        .promo-inputs input { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #eee; background: #fdfdfd; outline: none; }
        .add-promo-btn { background: #2d2d2d; color: white; border: none; padding: 0 15px; border-radius: 10px; cursor: pointer; }
        .active-codes-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .code-tag { display: flex; align-items: center; gap: 10px; background: #f0eee8; padding: 8px 15px; border-radius: 50px; font-size: 14px; color: #8b6f5a; }
        .code-tag button { background: none; border: none; color: #d33; cursor: pointer; padding: 0; display: flex; }
        .info-side-card { background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px dashed #cbd5e1; height: fit-content; }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .promo-inputs { flex-direction: column; } }
      `}</style>
    </div>
  );
}