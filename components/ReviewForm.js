import { useState } from "react";

function StarInput({ rating, onChange }) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`select-none text-3xl transition-colors duration-200 ${
            star <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
          aria-label={`${star} Star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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

  return (
    <form onSubmit={handleReviewSubmit} className="space-y-4">
     <h3 className="text-2xl font-bold text-white border-b border-cyan-200/10 pb-4 mb-6">
    Add a Review
  </h3>
      <StarInput
        rating={reviewData.rating}
        onChange={(rating) => setReviewData((currentValue) => ({ ...currentValue, rating }))}
      />
      <input
        type="text"
        placeholder="Your Name"
        value={reviewData.customerName}
        onChange={(e) =>
          setReviewData({ ...reviewData, customerName: e.target.value })
        }
        className="theme-input w-full p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Review Title"
        value={reviewData.title}
        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
        className="theme-input w-full p-2 rounded"
        required
      />
      <textarea
        placeholder="Write your review here..."
        value={reviewData.text}
        onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
        className="theme-input w-full p-2 rounded min-h-32"
        required
      />

      {feedback.message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          feedback.type === "success"
            ? "border border-emerald-200/30 bg-emerald-200/10 text-emerald-100"
            : "border border-red-200/30 bg-red-200/10 text-red-100"
        }`}>
          {feedback.message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-4 py-2 px-4 rounded-full ${
          isSubmitting
            ? "bg-white/10 text-cyan-100/45 cursor-not-allowed"
            : "theme-button-accent"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
