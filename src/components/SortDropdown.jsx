const SortDropdown = ({ sortBy, setSortBy }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring focus:ring-primary/30"
      >
        <option value="trending">Trending</option>
        <option value="newest">New Arrivals</option>
        <option value="lowToHigh">Price: Low to High</option>
        <option value="highToLow">Price: High to Low</option>
      </select>
    </div>
  );
};

export default SortDropdown;
