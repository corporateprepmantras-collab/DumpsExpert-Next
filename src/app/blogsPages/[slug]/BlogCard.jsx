"use client";
import React from "react";
import Link from "next/link";

const BlogCard = ({ title, description, date, imageUrl, slug }) => {
  return (<>
      <div className="bg-gray-100 h-full flex flex-col justify-between rounded-xl shadow-md p-4 hover:shadow-lg transition">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-60 object-cover rounded mb-4"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{date}</p>
          <p className="text-gray-600 mt-2 text-sm line-clamp-3">
            {description}
          </p>
        </div>
        <p className="text-blue-600 mt-4 text-sm font-medium hover:underline">
          Read More →
        </p>
      </div>
      </>
  );
};

export default BlogCard;
