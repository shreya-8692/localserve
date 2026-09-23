import { useState } from "react";
import "./ReviewModel.css";

function ReviewModel({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    onSubmit({
      bookingId: booking?._id,
      rating,
      review,
    });
  };

  return (
    <div className="review-overlay">
      <div className="review-modal">

        <button
          className="review-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="review-header">
          <span>⭐</span>
          <h2>Rate your experience</h2>
          <p>
            How was your experience with this service?
          </p>
        </div>

        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${
                rating >= star ? "selected" : ""
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          <label>Write a review</label>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience..."
            rows="5"
          />

          <div className="review-actions">
            <button
              type="button"
              className="cancel-review"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-review"
            >
              Submit Review
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReviewModel;