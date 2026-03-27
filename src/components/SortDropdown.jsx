import { ChevronDown } from "lucide-react";

const SortDropdown = ({ sortBy, setSortBy }) => {
  return (
    <div className="relative flex items-center gap-2">
      <label className="text-[12px] text-ink-muted whitespace-nowrap hidden sm:block">
        Sort by
      </label>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-[13px] font-medium text-brand-dark bg-white border border-warm/30 rounded-full cursor-pointer outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/10"
        >
          <option value="trending">Trending</option>
          <option value="newest">New Arrivals</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
      </div>
    </div>
  );
};

export default SortDropdown;
