import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Vote, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function PollPage({ user }) {
  const [activePoll, setActivePoll] = useState(null);
  const [votedOptionId, setVotedOptionId] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [votedLocalOption, setVotedLocalOption] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchActivePoll();
  }, [user]);

  const fetchActivePoll = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${apiBase}/api/polls/active`);
      const poll = res.data;
      setActivePoll(poll);

      if (poll && user) {
        const userVote = poll.votedUsers.find(vu => {
          const vuUserId = (vu.user?._id || vu.user || vu || '').toString();
          return vuUserId === user._id.toString();
        });
        if (userVote) {
          setHasVoted(true);
          const votedOpt = poll.options.find(o => o._id.toString() === userVote.optionId?.toString() || o._id.toString() === userVote.toString());
          if (votedOpt) {
            setVotedLocalOption(votedOpt.optionText);
            setVotedOptionId(votedOpt._id);
          }
        } else {
          // Fallback local storage check (user-specific)
          const localVote = localStorage.getItem(`sattvicbites_voted_${user._id}_${poll._id}`);
          if (localVote) {
            setHasVoted(true);
            setVotedLocalOption(localVote);
            const votedOpt = poll.options.find(o => o.optionText === localVote);
            if (votedOpt) {
              setVotedOptionId(votedOpt._id);
            }
          }
        }
      }

    } catch (err) {
      console.error('Error fetching active poll:', err);
      setErrorMsg('Failed to sync active community poll data.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!votedOptionId) return;
    if (!user) {
      setErrorMsg('Please register or log in to submit a vote in community polls.');
      return;
    }

    setVoteLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.post(`${apiBase}/api/polls/vote`, {
        optionId: votedOptionId
      }, config);

      setSuccessMsg('Your vote has been successfully registered!');
      setActivePoll(res.data);
      setHasVoted(true);
      
      const chosenText = res.data.options.find(o => o._id === votedOptionId)?.optionText || '';
      setVotedLocalOption(chosenText);
      if (user) {
        localStorage.setItem(`sattvicbites_voted_${user._id}_${res.data._id}`, chosenText);
      }

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while submitting your vote.');
    } finally {
      setVoteLoading(false);
    }
  };

  const getPercent = (optionVotes) => {
    if (!activePoll) return 0;
    const total = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);
    if (total === 0) return 0;
    return Math.round((optionVotes / total) * 100);
  };

  const totalVotes = activePoll 
    ? activePoll.options.reduce((acc, curr) => acc + curr.votes, 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-transparent text-brandNavy p-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
          <span className="text-[100px]">🗳️</span>
        </div>
        <div>
          <span className="bg-brandSaffron/20 border border-brandSaffron/35 text-brandNavy text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block shadow-sm">
            SattvicBites Community Choice
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit text-brandNavy">
            Active Community Polls
          </h1>
          <p className="text-brandNavy/70 text-xs sm:text-sm mt-1">
            Let the kitchen staff know your preferences! We update our active poll based on seasonal ingredients, sweet preferences, and accompaniment swaps.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandOchre-dark p-4 rounded-xl border border-brandOchre border-opacity-20 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#e9f3f8] text-brandNavy p-4 rounded-xl border border-brandSaffron/30 border-opacity-35 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="text-brandSage shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-brandNavy/70 text-sm">
          Searching for active community polls...
        </div>
      ) : !activePoll ? (
        <div className="glass-card rounded-2xl p-12 text-center text-brandNavy/60 font-semibold text-sm">
          🗳️ There are no active polls at the moment. Please check back later!
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#e6d480]/20 pb-4">
            <h2 className="font-outfit font-extrabold text-brandNavy text-lg sm:text-xl flex items-center gap-2">
              <Vote className="text-brandGreen" size={24} /> {activePoll.question}
            </h2>
            <span className="text-[10px] text-brandGreen font-bold bg-[#f0f5f8] px-2 py-0.5 rounded uppercase tracking-wider">
              Active
            </span>
          </div>

          {hasVoted ? (
            // Results Display
            <div className="space-y-4">
              <div className="p-3 bg-[#fdfbf4]/40 border border-[#e6d480]/30 text-brandNavy rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>Thank you for voting! Your feedback has been registered.</span>
              </div>

              <div className="space-y-4 pt-2">
                {activePoll.options.map((opt) => {
                  const pct = getPercent(opt.votes);
                  const isVoted = votedLocalOption === opt.optionText;

                  return (
                    <div key={opt._id} className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm font-bold text-brandNavy/95">
                        <span className="flex items-center gap-1">
                          {opt.optionText}
                          {isVoted && <span className="text-brandGreen text-[10px] font-black uppercase tracking-wider">(Your Choice)</span>}
                        </span>
                        <span>{pct}% ({opt.votes} votes)</span>
                      </div>
                      <div className="w-full bg-[#fdfbf4]/80 h-3 rounded-full overflow-hidden border border-[#e6d480]/40">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isVoted ? 'bg-brandGreen' : 'bg-[#e6d480]'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-[#e6d480]/20 gap-3">
                <button
                  type="button"
                  onClick={() => setHasVoted(false)}
                  className="bg-white hover:bg-[#fdfbf4]/40 text-brandNavy/80 border border-[#e6d480]/40 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all w-full sm:w-auto text-center"
                >
                  🔄 Change Vote Choice
                </button>
                <span className="text-[10px] text-brandNavy/60 font-bold uppercase tracking-wider text-right sm:text-left">
                  Total Registered Votes: {totalVotes}
                </span>
              </div>
            </div>
          ) : (
            // Voting Form
            <form onSubmit={handleVoteSubmit} className="space-y-6">
              <div className="space-y-3">
                {activePoll.options.map((opt) => (
                  <label 
                    key={opt._id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      votedOptionId === opt._id 
                        ? 'border-emerald-800 bg-[#fdfbf4]/80 text-emerald-950 font-bold' 
                        : 'border-[#e6d480]/30 bg-[#fdfbf4]/40 text-brandNavy/95 hover:bg-[#fdfbf4]/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="pollOption"
                        value={opt._id}
                        checked={votedOptionId === opt._id}
                        onChange={() => setVotedOptionId(opt._id)}
                        className="w-4 h-4 text-brandGreen focus:ring-brandGreen accent-brandGreen"
                      />
                      <span className="text-xs sm:text-sm font-bold">{opt.optionText}</span>
                    </div>
                  </label>
                ))}
              </div>

              {user ? (
                <button
                  type="submit"
                  disabled={!votedOptionId || voteLoading}
                  className="w-full bg-brandGreen hover:bg-[#556f7c] text-white py-3 rounded-xl font-bold font-outfit text-sm shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voteLoading ? 'Registering Vote...' : 'Submit Vote Choice'}
                </button>
              ) : (
                <div className="text-center py-4 border border-dashed border-[#e6d480]/40 rounded-xl bg-[#fdfbf4]/40">
                  <p className="text-xs text-brandNavy/60 mb-2 font-semibold">Please log in to submit your vote.</p>
                  <Link
                    to="/login"
                    className="text-brandGreen hover:underline text-xs font-bold"
                  >
                    Log In Here &rarr;
                  </Link>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
