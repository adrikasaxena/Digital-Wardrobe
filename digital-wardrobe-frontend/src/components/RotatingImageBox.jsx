import { useEffect, useState } from "react";
import "./RotatingImageBox.css";

const images = [
  "/images/look1.jpg",
  "/images/look2.jpg",
  "/images/look3.jpg",
  "/images/look4.jpg",
  "/images/look5.jpg",
  "/images/look6.jpg",
  "/images/look7.jpg",
  "/images/look8.jpg",
];

const directions = ["top", "right", "bottom", "left"];

export default function RotatingImageBox() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [dirIndex, setDirIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);

      setTimeout(() => {
        setCurrent(next);
        setNext((next + 1) % images.length);
        setDirIndex((prev) => (prev + 1) % directions.length);
        setAnimating(false);
      }, 700);
    }, 2600);

    return () => clearInterval(interval);
  }, [next]);

  const direction = directions[dirIndex];

  return (
    <div className="carousel-box">
      {/* CURRENT IMAGE */}
      <img
        src={images[current]}
        className={`carousel-img ${
          animating ? `slide-out-${direction}` : ""
        }`}
        alt="current"
      />

      {/* NEXT IMAGE */}
      <img
        src={images[next]}
        className={`carousel-img ${
          animating ? `slide-in-${direction}` : "hidden"
        }`}
        alt="next"
      />
    </div>
  );
}
