// src/components/Skeletons.jsx
import React from "react";

/* =============================
   🧱 1️⃣ Product Grid Skeleton
   ============================= */
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden animate-pulse">
      <div className="absolute top-3 right-3 bg-gray-200 p-3 rounded-full w-8 h-8"></div>

      <div className="w-full h-64 bg-gray-200"></div>

      <div className="p-4 text-center space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>

        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>

        <div className="h-5 bg-gray-200 rounded w-1/4 mx-auto"></div>
      </div>
    </div>
  );
};

/* =============================
   📄 2️⃣ Product Details Skeleton
   ============================= */
export const SkeletonDetails = () => {
  return (
    <div className="animate-pulse grid md:grid-cols-2 gap-10 p-6 mx-40">
      {/* Left Image Placeholder */}
      <div>
        <div className="bg-gray-200 h-[450px] w-full rounded-2xl mb-4"></div>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-200 w-20 h-20 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Right Info Placeholder */}
      <div className="space-y-4">
        <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>

        <div className="space-y-2">
          <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
          <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
        </div>

        <div className="bg-gray-200 h-10 w-1/3 rounded"></div>
        <div className="bg-gray-200 h-10 w-1/3 rounded"></div>

        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-4 w-full rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =============================
   🧺 3️⃣ List Item Skeleton
   ============================= */
export const SkeletonListItem = () => {
  return (
    <div className="animate-pulse flex items-center gap-4 border-b border-gray-200 py-4">
      <div className="bg-gray-200 w-20 h-20 rounded-lg"></div>
      <div className="flex-1 space-y-3">
        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
      </div>
      <div className="bg-gray-200 h-6 w-25 rounded"></div>
    </div>
  );
};
