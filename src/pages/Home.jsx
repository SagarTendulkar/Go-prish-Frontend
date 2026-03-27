import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Star,
  ArrowRight,
} from "lucide-react";

// ─── Slide data ───────────────────────────────────────────────
const SLIDES = [
  {
    img: "https://res.cloudinary.com/dpj6hc8uk/image/upload/v1765263261/obzhne8edeyksjg0shvb.jpg",
    tag: "New Season — 2025",
    line1: "Effortless Style,",
    line2: "Every Day.",
    sub: "Experience the gentle luxury of cotton — made for the way you live.",
  },
  {
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    tag: "New Arrivals",
    line1: "Fresh Drops,",
    line2: "Just For You.",
    sub: "Handpicked collections that fit your vibe, every single day.",
  },
  {
    img: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1600&q=80",
    tag: "Casual Wear",
    line1: "Comfort Meets",
    line2: "Style.",
    sub: "Everyday essentials crafted with care, made to last.",
  },
];

// ─── Marquee items ────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Free Shipping Over ₹999",
  "New Arrivals Every Week",
  "Easy Returns within 7 Days",
  "100% Pure Cotton Fabrics",
  "Exclusive Member Discounts",
  "Handpicked For You",
];

// ─── Why choose us ────────────────────────────────────────────
const WHY_US = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On all orders above ₹999 across India",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Hassle-free 7-day return policy, no questions asked",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    desc: "Genuine fabrics and quality guaranteed on every piece",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Our team is always here to help you out",
  },
];

// ─── Testimonials ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Priya R.",
    location: "Mumbai",
    rating: 5,
    text: "The fabric quality is absolutely amazing. Soft, breathable and looks even better in person!",
    initials: "PR",
  },
  {
    name: "Arjun K.",
    location: "Bengaluru",
    rating: 5,
    text: "Fast delivery, great packaging and the fit was perfect. Will definitely order again soon.",
    initials: "AK",
  },
  {
    name: "Sneha M.",
    location: "Pune",
    rating: 5,
    text: "Love the minimalist designs. Got so many compliments. Go Prish is now my go-to brand!",
    initials: "SM",
  },
  {
    name: "Rahul D.",
    location: "Delhi",
    rating: 4,
    text: "Great value for money. The colours are exactly as shown and the stitching is top notch.",
    initials: "RD",
  },
  {
    name: "Ananya S.",
    location: "Chennai",
    rating: 5,
    text: "Ordered 3 pieces and all of them fit perfectly. The packaging was so pretty too!",
    initials: "AS",
  },
  {
    name: "Vikram N.",
    location: "Hyderabad",
    rating: 5,
    text: "Been buying from Go Prish for 6 months. Consistent quality every single time.",
    initials: "VN",
  },
];

// ─── Static fallback category cards ──────────────────────────
const FALLBACK_CATS = [
  {
    name: "New Arrivals",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Casual Wear",
    img: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Accessories",
    img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
  },
];

// ─────────────────────────────────────────────────────────────
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero slider state
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance hero
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((prev) => {
        setAnimKey((k) => k + 1);
        return (prev + 1) % SLIDES.length;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [paused]);

  const goTo = (i) => {
    setActive(i);
    setAnimKey((k) => k + 1);
  };

  // Fetch featured products
  useEffect(() => {
    axiosInstance
      .get("/products/featured")
      .then((res) => setFeaturedProducts(res.data || []))
      .catch((err) => console.error("Error fetching featured products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface text-brand-dark">
      {/* ── CSS keyframes (Ken Burns + text fly-in) ─────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes kenburns {
          0%   { transform: scale(1) translateX(0%) translateY(0%); }
          100% { transform: scale(1.08) translateX(1%) translateY(0.5%); }
        }
        @keyframes flyUp {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .kb-img     { animation: kenburns 8s ease-in-out infinite alternate; will-change: transform; }
        .h-tag      { animation: slideRight 0.55s ease 0.05s both; }
        .h-line1    { animation: flyUp 0.65s ease 0.2s  both; }
        .h-line2    { animation: flyUp 0.65s ease 0.35s both; }
        .h-sub      { animation: flyUp 0.65s ease 0.5s  both; }
        .h-btns     { animation: flyUp 0.65s ease 0.65s both; }
        .marquee-track { animation: marqueeScroll 22s linear infinite; }
        .marquee-wrap:hover .marquee-track { animation-play-state: paused; }
      `}</style>

      {/* ════════════════════════════════════════
          1. HERO SLIDER
      ════════════════════════════════════════ */}
      <section
        className="relative w-full h-screen min-h-[580px] overflow-hidden flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slide images */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.img}
              alt={`Slide ${i + 1}`}
              className="kb-img w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/72 via-black/38 to-transparent" />

        {/* Text content — re-mounts on slide change to restart animations */}
        <div
          key={animKey}
          className="relative z-10 px-6 sm:px-14 md:px-24 max-w-3xl"
        >
          <p className="h-tag inline-block text-[10px] tracking-[3px] uppercase text-white/80 border border-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5">
            {SLIDES[active].tag}
          </p>
          <h1 className="h-line1 font-serif text-white text-4xl sm:text-5xl md:text-6xl font-normal leading-tight">
            {SLIDES[active].line1}
          </h1>
          <h1 className="h-line2 font-serif text-[#e8b99b] text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-5 italic">
            {SLIDES[active].line2}
          </h1>
          <p className="h-sub text-white/65 text-base sm:text-lg leading-relaxed max-w-md mb-8">
            {SLIDES[active].sub}
          </p>
          <div className="h-btns flex flex-wrap gap-3">
            <Link to="/products">
              <button className="px-7 py-3 bg-brand text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.4)]">
                Shop Now
              </button>
            </Link>
            <Link to="/products">
              <button className="px-7 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/20">
                Explore Collection
              </button>
            </Link>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 border-none cursor-pointer ${
                i === active
                  ? "w-8 bg-brand"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-1.5">
          <span className="text-white text-sm font-medium">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="text-white/30 text-xs">/</span>
          <span className="text-white/40 text-xs">
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {paused && (
          <div className="absolute top-5 right-6 z-20 text-white/30 text-[10px] tracking-[3px] uppercase">
            Paused
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════
          2. MARQUEE BANNER
      ════════════════════════════════════════ */}
      <div className="marquee-wrap bg-brand-dark py-3 overflow-hidden">
        <div className="marquee-track flex gap-0 whitespace-nowrap">
          {/* Duplicate items for seamless loop */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3.5 px-7 text-[11px] font-medium tracking-[2px] uppercase text-white/65"
            >
              {item}
              <span className="w-1 h-1 rounded-full bg-brand shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          3. HANDPICKED COLLECTIONS
      ════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10" data-aos="fade-up">
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-3">
              Curated For You
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">
              Handpicked Collections
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {FALLBACK_CATS.map((cat, i) => (
              <Link
                to="/products"
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="relative group overflow-hidden rounded-2xl aspect-4/5 block"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <h3 className="text-white font-serif text-lg font-normal">
                    {cat.name}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center transition-all duration-300 group-hover:bg-brand group-hover:border-brand">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. WHY CHOOSE US
      ════════════════════════════════════════ */}
      <section className="py-14 bg-surface-raised">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            data-aos="fade-up"
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-warm/20 rounded-2xl overflow-hidden border border-warm/20"
          >
            {WHY_US.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                className="bg-surface-raised px-6 py-7 flex flex-col gap-3 group hover:bg-surface transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-brand/15">
                  <Icon size={23} className="text-brand" strokeWidth={1.8} />
                </div>
                <p className="text-md font-medium text-brand-dark">{title}</p>
                <p className="text-[14px] text-ink-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. TRENDING NOW
      ════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10" data-aos="fade-up">
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-3">
              Most Loved
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">
              Trending Now
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="h-56 bg-[#e8d5c8] animate-pulse rounded-2xl" />
                    <div className="mt-3 h-3 bg-[#e8d5c8] animate-pulse rounded-full w-3/4" />
                    <div className="mt-2 h-3 bg-[#e8d5c8] animate-pulse rounded-full w-1/3" />
                  </div>
                ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-ink-muted">
              No featured products found.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {featuredProducts.map((prod, i) => (
                <Link
                  to={`/products/${prod._id}`}
                  key={prod._id}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                  className="group bg-white rounded-2xl overflow-hidden border border-warm/15 hover:shadow-[0_8px_32px_rgba(140,90,60,0.12)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="overflow-hidden aspect-square">
                    <img
                      src={prod.thumbnailImage}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-brand-dark line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-brand font-semibold text-sm">
                        ₹{prod.basePrice}
                      </p>
                      {prod.mrp > prod.basePrice && (
                        <p className="text-[11px] text-ink-faint line-through">
                          ₹{prod.mrp}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10" data-aos="fade-up">
            <Link to="/products">
              <button className="px-8 py-3 bg-brand-dark text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)]">
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-surface-raised">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10" data-aos="fade-up">
            <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-3">
              Happy Customers
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">
              What People Are Saying
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                className="bg-white rounded-2xl p-5 border border-warm/20 flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(140,90,60,0.08)] transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array(t.rating)
                    .fill(null)
                    .map((_, s) => (
                      <Star
                        key={s}
                        size={14}
                        className="text-[#e8a87c] fill-[#e8a87c]"
                      />
                    ))}
                </div>
                {/* Review text */}
                <p className="text-[13px] text-ink-secondary leading-relaxed italic flex-1">
                  "{t.text}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-2.5 pt-1 border-t border-warm/15">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#e8c9b0] to-[#d4956a] flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-brand-dark">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-ink-faint">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7. CTA BANNER
      ════════════════════════════════════════ */}
      <section className="bg-brand-dark text-white py-16 px-4 text-center">
        <p
          className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-4"
          data-aos="fade-up"
        >
          Limited Time
        </p>
        <h2
          className="font-serif text-2xl sm:text-3xl font-normal mb-3"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Refresh Your Wardrobe Today
        </h2>
        <p
          className="max-w-md mx-auto text-white/60 mb-7 text-sm sm:text-base leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          Discover exclusive styles, handpicked for you. Simple. Elegant.
          Affordable.
        </p>
        <div data-aos="fade-up" data-aos-delay="200">
          <Link to="/products">
            <button className="px-8 py-3 bg-brand text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.4)]">
              Explore Collection
            </button>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          8. FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-brand-deep text-white/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
          <p>© {new Date().getFullYear()} Go Prish — All rights reserved.</p>
          <div className="flex gap-5">
            <Link
              to="/about"
              className="text-white/40 hover:text-brand transition-colors no-underline"
            >
              About
            </Link>
            <Link
              to="/products"
              className="text-white/40 hover:text-brand transition-colors no-underline"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="text-white/40 hover:text-brand transition-colors no-underline"
            >
              Cart
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
