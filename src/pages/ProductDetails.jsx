import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { CartContext } from "../context/CartContext";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Swal from "sweetalert2";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          if (data.colors?.[0]?.sizes) {
            const firstAvailableSize = Object.keys(data.colors[0].sizes).find(
              (size) => data.colors[0].sizes[size] > 0
            );
            if (firstAvailableSize) setSelectedSize(firstAvailableSize);
          }
        }
      } catch (error) {
        console.error("Erreur fetching product:", error);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (!product) return <div className="loader-simple">Chargement...</div>;

  const variant = product.colors?.[selectedVariant];
  const images = product.colors?.map((c) => c.image) || [];
  const currentStock = selectedSize ? variant.sizes[selectedSize] || 0 : 0;

  const handleAdd = () => {
    if (!selectedSize) return Swal.fire("Tailles", "Veuillez choisir une taille", "info");
    addToCart({
      productId: product.id,
      name: product.name,
      image: variant.image,
      size: selectedSize,
      price: product.price,
      quantity,
      stockMax: currentStock,
    });
    Swal.fire({ 
      title: "Ajouté au panier!", 
      icon: "success", 
      timer: 1500, 
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
  };

  return (
    <div className="p-details-container">
      {/* 1. Gallery Section */}
      <div className="p-gallery-section">
        <div className="p-main-wrapper">
          <button className="nav-arrow left" onClick={() => setSelectedVariant(prev => prev === 0 ? images.length - 1 : prev - 1)}>
            <ChevronLeft size={20} />
          </button>
          <img src={variant.image} alt={product.name} className="p-main-img" />
          <button className="nav-arrow right" onClick={() => setSelectedVariant(prev => prev === images.length - 1 ? 0 : prev + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="p-thumbnails">
          {images.map((img, i) => (
            <img 
              key={i} src={img} 
              className={i === selectedVariant ? "thumb active" : "thumb"} 
              onClick={() => setSelectedVariant(i)} 
            />
          ))}
        </div>
      </div>

      {/* 2. Info Section */}
      <div className="p-info-section">
        <span className="p-category">{product.collection || "SAHABA PARFUM 306"}</span>
        <h1 className="p-title">{product.name}</h1>
        
        <div className="p-price-box">
          <span className="price-new">{product.price} DH</span>
          {product.oldPrice && <span className="price-old">{product.oldPrice} DH</span>}
          {/* رجعت اللون الأخضر هنا */}
          <span className="stock-tag">{currentStock > 0 ? "● En Stock" : "○ Épuisé"}</span>
        </div>

        <div className="p-options">
          <label className="section-label">Choisir la Taille</label>
          <div className="size-selector">
            {Object.keys(variant.sizes).map((size) => (
              <button
                key={size}
                disabled={variant.sizes[size] === 0}
                className={selectedSize === size ? "size-btn active" : "size-btn"}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="p-actions">
          <div className="qty-input">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}>+</button>
          </div>
          {/* الزر باللون البيج/المارون وبنص "Ajouter au panier" */}
          <button className="buy-btn" onClick={handleAdd} disabled={currentStock === 0}>
            <ShoppingBag size={18} />
            <span>{currentStock === 0 ? "Rupture de Stock" : "Ajouter au Panier"}</span>
          </button>
        </div>

        <div className="p-description">
          <h3 className="section-label">Description</h3>
          <p>{product.description}</p>
        </div>
      </div>

      <style jsx>{`
        .p-details-container {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          padding: 20px;
          max-width: 1100px;
          margin: 0 auto;
          font-family: sans-serif;
        }

        .p-gallery-section, .p-info-section {
          flex: 1 1 450px;
          width: 100%;
        }

        .p-main-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #f9f9f9;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .p-main-img { width: 100%; height: auto; object-fit: cover; display: block; }

        .nav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9); border: none; padding: 10px;
          border-radius: 50%; cursor: pointer; display: flex; transition: 0.3s;
        }
        .nav-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .nav-arrow.left { left: 15px; }
        .nav-arrow.right { right: 15px; }

        .p-thumbnails { display: flex; gap: 12px; margin-top: 15px; overflow-x: auto; padding-bottom: 5px; }
        .thumb { width: 65px; height: 75px; object-fit: cover; cursor: pointer; border-radius: 10px; border: 2px solid transparent; transition: 0.3s; }
        .thumb.active { border-color: #c5a992; } /* مارون فاتح */

        .p-category { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; font-weight: bold; }
        .p-title { font-size: 32px; font-weight: 800; margin: 8px 0; color: #1a1a1a; }
        .p-price-box { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
        .price-new { font-size: 26px; font-weight: 900; color: #1a1a1a; }
        .price-old { text-decoration: line-through; color: #bbb; font-size: 18px; }
        
        /* رجعت اللون الأخضر هنا */
        .stock-tag { color: #2ecc71; font-size: 13px; font-weight: bold; background: #ecfdf5; padding: 4px 10px; border-radius: 20px; }

        .section-label { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 12px; display: block; }
        
        .size-selector { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px; }
        .size-btn { padding: 12px 20px; border: 1px solid #eee; background: #fff; cursor: pointer; border-radius: 8px; font-weight: 600; transition: 0.2s; }
        .size-btn.active { background: #c5a992; color: #fff; border-color: #c5a992; }
        .size-btn:hover:not(:disabled) { border-color: #c5a992; color: #c5a992; }
        .size-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .p-actions { display: flex; gap: 15px; margin: 30px 0; align-items: center; }
        .qty-input { display: flex; align-items: center; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; }
        .qty-input button { padding: 12px 18px; border: none; background: none; cursor: pointer; font-size: 20px; color: #666; }
        .qty-input span { width: 30px; text-align: center; font-weight: bold; font-size: 16px; }

        .buy-btn {
          flex: 2;
          background: #c5a992; /* اللون المارون/البيج اللي كان عندك */
          color: #fff; 
          padding: 16px 24px;
          border: none; border-radius: 12px; font-weight: 700;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(197, 169, 146, 0.3);
          font-size: 14px;
          white-space: nowrap; /* كيمنع النص يتقسم على جوج سطور */
        }
        .buy-btn:hover:not(:disabled) { background: #b3967f; transform: translateY(-2px); }
        .buy-btn:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }

        .p-description p { line-height: 1.6; color: #666; font-size: 15px; }

        @media (max-width: 600px) {
          .p-details-container { padding: 15px; gap: 25px; }
          .p-title { font-size: 26px; }
          .p-actions { flex-direction: column; align-items: stretch; }
          .buy-btn { width: 100%; order: 1; }
          .qty-input { order: 2; justify-content: center; }
        }
      `}</style>
    </div>
  );
}