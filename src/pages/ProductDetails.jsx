import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { collection, addDoc, doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingBag,
  Ticket,
  User,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);
  const [availableCodes, setAvailableCodes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          setSelectedSize(getFirstAvailableSize(data.colors?.[0]));
        }
      } catch (error) {
        console.error("Erreur fetching product:", error);
      }
    };

    const fetchCodes = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "contact"));
        if (snap.exists()) setAvailableCodes(snap.data().promoCodes || []);
      } catch (error) {
        console.error("Erreur fetching promo codes:", error);
      }
    };

    if (id) fetchProduct();
    fetchCodes();
  }, [id]);

  const getFirstAvailableSize = (color) => {
    if (!color?.sizes) return "";
    return Object.keys(color.sizes).find((size) => Number(color.sizes[size]) > 0) || "";
  };

  const changeVariant = (index) => {
    if (!product?.colors?.[index]) return;
    setSelectedVariant(index);
    setSelectedSize(getFirstAvailableSize(product.colors[index]));
    setQuantity(1);
  };

  const productPrice = Number(product?.price || 0);
  const variant = product?.colors?.[selectedVariant] || null;
  const images = product?.colors?.map((c) => c.image).filter(Boolean) || [];
  const currentStock = selectedSize ? Number(variant?.sizes?.[selectedSize] || 0) : 0;

  const item = useMemo(() => {
    if (!product || !variant) return null;
    return {
      productId: product.id,
      name: product.name,
      image: variant.image,
      color: variant.name || variant.color || `Couleur ${selectedVariant + 1}`,
      size: selectedSize,
      price: productPrice,
      quantity,
      stockMax: currentStock,
    };
  }, [product, variant, selectedVariant, selectedSize, productPrice, quantity, currentStock]);

  const subtotal = item ? item.price * item.quantity : 0;
  const discountAmount = Math.round((subtotal * discount) / 100);
  const total = subtotal - discountAmount;

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = availableCodes.find((c) => c.code?.toUpperCase() === code);

    if (!code) return;

    if (found) {
      setDiscount(Number(found.discount || 0));
      setAppliedCode(found.code);
      Swal.fire("Succès", `Code ${found.code} appliqué (-${found.discount}%)`, "success");
    } else {
      Swal.fire("Erreur", "Code promo invalide", "error");
    }
  };

  const decreaseStock = async () => {
    const ref = doc(db, "products", product.id);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Produit introuvable");

      const data = snap.data();
      const updatedColors = (data.colors || []).map((color, index) => {
        if (index !== selectedVariant) return color;

        const oldStock = Number(color.sizes?.[selectedSize] || 0);
        if (oldStock < quantity) {
          throw new Error(`Stock insuffisant. Il reste seulement ${oldStock} pièce(s).`);
        }

        return {
          ...color,
          sizes: {
            ...(color.sizes || {}),
            [selectedSize]: oldStock - quantity,
          },
        };
      });

      transaction.update(ref, { colors: updatedColors });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSize) return Swal.fire("Taille", "Veuillez choisir une taille", "info");
    if (currentStock <= 0) return Swal.fire("Stock", "Ce produit est épuisé", "error");
    if (!form.name || !form.phone || !form.city || !form.address) {
      return Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires", "error");
    }

    try {
      setLoading(true);
      await decreaseStock();

      const orderData = {
        client: form,
        items: [item],
        subtotal,
        discount: discountAmount,
        appliedCode,
        total,
        status: "nouvelle",
        source: "product-details-direct-checkout",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "orders"), orderData);

      try {
        await fetch("https://hook.eu1.make.com/f9xvzkjms1z3jega60e454c8e14cipet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, total, items: [item], promo: appliedCode }),
        });
      } catch (hookError) {
        console.error("Make webhook error:", hookError);
      }

      navigate("/thank-you", { replace: true });
    } catch (err) {
      Swal.fire("Erreur", err.message || "Problème lors de la commande", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!product || !variant) return <div className="loader-simple">Chargement...</div>;

  return (
    <div className="p-details-container">
      <div className="p-gallery-section">
        <div className="p-main-wrapper">
          {images.length > 1 && (
            <button
              type="button"
              className="nav-arrow left"
              onClick={() => changeVariant(selectedVariant === 0 ? images.length - 1 : selectedVariant - 1)}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img src={variant.image} alt={product.name} className="p-main-img" />

          {images.length > 1 && (
            <button
              type="button"
              className="nav-arrow right"
              onClick={() => changeVariant(selectedVariant === images.length - 1 ? 0 : selectedVariant + 1)}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="p-thumbnails">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Couleur ${i + 1}`}
              className={i === selectedVariant ? "thumb active" : "thumb"}
              onClick={() => changeVariant(i)}
            />
          ))}
        </div>
      </div>

      <div className="p-info-section">
        <span className="p-category">{product.collection || "SAHAR MODEST"}</span>
        <h1 className="p-title">{product.name}</h1>

        <div className="p-price-box">
          <span className="price-new">{product.price} DH</span>
          {product.oldPrice && <span className="price-old">{product.oldPrice} DH</span>}
          <span className={currentStock > 0 ? "stock-tag" : "stock-tag out"}>
            {currentStock > 0 ? "● En Stock" : "○ Épuisé"}
          </span>
        </div>

        <div className="p-options">
          <label className="section-label">Choisir la taille</label>
          <div className="size-selector">
            {Object.keys(variant.sizes || {}).map((size) => (
              <button
                type="button"
                key={size}
                disabled={Number(variant.sizes[size]) === 0}
                className={selectedSize === size ? "size-btn active" : "size-btn"}
                onClick={() => {
                  setSelectedSize(size);
                  setQuantity(1);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="p-actions direct-actions">
          <div className="qty-input">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => Math.min(currentStock || 1, q + 1))}>+</button>
          </div>
          <div className="selected-mini">
            <img src={variant.image} alt={product.name} />
            <div>
              <strong>{product.name}</strong>
              <span>{selectedSize ? `Taille: ${selectedSize}` : "Choisir taille"}</span>
            </div>
          </div>
        </div>

        <div className="direct-checkout-card">
          <h2 className="checkout-title"><ShoppingBag size={20} /> Commander maintenant</h2>

          <div className="mini-summary-card">
            <div className="mini-item-card">
              <div className="mini-img">
                <img src={variant.image} alt={product.name} />
                <span className="mini-qty-badge">{quantity}</span>
              </div>
              <div className="mini-details">
                <p className="mini-name">{product.name}</p>
                <p className="mini-meta">Taille: {selectedSize || "-"}</p>
              </div>
              <div className="mini-price">{subtotal} DH</div>
            </div>

            <div className="promo-section">
              <div className="promo-input-wrapper">
                <Ticket size={18} className="promo-icon" />
                <input
                  type="text"
                  placeholder="Code promo"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  disabled={!!appliedCode}
                />
                <button type="button" onClick={handleApplyPromo} disabled={!promoInput || !!appliedCode}>
                  {appliedCode ? <CheckCircle size={18} /> : "Appliquer"}
                </button>
              </div>
            </div>

            <div className="summary-footer">
              <div className="summary-row"><span>Sous-total</span><span>{subtotal} DH</span></div>
              {discount > 0 && (
                <div className="summary-row discount-text"><span>Remise ({appliedCode})</span><span>-{discountAmount} DH</span></div>
              )}
              <div className="summary-row"><span>Livraison</span><span className="free-tag-green">Gratuite</span></div>
              <div className="summary-row total-big"><span>Total à payer</span><span>{total} DH</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="direct-form">
            <h3 className="form-title"><User size={18} /> Informations de livraison</h3>

            <div className="input-group">
              <label>Nom complet *</label>
              <input placeholder="Ex: Sara Ahmed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="input-group">
              <label>Téléphone *</label>
              <input placeholder="06XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="input-row-flex">
              <div className="input-group flex-1">
                <label>Ville *</label>
                <input placeholder="Casablanca" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="input-group flex-2">
                <label>Adresse exacte *</label>
                <input placeholder="Quartier, N°..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            <div className="input-group">
              <label>Remarque (Optionnel)</label>
              <textarea placeholder="Précisions..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>

            <div className="payment-notice"><CreditCard size={18} /><span>Paiement Cash à la livraison</span></div>

            <button className="confirm-btn" disabled={loading || currentStock === 0} type="submit">
              {loading ? "Traitement..." : currentStock === 0 ? "Rupture de stock" : "Confirmer ma commande"}
            </button>
          </form>
        </div>

        <div className="p-description">
          <h3 className="section-label">Description</h3>
          <p>{product.description}</p>
        </div>
      </div>

      <style>{`
        .p-details-container { display: flex; flex-wrap: wrap; gap: 40px; padding: 20px; max-width: 1180px; margin: 0 auto; font-family: sans-serif; }
        .p-gallery-section, .p-info-section { flex: 1 1 450px; width: 100%; }
        .p-main-wrapper { position: relative; border-radius: 20px; overflow: hidden; background: #f9f9f9; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-main-img { width: 100%; height: auto; object-fit: cover; display: block; }
        .nav-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; padding: 10px; border-radius: 50%; cursor: pointer; display: flex; transition: 0.3s; z-index: 2; }
        .nav-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .nav-arrow.left { left: 15px; } .nav-arrow.right { right: 15px; }
        .p-thumbnails { display: flex; gap: 12px; margin-top: 15px; overflow-x: auto; padding-bottom: 5px; }
        .thumb { width: 65px; height: 75px; object-fit: cover; cursor: pointer; border-radius: 10px; border: 2px solid transparent; transition: 0.3s; }
        .thumb.active { border-color: #c5a992; }
        .p-category { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; font-weight: bold; }
        .p-title { font-size: 32px; font-weight: 800; margin: 8px 0; color: #1a1a1a; }
        .p-price-box { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
        .price-new { font-size: 26px; font-weight: 900; color: #1a1a1a; }
        .price-old { text-decoration: line-through; color: #bbb; font-size: 18px; }
        .stock-tag { color: #2ecc71; font-size: 13px; font-weight: bold; background: #ecfdf5; padding: 4px 10px; border-radius: 20px; }
        .stock-tag.out { color: #b91c1c; background: #fef2f2; }
        .section-label { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 12px; display: block; }
        .size-selector { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px; }
        .size-btn { padding: 12px 20px; border: 1px solid #eee; background: #fff; cursor: pointer; border-radius: 8px; font-weight: 600; transition: 0.2s; }
        .size-btn.active { background: #c5a992; color: #fff; border-color: #c5a992; }
        .size-btn:hover:not(:disabled) { border-color: #c5a992; color: #c5a992; }
        .size-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .p-actions { display: flex; gap: 15px; margin: 25px 0; align-items: center; }
        .qty-input { display: flex; align-items: center; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; }
        .qty-input button { padding: 12px 18px; border: none; background: none; cursor: pointer; font-size: 20px; color: #666; }
        .qty-input span { width: 30px; text-align: center; font-weight: bold; font-size: 16px; }
        .selected-mini { flex: 1; display: flex; align-items: center; gap: 12px; background: #faf9f8; border: 1px solid #eee; padding: 10px; border-radius: 12px; }
        .selected-mini img { width: 45px; height: 55px; object-fit: cover; border-radius: 8px; }
        .selected-mini strong { display: block; font-size: 13px; color: #222; }
        .selected-mini span { display: block; font-size: 12px; color: #777; margin-top: 3px; }
        .direct-checkout-card { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 24px; margin: 25px 0; box-shadow: 0 10px 35px rgba(139,111,90,0.08); }
        .checkout-title, .form-title { display: flex; align-items: center; gap: 10px; color: #2d2d2d; margin: 0 0 20px; }
        .checkout-title { font-size: 22px; font-weight: 800; }
        .form-title { font-size: 17px; font-weight: 750; margin-top: 22px; }
        .mini-summary-card { background: #fdfbf9; border: 1px solid #f0e8df; padding: 16px; border-radius: 16px; }
        .mini-item-card { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
        .mini-img { position: relative; width: 54px; height: 68px; flex-shrink: 0; }
        .mini-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
        .mini-qty-badge { position: absolute; top: -8px; right: -8px; background: #8b6f5a; color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
        .mini-details { flex: 1; }
        .mini-name { font-size: 13px; font-weight: 700; margin: 0 0 4px; }
        .mini-meta { font-size: 12px; color: #777; margin: 0; }
        .mini-price { font-size: 14px; font-weight: 800; color: #8b6f5a; }
        .promo-section { margin: 15px 0; }
        .promo-input-wrapper { display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 5px 10px; gap: 8px; }
        .promo-icon { color: #8b6f5a; }
        .promo-input-wrapper input { flex: 1; background: none; border: none; padding: 10px; outline: none; font-size: 14px; min-width: 0; }
        .promo-input-wrapper button { background: #2d2d2d; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .promo-input-wrapper button:disabled { background: #ccc; cursor: not-allowed; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .discount-text { color: #166534; font-weight: 600; }
        .free-tag-green { color: #15803d; font-weight: 700; background: #f0fdf4; padding: 2px 8px; border-radius: 6px; font-size: 11px; }
        .total-big { font-size: 18px; font-weight: 850; border-top: 1px dashed #ddd; padding-top: 12px; margin-top: 8px; color: #2d2d2d; }
        .total-big span:last-child { color: #8b6f5a; }
        .direct-form { margin-top: 18px; }
        .input-group { margin-bottom: 15px; }
        .input-row-flex { display: flex; gap: 15px; }
        .flex-1 { flex: 1; } .flex-2 { flex: 2; }
        .input-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #555; }
        .input-group input, .input-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; }
        .input-group textarea { min-height: 80px; resize: vertical; }
        .payment-notice { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f0fdf4; color: #166534; border-radius: 10px; font-size: 13px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
        .confirm-btn { width: 100%; background: #8b6f5a; color: white; padding: 16px; border-radius: 50px; border: none; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .confirm-btn:hover:not(:disabled) { background: #765c49; transform: translateY(-1px); }
        .confirm-btn:disabled { background: #ccc; cursor: not-allowed; }
        .p-description p { line-height: 1.6; color: #666; font-size: 15px; }
        @media (max-width: 600px) { .p-details-container { padding: 15px; gap: 25px; } .p-title { font-size: 26px; } .direct-actions { flex-direction: column; align-items: stretch; } .selected-mini { width: 100%; box-sizing: border-box; } .input-row-flex { flex-direction: column; gap: 0; } .direct-checkout-card { padding: 18px; } }
      `}</style>
    </div>
  );
}
