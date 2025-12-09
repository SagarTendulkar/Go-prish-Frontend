import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useEffect, useState } from "react";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
  };

  const images = [
    "https://res.cloudinary.com/dpj6hc8uk/image/upload/v1765263261/obzhne8edeyksjg0shvb.jpg",
    "https://www.shutterstock.com/image-photo/clothes-store-shopping-mall-600nw-2492349933.jpg",
    "https://www.shutterstock.com/image-photo/some-used-clothes-hanging-on-260nw-1055308604.jpg",
  ];

  const categories = [
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

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axiosInstance.get("/products/featured");
        setFeaturedProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-light font-sans text-dark">
      {/* 🌸 Hero Slider */}
      <div className="max-w-7xl mx-auto p-4">
        <Slider {...settings}>
          {images.map((img, idx) => (
            <div key={idx}>
              <img
                src={img}
                alt={`Banner ${idx + 1}`}
                className="w-full h-[50vh] sm:h-[65vh] object-cover rounded-2xl shadow-card"
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* 💕 Welcome Text */}
      <section className="text-center py-12 px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-primary mb-4">
          Effortless Style, Everyday
        </h1>
        <p className="text-dark/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          To feel good, all you have to do is look good. Experience the gentle
          luxury of cotton — Go With GoPrish.
        </p>
        <Link to="/products">
          <button className="mt-8 px-6 sm:px-8 py-3 bg-primary text-light rounded-2xl font-medium text-base sm:text-lg hover:bg-accent hover:text-dark shadow-soft transition-all duration-300">
            Shop Now
          </button>
        </Link>
      </section>

      {/* 🛍️ Featured Collections */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-primary mb-8 sm:mb-10">
            Handpicked Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="relative group overflow-hidden rounded-2xl shadow-card"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-dark/30 flex items-center justify-center">
                  <h3 className="text-light text-lg sm:text-xl font-semibold tracking-wide">
                    {cat.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 👗 Featured / Trending Products */}
      <section className="py-16 bg-light">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-primary mb-10">
            Trending Now
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {Array(4)
                .fill()
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-60 bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-gray-500">No featured products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((prod) => (
                <Link
                  to={`/products/${prod._id}`}
                  key={prod._id}
                  className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 p-3 hover:-translate-y-1"
                >
                  <img
                    src={prod.thumbnailImage}
                    alt={prod.name}
                    className="w-full h-48 sm:h-56 object-cover rounded-xl mb-3"
                  />
                  <h3 className="text-sm sm:text-base font-semibold text-dark line-clamp-2">
                    {prod.name}
                  </h3>
                  <p className="text-primary font-medium mt-1 text-sm sm:text-base">
                    ₹{prod.basePrice}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <Link to="/products">
            <button className="mt-10 px-6 py-3 bg-primary text-light rounded-xl font-medium hover:bg-accent hover:text-dark transition-all">
              View All Products
            </button>
          </Link>
        </div>
      </section>

      {/* 💫 CTA Section */}
      <section className="bg-primary text-light text-center py-14 px-4">
        <h2 className="text-2xl sm:text-3xl font-serif mb-3">
          Refresh Your Wardrobe Today
        </h2>
        <p className="max-w-lg mx-auto text-light/90 mb-6 text-sm sm:text-base">
          Discover exclusive styles, handpicked for you. Simple. Elegant.
          Affordable.
        </p>
        <Link to="/products">
          <button className="px-6 sm:px-8 py-3 bg-light text-dark rounded-2xl font-medium hover:bg-accent transition-all text-sm sm:text-base">
            Explore Collection
          </button>
        </Link>
      </section>

      {/* 🌿 Footer */}
      <footer className="bg-dark text-light text-center py-6 text-sm">
        © {new Date().getFullYear()} GoPrish — All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
