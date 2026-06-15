import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, AlertTriangle, ShieldAlert, Award } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ReviewsPage({ user }) {
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/feedback`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditReview = (rev) => {
    setEditingReviewId(rev._id);
    setEditingComment(rev.comment);
    setEditingRating(rev.rating);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingComment('');
    setEditingRating(5);
  };

  const handleUpdateReview = async (e, id) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedbackSuccess('');
    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`${apiBase}/api/feedback/${id}`, {
        rating: editingRating,
        comment: editingComment
      }, config);

      setFeedbackSuccess('Review successfully updated!');
      setEditingReviewId(null);
      fetchReviews();
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update review.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setErrorMsg('');
    setFeedbackSuccess('');
    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`${apiBase}/api/feedback/${id}`, config);

      setFeedbackSuccess('Review deleted successfully.');
      fetchReviews();
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSuccess('');
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please register or log in to submit a rating review.');
      return;
    }

    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(`${apiBase}/api/feedback`, {
        rating: userRating,
        comment: userComment
      }, config);

      setFeedbackSuccess('Thank you for rating our meals! Your voice helps us stay pure.');
      setUserComment('');
      setUserRating(5);
      fetchReviews();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Banner */}
      <div className="bg-transparent text-brandNavy p-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
          <span className="text-[120px]">⭐</span>
        </div>
        <div className="max-w-2xl space-y-3">
          <span className="bg-brandSaffron/20 border border-brandSaffron/35 text-brandNavy text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block shadow-sm">
            Customer Testimonials
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-brandNavy">
            Wholesome Feedback & Reviews
          </h1>
          <p className="text-brandNavy/70 text-xs sm:text-sm">
            Read what our geofenced clients in Vallabh Vidyanagar and Karamsad think about our pure and Customized service.
          </p>
        </div>
      </div>

      {/* Aggregate Rating Banner */}
      <div className="glass-card rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-[#faf8e7] p-4 rounded-full flex items-center justify-center border border-[#e6d480] border-opacity-30">
            <Award className="text-brandSaffron" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brandNavy font-outfit">SattvicBites Satisfaction Rating</h2>
            <p className="text-brandNavy/60 text-xs font-semibold">Calculated from all registered user submissions</p>
          </div>
        </div>
        
        <div className="text-center sm:text-right">
          <span className="text-4xl font-black text-brandNavy block sm:inline-block mr-2 font-outfit">{averageRating} / 5.0</span>
          <div className="inline-flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="block text-[11px] text-brandNavy/60 mt-1">Based on {reviews.length} customer reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Testimonials list */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="font-outfit font-extrabold text-brandNavy text-lg flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <MessageSquare className="text-brandGreen" size={20} /> Client Testimony Log
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {loading && reviews.length === 0 ? (
              <p className="text-xs text-brandNavy/60 italic">Syncing reviews data from kitchen database...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-brandNavy/60 italic">No feedback submissions registered yet. Be the first to share your experience!</p>
            ) : (
              reviews.map((rev) => {
                const isOwner = user && rev.user && (String(user._id) === String(rev.user._id) || String(user._id) === String(rev.user));
                const isEditing = editingReviewId === rev._id;

                return (
                  <div key={rev._id} className="bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30 text-xs sm:text-sm transition-all hover:border-brandGreen">
                    {isEditing ? (
                      <form onSubmit={(e) => handleUpdateReview(e, rev._id)} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brandNavy">Edit Your Review</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                type="button"
                                onClick={() => setEditingRating(stars)}
                                className="text-amber-400 focus:outline-none"
                              >
                                <Star size={18} fill={editingRating >= stars ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          required
                          rows="3"
                          value={editingComment}
                          onChange={(e) => setEditingComment(e.target.value)}
                          className="w-full bg-[#fdfbf4]/80 border border-[#e6d480]/30 rounded-lg p-2 text-xs text-brandNavy outline-none focus:ring-1 focus:ring-brandGreen resize-none font-medium text-brandNavy"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditReview}
                            className="bg-[#ecdba2] hover:bg-[#e6d480] text-brandNavy/95 px-3 py-1 rounded text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-brandGreen hover:bg-[#556f7c] text-white px-3 py-1 rounded text-xs font-bold"
                          >
                            Save Change
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-extrabold text-brandNavy block text-xs sm:text-sm">{rev.user?.name || 'Anonymous Client'}</span>
                            <span className="text-[10px] text-brandNavy/60 font-semibold">{rev.user?.city || 'Verified User'}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        <p className="text-brandNavy/80 italic leading-relaxed">"{rev.comment}"</p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e6d480]/20">
                          <div>
                            {isOwner && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditReview(rev)}
                                  className="text-brandGreen hover:underline text-[10px] font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="text-red-600 hover:underline text-[10px] font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-brandNavy/60">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Submit review */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="font-outfit font-extrabold text-brandNavy text-lg mb-4 flex items-center gap-1.5">
            <span>💬</span> Share Your Experience
          </h2>

          {feedbackSuccess && (
            <div className="bg-[#e9f3f8] text-brandNavy border border-brandSaffron/30 border-opacity-35 p-4 rounded-xl text-xs font-semibold mb-4">
              {feedbackSuccess}
            </div>
          )}

          {errorMsg && (
            <div className="bg-brandOchre bg-opacity-10 text-brandOchre-dark p-4 rounded-xl border border-brandOchre border-opacity-20 text-xs font-semibold mb-4 flex gap-1.5 items-start">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Rating Scale</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setUserRating(stars)}
                      className="text-amber-400 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        fill={userRating >= stars ? 'currentColor' : 'none'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Feedback Statement</label>
                <textarea
                  required
                  rows="4"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Tell us about the softness of the rotis, spice balance, vegetable freshness, or overall delivery experience..."
                  className="w-full bg-[#fdfbf4]/70 border border-[#e6d480]/35 rounded-xl p-3 text-xs sm:text-sm text-brandNavy focus:ring-1 focus:ring-brandGreen outline-none resize-none font-medium placeholder-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brandGreen hover:bg-[#556f7c] text-white py-3 rounded-xl font-bold font-outfit shadow-sm transition-colors text-sm"
              >
                Post Customer Review
              </button>
            </form>
          ) : (
            <div className="text-center py-8 border border-dashed border-[#e6d480]/40 rounded-xl bg-[#fdfbf4]/40">
              <p className="text-xs text-brandNavy/60 mb-3 font-semibold">Please log in to submit your feedback.</p>
              <Link
                to="/login"
                className="bg-brandGreen hover:bg-[#556f7c] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm inline-block"
              >
                Log In Here
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
