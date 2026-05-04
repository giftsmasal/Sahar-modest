import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { db } from "../services/firebase";
import { collection, addDoc, doc, runTransaction, getDoc } from "firebase/firestore";
import { User, CreditCard, Ticket, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", note: "" });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  useEffect(() => {
    const fetchCodes = async () => {
      const snap = await getDoc(doc(db, "settings", "contact"));
      if (snap.exists()) setAvailableCodes(snap.data().promoCodes || []);
    };
    fetchCodes();
  }, []);

  const handleApplyPromo = () => {
    const found = availableCodes.find(c => c.code === promoInput.toUpperCase().trim());
    if (found) {
      setDiscount(found.discount);
      setAppliedCode(found.code);
      Swal.fire("Succès", `Code ${found.code} appliqué (-${found.discount}%)`, "success");
    } else {
      Swal.fire("Erreur", "Code promo invalide", "error");
    }
  };

  const decreaseStock = async (cartItems) => {
    for (let item of cartItems) {
      const ref = doc(db, "products", item.productId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        const updatedColors = data.colors.map((color) => {
          if (color.image === item.image) {
            const currentStock = color.sizes[item.size] || 0;
            if (currentStock < item.quantity) throw new Error(`Stock insuffisant pour ${item.name}`);
            return { ...color, sizes: { ...color.sizes, [item.size]: currentStock - item.quantity } };
          }
          return color;
        });
        transaction.update(ref, { colors: updatedColors });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city || !form.address) {
      return Swal.fire("Erreur", "Veuillez remplir tous les champs", "error");
    }
    if (cart.length === 0) return Swal.fire("Erreur", "Panier vide", "error");

    try {
      setLoading(true);
      await decreaseStock(cart);
      await addDoc(collection(db, "orders"), {
        client: form,
        items: cart,
        subtotal,
        discount: discountAmount,
        appliedCode,
        total,
        status: "nouvelle",
        createdAt: new Date()
      });

      await fetch("https://hook.eu1.make.com/f9xvzkjms1z3jega60e454c8e14cipet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, total, items: cart, promo: appliedCode })
      });

      Swal.fire({ title: "Merci !", text: "Commande reçue", icon: "success", confirmButtonColor: "#8b6f5a" });
      clearCart();
      setForm({ name: "", phone: "", city: "", address: "", note: "" });
    } catch (err) {
      Swal.fire("Erreur", err.message || "Problème lors de la commande", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page-v2 container">
      <div className="checkout-grid">
        <div className="checkout-form-side">
          <div className="checkout-card">
            <h2 className="section-title"><User size={20} /> Informations de livraison</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group"><label>Nom complet *</label><input placeholder="Ex: Sara Ahmed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="input-group"><label>Téléphone *</label><input placeholder="06XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="input-row-flex">
                 <div className="input-group flex-1"><label>Ville *</label><input placeholder="Casablanca" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                 <div className="input-group flex-2"><label>Adresse exacte *</label><input placeholder="Quartier, N°..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              </div>
              <div className="input-group"><label>Remarque (Optionnel)</label><textarea placeholder="Précisions..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
              <div className="payment-notice"><CreditCard size={18} /><span>Paiement Cash à la livraison</span></div>
              <button className="confirm-btn" disabled={loading} type="submit">{loading ? "Traitement..." : "Confirmer ma commande"}</button>
            </form>
          </div>
        </div>

        <div className="checkout-summary-side">
          <div className="summary-sticky-card">
            <h3 className="summary-title">Votre commande</h3>
            <div className="checkout-items-scroll">
              {cart.map((item, i) => (
                <div key={i} className="mini-item-card">
                  <div className="mini-img"><img src={item.image} alt={item.name} /><span className="mini-qty-badge">{item.quantity}</span></div>
                  <div className="mini-details"><p className="mini-name">{item.name}</p><p className="mini-meta">{item.size}</p></div>
                  <div className="mini-price">{item.price * item.quantity} DH</div>
                </div>
              ))}
            </div>

            <div className="promo-section">
              <div className="promo-input-wrapper">
                <Ticket size={18} className="promo-icon" />
                <input type="text" placeholder="Code promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} disabled={appliedCode} />
                <button onClick={handleApplyPromo} disabled={!promoInput || appliedCode}>
                  {appliedCode ? <CheckCircle size={18} /> : "Appliquer"}
                </button>
              </div>
            </div>

            <div className="summary-footer">
              <div className="summary-row"><span>Sous-total</span><span className="row-val">{subtotal} DH</span></div>
              {discount > 0 && <div className="summary-row discount-text"><span>Remise ({appliedCode})</span><span className="row-val">-{discountAmount} DH</span></div>}
              <div className="summary-row"><span>Livraison</span><span className="free-tag-green">Gratuite</span></div>
              <hr className="summary-divider" />
              <div className="summary-row total-big"><span>Total à payer</span><span className="total-val">{total} DH</span></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page-v2 { padding: 40px 15px; background: #fdfbf9; min-height: 100vh; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 400px; gap: 30px; max-width: 1100px; margin: 0 auto; }
        .checkout-card { background: white; padding: 30px; border-radius: 20px; border: 1px solid #eee; }
        .section-title { display: flex; align-items: center; gap: 10px; font-size: 20px; margin-bottom: 25px; color: #2d2d2d; font-weight: 700; }
        .input-group { margin-bottom: 15px; }
        .input-row-flex { display: flex; gap: 15px; }
        .flex-1 { flex: 1; } .flex-2 { flex: 2; }
        .input-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #555; }
        .input-group input, .input-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; }
        .payment-notice { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f0fdf4; color: #166534; border-radius: 10px; font-size: 13px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
        .confirm-btn { width: 100%; background: #8b6f5a; color: white; padding: 16px; border-radius: 50px; border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .summary-sticky-card { background: white; padding: 24px; border-radius: 20px; border: 1px solid #f0f0f0; position: sticky; top: 40px; }
        .mini-item-card { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #fafafa; }
        .mini-img { position: relative; width: 50px; height: 65px; flex-shrink: 0; }
        .mini-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
        .mini-qty-badge { position: absolute; top: -8px; right: -8px; background: #8b6f5a; color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
        .mini-name { font-size: 13px; font-weight: 600; margin: 0; }
        .mini-meta { font-size: 11px; color: #888; margin: 0; }
        .promo-section { margin: 20px 0; padding: 15px 0; border-top: 1px solid #eee; }
        .promo-input-wrapper { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 5px 10px; gap: 8px; }
        .promo-icon { color: #8b6f5a; }
        .promo-input-wrapper input { flex: 1; background: none; border: none; padding: 10px; outline: none; font-size: 14px; width: 50px; }
        .promo-input-wrapper button { background: #2d2d2d; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .promo-input-wrapper button:disabled { background: #ccc; cursor: not-allowed; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .discount-text { color: #166534; font-weight: 600; }
        .free-tag-green { color: #15803d; font-weight: 700; background: #f0fdf4; padding: 2px 8px; border-radius: 6px; font-size: 11px; }
        .total-big { font-size: 18px; font-weight: 800; border-top: 1px solid #eee; pt: 15px; }
        .total-val { color: #8b6f5a; }
        @media (max-width: 992px) { .checkout-grid { grid-template-columns: 1fr; } .checkout-summary-side { order: -1; } .summary-sticky-card { position: static; } .input-row-flex { flex-direction: column; gap: 0; } }
      `}</style>
    </div>
  );
}