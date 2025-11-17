"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Award, Clock } from "lucide-react";

// Register GSAP plugin
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

// Enhanced Data with icons
const cardData = [
  {
    icon: downloadable,
    title: "Downloadable PDF with Questions & Answers",
    description:
      "The Prepmantras provides 100% original and verified updated IT Certification Prep for all exams.",
    badge: "PDF Download",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: affordable,
    title: "Affordable & Reasonable Price",
    description:
      "You will never have to pay much for these real exam questions. Our prices are very reasonable and affordable.",
    badge: "Budget Friendly",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: moneyBack,
    title: "100% Money Back Guarantee",
    description:
      "We provide exact IT exam questions & answers at no risk to you. If our resources do not live up to expectations, you can claim a refund.",
    badge: "Risk Free",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: support,
    title: "24/7 Customer Support",
    description:
      "We offer live customer support to make your learning process smooth and effortless. Reach out for any assistance.",
    badge: "Always Available",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: freeUpdate,
    title: "Free Updates up to 90 Days",
    description:
      "We provide free 90 days of updates on all IT certification exam preparation materials.",
    badge: "90 Days Free",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: validDumps,
    title: "100% Valid IT Exam Prep",
    description:
      "Prepmantras provides 100% valid IT exam questions and answers for certification success.",
    badge: "100% Valid",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: freesample,
    title: "Free Sample",
    description:
      "You can try our Prepmantras for free before purchasing. Get a sample to check quality.",
    badge: "Try Free",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: specialDiscount,
    title: "Special Discount Offer",
    description:
      "Enjoy limited-time discounts on top-selling certification Prep. Don't miss out!",
    badge: "Limited Offer",
    color: "from-yellow-500 to-orange-500",
  },
];

const WhyChooseSection = () => {
  const rightRef = useRef(null);
  const cardRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Desktop animations only
    if (!isMobile && rightRef.current) {
      // Animate sticky shrink
      gsap.to(".sticky-left", {
        scrollTrigger: {
          trigger: rightRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
        scale: 0.9,
        transformOrigin: "top center",
        ease: "none",
      });

      // Animate cards on scroll
      cardRefs.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 100 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            delay: index * 0.1,
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isMobile]);

  // Mobile card animation
  const mobileCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Desktop View */}
      <div className="hidden md:flex md:flex-row w-full min-h-screen">
        {/* Sticky Left Panel */}
        <div className="sticky-left md:w-1/2 md:sticky md:top-0 h-auto md:h-screen bg-gradient-to-br from-indigo-800 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 flex flex-col justify-center items-center transition-all duration-500">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Award className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Why Choose <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Prepmantras?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-lg">
              Unlock your potential with our premium resources.
              <br className="hidden sm:block" />
              <span className="block mt-3">
                Real questions, real results, real support — all designed to
                help you succeed.
              </span>
            </p>

            {/* Quick Stats */}
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-cyan-300" />
                <span className="text-lg">100% Verified Content</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-yellow-300" />
                <span className="text-lg">Instant Access</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-pink-300" />
                <span className="text-lg">24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Cards Section */}
        <div ref={rightRef} className="md:w-1/2 bg-white">
          {cardData.map((card, index) => (
            <motion.section
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="h-screen flex flex-col items-center justify-center px-8 text-center border-b border-gray-100 last:border-b-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative mb-8"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity`}
                ></div>
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div
                  className={`absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r ${card.color} text-white text-xs font-bold rounded-full shadow-lg`}
                >
                  {card.badge}
                </div>
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                {card.title}
              </h3>
              <p className="max-w-2xl text-gray-600 text-base md:text-lg leading-relaxed">
                {card.description}
              </p>

              {/* Decorative line */}
              <div className="mt-8 w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </motion.section>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full bg-gradient-to-b from-white to-gray-100 py-12 px-4">
        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-4 flex justify-center">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <Award className="text-indigo-600" size={28} />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
            Why Choose
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Prepmantras?
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Real questions, real results, real support
          </p>
        </motion.div>

        {/* Mobile Cards Grid */}
        <div className="space-y-6 max-w-2xl mx-auto">
          {cardData.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              variants={mobileCardVariants}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              {/* Card Image */}
              <div
                className={`relative h-48 bg-gradient-to-br ${card.color} overflow-hidden`}
              >
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>

                {/* Badge */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1 bg-gradient-to-r ${card.color} text-white text-xs font-bold rounded-full shadow-lg`}
                >
                  {card.badge}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {card.description}
                </p>

                {/* Read More Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-indigo-600 font-semibold text-sm hover:text-purple-600 transition-colors flex items-center gap-2">
                    Learn More
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 gap-4 max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <div className="text-xs text-gray-600 mt-1">Verified</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-xs text-gray-600 mt-1">Support</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">Free</div>
            <div className="text-xs text-gray-600 mt-1">Updates</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">90 Days</div>
            <div className="text-xs text-gray-600 mt-1">Money Back</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhyChooseSection;
