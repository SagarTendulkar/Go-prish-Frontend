const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 text-center bg-gradient from-primary/10 to-accent/10">
        <h1 className="text-4xl font-extrabold text-primary mb-4">
          About Go Prish
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          We’re a team passionate about creating efficient, eco-friendly digital
          solutions that simplify business operations and promote
          sustainability.
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Our Mission",
            text: "To deliver modern and sustainable tech solutions that empower businesses to grow efficiently.",
            icon: "🌍",
          },
          {
            title: "Our Vision",
            text: "To be a leader in clean, scalable, and user-friendly software ecosystems.",
            icon: "🚀",
          },
          {
            title: "Our Values",
            text: "Innovation, sustainability, and user satisfaction are at the heart of everything we do.",
            icon: "💡",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow duration-300"
          >
            <div className="text-5xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.text}</p>
          </div>
        ))}
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-secondary/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-accent mb-6">
            Why Choose Go Prish?
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-8">
            We combine technical excellence with a focus on sustainability,
            ensuring our solutions not only perform well but also reduce
            environmental impact.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Sustainable Development",
              "Scalable Architecture",
              "User-Centric Design",
              "Reliable Support",
              "Cutting-edge Technology",
              "Continuous Improvement",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-sm border border-border hover:bg-primary/5 transition-all"
              >
                <p className="font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
