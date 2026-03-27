import { useEffect, useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";

// ── Reusable accordion section ────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-warm/20 last:border-none">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <span className="text-[12px] font-medium tracking-[1.5px] uppercase text-ink-muted group-hover:text-ink transition-colors">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[400px] pb-4" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const FilterSidebar = ({
  products,
  onFilterChange,
  instantApply = true,
  onClose,
}) => {
  const priceRanges = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 – ₹1000", min: 500, max: 1000 },
    { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
    { label: "₹2000 – ₹3000", min: 2000, max: 3000 },
    { label: "Above ₹3000", min: 3000, max: 99999 },
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // ── Extract colors from products ─────────────────────────
  const colorMap = {};
  products.forEach((p) =>
    p.variants?.forEach((v) => {
      const code = v.colorCode?.toLowerCase();
      if (code) colorMap[code] = (colorMap[code] || 0) + 1;
    }),
  );
  const colors = Object.keys(colorMap);

  // ── Size counts ───────────────────────────────────────────
  const sizeCounts = {};
  products.forEach((p) => {
    const seen = new Set();
    p.variants?.forEach((v) =>
      v.sizes?.forEach((s) => {
        if (s.size && s.countInStock > 0 && !seen.has(s.size)) {
          seen.add(s.size);
          sizeCounts[s.size] = (sizeCounts[s.size] || 0) + 1;
        }
      }),
    );
  });

  // ── Live update (desktop) ─────────────────────────────────
  useEffect(() => {
    if (instantApply) {
      onFilterChange({ selectedPrice, selectedSizes, selectedColors });
    }
  }, [selectedPrice, selectedSizes, selectedColors, instantApply]);

  const handleSizeToggle = (s) =>
    setSelectedSizes((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );
  const handleColorToggle = (c) =>
    setSelectedColors((p) =>
      p.includes(c) ? p.filter((x) => x !== c) : [...p, c],
    );

  const activeCount =
    (selectedPrice ? 1 : 0) + selectedSizes.length + selectedColors.length;

  const clearAll = () => {
    setSelectedPrice(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    if (!instantApply)
      onFilterChange({
        selectedPrice: null,
        selectedSizes: [],
        selectedColors: [],
      });
  };

  const handleApply = () => {
    onFilterChange({ selectedPrice, selectedSizes, selectedColors });
    if (onClose) onClose();
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-warm/20 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-warm/15">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-semibold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] font-medium text-ink-muted hover:text-brand transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      <div className="px-4">
        {/* ── Price ──────────────────────────────────────────── */}
        <FilterSection title="Price">
          <div className="space-y-1">
            {priceRanges.map((range) => {
              const isSelected = selectedPrice?.label === range.label;
              return (
                <button
                  key={range.label}
                  onClick={() => setSelectedPrice(isSelected ? null : range)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150
                    ${
                      isSelected
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-ink-secondary hover:bg-surface-raised"
                    }`}
                >
                  <span>{range.label}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-brand flex items-center justify-center shrink-0">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ── Size ───────────────────────────────────────────── */}
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const isSelected = selectedSizes.includes(size);
              const count = sizeCounts[size] || 0;
              return (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  disabled={count === 0}
                  className={`min-w-11 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all duration-150
                    ${
                      isSelected
                        ? "bg-brand-dark text-white border-brand-dark"
                        : count === 0
                          ? "opacity-30 cursor-not-allowed border-warm/20 text-ink-faint"
                          : "border-warm/30 text-ink-secondary hover:border-brand hover:text-brand"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ── Color ──────────────────────────────────────────── */}
        <FilterSection title="Color">
          {colors.length === 0 ? (
            <p className="text-[12px] text-ink-faint italic">
              No colors available
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => {
                const isSelected = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    title={color.toUpperCase()}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all duration-150 shrink-0
                      ${
                        isSelected
                          ? "border-brand scale-110 shadow-[0_0_0_3px_rgba(201,122,74,0.25)]"
                          : "border-warm/30 hover:scale-110 hover:border-warm"
                      }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-white drop-shadow-sm"
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </FilterSection>
      </div>

      {/* ── Mobile apply button ─────────────────────────────── */}
      {!instantApply && (
        <div className="px-4 py-4 border-t border-warm/15">
          <button
            onClick={handleApply}
            className="w-full py-3 rounded-xl bg-brand-dark text-white text-[13px] font-medium transition-all duration-200 hover:bg-brand hover:shadow-[0_4px_16px_rgba(201,122,74,0.3)]"
          >
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
