import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_CARDS = [
  {
    name: "Tops",
    description: "Everyday essentials and statement silhouettes.",
    image: "/images/top1.jpg",
  },
  {
    name: "Bottoms",
    description: "Denim, trousers, skirts, and modern tailoring.",
    image: "/images/bottom.jpg",
  },
  {
    name: "Dresses",
    description: "From minimal fits to elevated evening looks.",
    image: "/images/dress.jpg",
  },
  {
    name: "Shoes",
    description: "Finish every outfit with the right pair.",
    image: "/images/shoe.jpg",
  },
  {
    name: "Accessories",
    description: "Small details that complete the full vibe.",
    image: "/images/bag.jpg",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const categoryCarouselRef = useRef(null);

  const heroPhotos = [
    { src: "/images/citywearaes.jpg", alt: "Monochrome trench look" },
    { src: "/images/beachaes.jpg", alt: "Soft neutral knit outfit" },
    { src: "/images/workae.jpg", alt: "Streetwear denim layer" },
    { src: "/images/dateaes.jpg", alt: "Minimal evening set" },
    { src: "/images/streetaes.jpg", alt: "Monochrome trench look" },
  ];

  const scrollCategories = (direction) => {
    const carousel = categoryCarouselRef.current;
    if (!carousel) return;

    const scrollAmount = Math.round(carousel.clientWidth * 0.75);
    carousel.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-latte min-h-screen overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24 grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-16 items-center">
        <div className="animate-fade-up">
          <p className="font-milano text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.14em] text-cocoa mb-3">
            Digital Wardrobe
          </p>
          <p className="text-sm md:text-base text-cocoa/80 mb-4">
            Where Outfits Come Together.
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-cocoa leading-tight mb-6">
            Curate your
            <br />
            digital wardrobe
          </h1>

          <p className="text-cocoa/90 max-w-xl leading-relaxed mb-10">
            Discover thoughtfully curated outfits designed for modern lifestyles.
            Build your personal wardrobe, explore different aesthetics, and shop
            pieces that reflect your individuality.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => navigate("/shop")}
              className="bg-mocha text-latte px-8 py-3 rounded-md text-sm hover:opacity-90 transition hover:-translate-y-0.5"
            >
              Shop Collection
            </button>

            <button
              onClick={() => navigate("/about")}
              className="border border-mocha text-mocha px-8 py-3 rounded-md text-sm hover:bg-mocha hover:text-latte transition hover:-translate-y-0.5"
            >
              Learn More
            </button>
          </div>

        </div>

        {/* HERO IMAGE MOSAIC */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 animate-fade-in">
          {heroPhotos.map((photo, index) => (
            <article
              key={photo.src}
              className={`relative rounded-3xl overflow-hidden shadow-sm bg-beige animate-rise ${
                index === 0 ? "col-span-2 h-[300px] md:h-[360px]" : "h-52 md:h-64"
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 lg:px-16 pb-12 md:pb-16">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cocoa/60 mb-2">
              Browse by Category
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-cocoa">
              Find your style lane
            </h2>
          </div>

          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={() => scrollCategories("prev")}
              className="h-10 w-10 rounded-full border border-cocoa/25 text-cocoa hover:bg-cocoa/10 transition"
              aria-label="Previous categories"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("next")}
              className="h-10 w-10 rounded-full border border-cocoa/25 text-cocoa hover:bg-cocoa/10 transition"
              aria-label="Next categories"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={categoryCarouselRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none]"
        >
          {CATEGORY_CARDS.map((category) => (
            <article
              key={category.name}
              className="min-w-[82%] md:min-w-[42%] xl:min-w-[30%] rounded-2xl overflow-hidden bg-beige shadow-sm snap-start"
            >
              <div className="h-52 overflow-hidden bg-latte">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-serif text-cocoa">{category.name}</h3>
                <p className="text-cocoa/80 text-sm mt-2 mb-4">{category.description}</p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/shop?category=${encodeURIComponent(category.name)}`)
                  }
                  className="rounded-md bg-mocha text-latte px-4 py-2 text-sm hover:opacity-90 transition"
                >
                  Explore {category.name}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 lg:px-16 pb-16 md:pb-20">
        <div className="rounded-3xl bg-beige p-8 md:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center animate-fade-up">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cocoa/60 mb-3">
              New Feature
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-cocoa mb-4">
              Build your outfit before you buy
            </h2>
            <p className="text-cocoa/85 mb-6 max-w-2xl">
              Try the Outfit Builder in Shop to drag product images into Top,
              Bottom, Dress, Outerwear, Accessories, and Shoes slots. Mix
              pieces, preview full looks, and add single items or the full
              outfit to cart.
            </p>
            <button
              type="button"
              onClick={() => navigate("/shop?builder=1")}
              className="bg-mocha text-latte px-7 py-3 rounded-md text-sm hover:opacity-90 transition"
            >
              Try Outfit Builder
            </button>
          </div>

          <div className="h-[320px] rounded-2xl overflow-hidden border border-cocoa/15 bg-latte shadow-sm">
            <img
              src="/images/beahc.jpg"
              alt="Outfit builder preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
