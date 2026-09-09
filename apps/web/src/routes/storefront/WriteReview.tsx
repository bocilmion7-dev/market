import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateReview } from '@/features/reviews/hooks';

export default function WriteReview() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    createReview.mutate({ productId: productId!, rating, comment }, {
      onSuccess: () => navigate(-1),
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>

      <div className="bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full border px-3 py-2 h-24"
          />
        </div>

        <button onClick={handleSubmit} disabled={createReview.isPending} className="w-full bg-brand-accent text-white py-2 disabled:opacity-50">
          {createReview.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
