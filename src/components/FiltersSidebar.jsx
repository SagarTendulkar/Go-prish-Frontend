import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FilterSidebar = ({
  products,
  onFilterChange,
  instantApply = true, // 🔹 new prop
  onClose, // 🔹 optional, for mobile drawer
}) => {
  const priceRanges = [
    { label: "0 - 500", min: 0, max: 500 },
    { label: "501 - 1000", min: 501, max: 1000 },
    { label: "1001 - 2000", min: 1001, max: 2000 },
    { label: "2001 - 3000", min: 2001, max: 3000 },
    { label: "3001 - 5000", min: 3001, max: 5000 },
  ];

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // 🟢 Extract colors dynamically
  const colorCounts = {};
  products.forEach((p) =>
    p.variants?.forEach((v) => {
      const code = v.colorCode?.toLowerCase();
      if (code) colorCounts[code] = (colorCounts[code] || 0) + 1;
    })
  );
  const colors = Object.keys(colorCounts);

  // 🟣 Count how many products have each size (not total stock)
  const sizeCounts = {};
  products.forEach((p) => {
    const sizesInProduct = new Set();
    p.variants?.forEach((v) => {
      v.sizes?.forEach((s) => {
        if (s.size && s.countInStock > 0) sizesInProduct.add(s.size);
      });
    });
    sizesInProduct.forEach((size) => {
      sizeCounts[size] = (sizeCounts[size] || 0) + 1;
    });
  });

  const currentFilters = { selectedPrice, selectedSizes, selectedColors };

  // 🔄 Live filters only in desktop mode (instantApply = true)
  useEffect(() => {
    if (instantApply) {
      onFilterChange(currentFilters);
    }
  }, [selectedPrice, selectedSizes, selectedColors, instantApply]);

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAll = () => {
    setSelectedPrice(null);
    setSelectedSizes([]);
    setSelectedColors([]);

    // In mobile "apply" mode, also immediately clear filters in parent
    if (!instantApply) {
      onFilterChange({
        selectedPrice: null,
        selectedSizes: [],
        selectedColors: [],
      });
    }
  };

  const handleApply = () => {
    // Used in mobile drawer mode
    onFilterChange(currentFilters);
    if (onClose) onClose();
  };

  return (
    <div className="w-full lg:w-64 bg-light border rounded-2xl p-4 sm:p-5 shadow-card lg:h-fit lg:sticky lg:top-24">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-dark">Filters</h3>
        <button
          onClick={clearAll}
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Accordions */}
      <Accordion type="multiple" defaultValue={["price", "size", "color"]}>
        {/* Price */}
        <AccordionItem value="price">
          <AccordionTrigger className="font-medium text-dark">
            Price
          </AccordionTrigger>
          <AccordionContent>
            {priceRanges.map((range) => (
              <label
                key={range.label}
                className="flex items-center mb-2 text-sm text-gray-700 hover:text-dark cursor-pointer"
              >
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === range.label}
                  onChange={() => setSelectedPrice(range)}
                  className="mr-2 accent-primary"
                />
                {range.label}
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Size */}
        <AccordionItem value="size">
          <AccordionTrigger className="font-medium text-dark">
            Size
          </AccordionTrigger>
          <AccordionContent>
            {sizeOptions.map((size) => (
              <label
                key={size}
                className="flex justify-between items-center mb-2 text-sm cursor-pointer hover:text-dark"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                    className="mr-2 accent-primary"
                  />
                  {size}
                </div>
                <span className="text-xs text-gray-500">
                  ({sizeCounts[size] || 0})
                </span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Color */}
        <AccordionItem value="color">
          <AccordionTrigger className="font-medium text-dark">
            Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="max-h-36 overflow-y-auto pr-2">
              {colors.length === 0 ? (
                <p className="text-sm text-gray-500">No colors available</p>
              ) : (
                colors.map((color) => (
                  <label
                    key={color}
                    className="flex justify-between items-center mb-2 text-sm cursor-pointer hover:text-dark"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => handleColorToggle(color)}
                        className="accent-primary"
                      />
                      <span
                        className="inline-block w-4 h-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: color }}
                      ></span>
                      <span>{color.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({colorCounts[color]})
                    </span>
                  </label>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 🔵 Mobile drawer: Apply button at bottom */}
      {!instantApply && (
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-light text-sm font-medium hover:bg-accent hover:text-dark transition"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
