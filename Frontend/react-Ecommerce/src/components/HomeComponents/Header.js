import React, { useState } from "react";
import { Carousel } from "antd";

function Header() {
  const [current, setCurrent] = useState(0);

  // Array of image paths
  const slides = [
    "/Carousel1.png",
    "/Carousel2.png",
    "/Carousel3.png",
    "/Carousel4.png",
  ];

  const contentStyle = {
    height: "500px",
    width: "100%",
    textAlign: "center",
    overflow: "hidden",
  };

  const imgStyle = {
    width: "100%",
    height: "500px",
    objectFit: "cover",
  };

  return (
    <>
      <Carousel
        autoplay
        dots={false} // hide default dots
        beforeChange={(from, to) => setCurrent(to)}
        autoplaySpeed={3000}
      >
        {slides.map((slide, index) => (
          <div key={index} style={contentStyle}>
            <img src={slide} alt={`Slide ${index + 1}`} style={imgStyle} />
          </div>
        ))}
      </Carousel>

      {/* Custom Progress Dots */}
      <div style={dotsContainer}>
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              ...dotStyle,
              background: index === current ? "#4B0082" : "#ccc",
              width: index === current ? "30px" : "10px",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </>
  );
}

const dotsContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  marginTop: "10px",
};

const dotStyle = {
  height: "10px",
  borderRadius: "5px",
};

export default Header;

