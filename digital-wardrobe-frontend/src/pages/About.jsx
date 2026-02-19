export default function About() {
  return (
    <div className="bg-latte min-h-screen px-12 py-20">
      <div className="max-w-5xl">
        <h1 className="text-4xl font-serif text-cocoa mb-6">
          About Digital Wardrobe
        </h1>

        <p className="text-cocoa leading-relaxed mb-10">
          Digital Wardrobe is a modern e-commerce platform designed to simplify
          the way individuals explore, organize, and purchase fashion. The
          platform combines thoughtful design with functional technology to
          deliver a seamless and intuitive shopping experience.
        </p>

        <div className="space-y-12">
          {/* Vision */}
          <section>
            <h2 className="text-2xl font-serif text-cocoa mb-3">
              Our Vision
            </h2>
            <p className="text-cocoa leading-relaxed">
              Our vision is to create a centralized digital space where users
              can curate their personal style effortlessly. By focusing on
              usability, clean design, and efficient technology, Digital
              Wardrobe aims to bridge the gap between fashion discovery and
              practical online shopping.
            </p>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-2xl font-serif text-cocoa mb-3">
              What We Offer
            </h2>
            <ul className="list-disc pl-6 text-cocoa space-y-2">
              <li>Curated collections of contemporary fashion items</li>
              <li>
                An interactive Outfit Builder in the Shop page to mix and match
                tops, bottoms, dresses, accessories, outerwear, and shoes
              </li>
              <li>Secure user authentication and personalized accounts</li>
              <li>Seamless cart and checkout functionality</li>
              <li>Admin-managed inventory and product control</li>
            </ul>
          </section>

          {/* Outfit Builder */}
          <section>
            <h2 className="text-2xl font-serif text-cocoa mb-3">
              Outfit Builder
            </h2>
            <p className="text-cocoa leading-relaxed">
              The Outfit Builder lets users drag product images directly from
              the Shop grid into outfit sections and preview combinations before
              buying. Users can build looks with either top + bottom or a dress,
              layer outerwear and accessories, add shoes, and then add single
              pieces or the entire outfit to cart in one step.
            </p>
          </section>

          {/* Technology */}
          <section>
            <h2 className="text-2xl font-serif text-cocoa mb-3">
              Technology
            </h2>
            <p className="text-cocoa leading-relaxed">
              Digital Wardrobe is built using modern web technologies including
              React for the frontend, Node.js and Express for the backend, and
              MongoDB for database management. These technologies ensure the
              platform remains scalable, maintainable, and performant.
            </p>
          </section>

          {/* Author & Contact */}
          <section>
            <h2 className="text-2xl font-serif text-cocoa mb-3">
              Author & Contact
            </h2>
            <ul className="text-cocoa space-y-2">
              <li><span className="font-medium">Author:</span> adrika saxena</li>
              <li><span className="font-medium">Phone:</span> +91 8287383767</li>
              <li><span className="font-medium">Email:</span> adrikasaxenaaa@gmail.com</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
