"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// Assets
import downloadable from "@/assets/unlockGoalsAssets/downloadable.jpg";
import affordable from "@/assets/unlockGoalsAssets/affordable.webp";
import moneyBack from "@/assets/unlockGoalsAssets/moneyBack.webp";
import support from "@/assets/unlockGoalsAssets/support.jpg";
import freeUpdate from "@/assets/unlockGoalsAssets/freeUpdate.webp";
import validDumps from "@/assets/unlockGoalsAssets/validDumps.webp";
import freesample from "@/assets/unlockGoalsAssets/freesample.webp";
import specialDiscount from "@/assets/unlockGoalsAssets/specialDiscount.webp";

// Data
const cardData = [
  {
    icon: downloadable,
    title: "Downloadable PDF with Questions & Answers",
    description:
      "The Dumpsxpert provides 100% original and verified updated IT Certification Dumps for all exams.",
  },
  {
    icon: affordable,
    title: "Affordable & Reasonable Price",
    description:
      "You will never have to pay much for these real exam questions. Our prices are very reasonable and affordable.",
  },
  {
    icon: moneyBack,
    title: "100% Money Back Guarantee",
    description:
      "We provide exact IT exam questions & answers at no risk to you. If our resources do not live up to expectations, you can claim a refund.",
  },
  {
    icon: support,
    title: "24/7 Customer Support",
    description:
      "We offer live customer support to make your learning process smooth and effortless. Reach out for any assistance.",
  },
  {
    icon: freeUpdate,
    title: "Free Updates up to 90 Days",
    description:
      "We provide free 90 days of updates on all IT certification exam preparation materials.",
  },
  {
    icon: validDumps,
    title: "100% Valid IT Exam Dumps",
    description:
      "Dumpsxpert provides 100% valid IT exam questions and answers for certification success.",
  },
  {
    icon: freesample,
    title: "Free Sample",
    description:
      "You can try our dumps for free before purchasing. Get a sample to check quality.",
  },
  {
    icon: specialDiscount,
    title: "Special Discount Offer",
    description:
      "Enjoy limited-time discounts on top-selling certification dumps. Don’t miss out!",
  },
];

const WhyChooseSection = () => {
  const rightRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    // Shrink left sticky panel on scroll
    gsap.to(".sticky-left", {
      scrollTrigger: {
        trigger: rightRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
      scale: 0.95,
      transformOrigin: "top center",
    });

    // Animate each card
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  return (
    <div className="flex w-full min-h-screen">
      {/* Sticky Left Panel */}
      <div className="sticky-left md:w-1/2 sticky top-0 h-screen bg-indigo-800 text-white p-10 flex flex-col justify-center items-center transition-all duration-500">
        <h2 className="text-4xl font-bold mb-4 text-center">
          Why Choose DumpsXpert?
        </h2>
        <p className="text-lg text-center text-white/90">
          Unlock your potential with our premium resources. <br />
          Real questions, real results, real support — all designed to help you
          succeed.
        </p>
      </div>

      {/* Scrollable Cards Section */}
      <div ref={rightRef} className="md:w-1/2 bg-white text-black">
        {cardData.map((card, index) => (
          <section
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="min-h-160 flex flex-col items-center justify-center px-6 sm:px-12  text-center"
          >
            <div className="w-32 h-32  rounded-lg overflow-hidden shadow-md">
              <Image
                src={card.icon}
                alt={card.title}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
            <p className="max-w-lg text-gray-700 text-lg">{card.description}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseSection;
import { useState } from "react";
