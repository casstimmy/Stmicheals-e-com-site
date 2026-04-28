import { useState } from "react";

export default function ReviewForm({ productId }) {
  const [reviewData, setReviewData] = useState({
    title: "",
    text: "",
    rating: 0,
    customerName: "",
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`/api/product/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      alert("Review submitted!");
      location.reload();
    } else {
      alert("Failed to submit review");
    }
  };

  // Helper to render stars for input
  const StarInput = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewData({ ...reviewData, rating: star })}
            className={`text-3xl cursor-pointer select-none transition-colors duration-200 ${
              star <= reviewData.rating ? "text-yellow-500" : "text-gray-300"
            }`}
            aria-label={`${star} Star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleReviewSubmit} className="space-y-4">
     <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-4 mb-6">
    Add a Review
  </h3>
      <StarInput />
      <input
        type="text"
        placeholder="Your Name"
        value={reviewData.customerName}
        onChange={(e) =>
          setReviewData({ ...reviewData, customerName: e.target.value })
        }
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Review Title"
        value={reviewData.title}
        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Write your review here..."
        value={reviewData.text}
        onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
      >
        Submit Review
      </button>
    </form>
  );
}
