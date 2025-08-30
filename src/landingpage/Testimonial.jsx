"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

// Local Images
import heading from "@/assets/landingassets/testimonial.webp";
import group from "@/assets/landingassets/testimonial-group.png";

const testimonials = [
  {
    name: "Yogesh Upadhyay",
    feedback: "This platform changed my life. The support and resources are unmatched.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Priya Sharma",
    feedback: "Highly recommended! The courses are comprehensive and easy to follow.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Amit Verma",
    feedback: "A fantastic learning experience with great community support.",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
  },
];

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const next = () => setCurrent((prev) => (prev + 1) % total);
  const prev = () => setCurrent((prev) => (prev - 1 + total) % total);

  return (
    <section className="py-8 px-4 md:px-12 lg:px-24 bg-white dark:bg-gray-950">
      {/* Heading Image */}
      <div className="flex justify-center mb-8">
        <Image
          src={heading}
          alt="Testimonials"
          className="w-full max-w-xs md:max-w-md object-contain"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE – Now with a Card and Gradient */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl">
          <CardContent className="p-8 space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Students Love Us
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              We believe in providing value and support that goes beyond just education.
              Our testimonials are a reflection of the trust and satisfaction of our learners.
            </p>
          </CardContent>
        </Card>

        {/* RIGHT SIDE – Testimonial Carousel */}
        <div className="relative w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Card className="p-6 shadow-xl border bg-card dark:bg-gray-900 dark:border-gray-700">
                <CardContent className="space-y-4 text-center">
                  <Avatar className="mx-auto h-16 w-16">
                    <AvatarImage
                      src={testimonials[current].image}
                      alt={testimonials[current].name}
                    />
                    <AvatarFallback>
                      {testimonials[current].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <p className="text-lg font-medium mt-4 text-gray-900 dark:text-white">
                    "{testimonials[current].feedback}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    – {testimonials[current].name}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={prev}>
              ← Previous
            </Button>
            <Button variant="outline" onClick={next}>
              Next →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
