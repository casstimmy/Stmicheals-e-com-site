import { useState } from "react";

export default function ReviewForm({ productId, onSubmitted }) {
  const [reviewData, setReviewData] = useState({
    title: "",
    text: "",
    rating: 0,
    customerName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewData.rating) {
      setFeedback({ type: "error", message: "Please choose a rating before submitting." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await fetch(`/api/product/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit review");
      }

      setFeedback({ type: "success", message: "Review submitted successfully." });
      setReviewData({
        title: "",
        text: "",
        rating: 0,
        customerName: "",
      });
      onSubmitted?.(payload.review);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to submit review.",
      });
    } finally {
      setIsSubmitting(false);
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

      {feedback.message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          feedback.type === "success"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-700"
        }`}>
          {feedback.message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-4 py-2 px-4 rounded-full ${
          isSubmitting
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
