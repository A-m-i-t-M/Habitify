import { useEffect, useState } from 'react';
import {FaCrown} from 'react-icons/fa'
import SideBar from '../components/SideBar';
import { API_CALL_PREFIX } from '../../config.js';
export default function Leaderboard() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log(loading, error);
    const token = localStorage.getItem("token");
    useEffect(()=>{
        const getFriendsProgress = async()=>{
            setLoading(true);
            try {
                const res = await fetch(`${API_CALL_PREFIX}/backend/goals/friends-progress`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
                const data = await res.json();
                if(!res.ok){
                    setError(data.message);
                    return;
                }
                setFriends(data.friends);
            } catch (error) {
                setError(error.message);
            } finally{
                setLoading(false);
            }
        };
        getFriendsProgress();
    },[]);
    const sortedFriends = [...friends].sort((a, b) => b.completedGoals - a.completedGoals);
    console.log(sortedFriends);
    console.log(friends);
    
    

    const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
    };

return (
    <div className="flex min-h-screen bg-bg text-text-primary font-serif">
      <SideBar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold text-primary mb-8 text-center flex items-center justify-center gap-3">
            <FaCrown className="text-accent" size={28}/>Daily Leaderboard
            </h1>
            {loading && <p className="text-center text-text-muted py-6">Loading leaderboard...</p>}
            {error && <p className="text-center text-red-500 py-6">Error: {error}</p>}
            {!loading && !error && sortedFriends.length === 0 && (
                <p className="text-center text-text-muted py-10">Leaderboard is empty or data is still loading.</p>
            )}
            {!loading && !error && sortedFriends.map((friend, index) => (
            <div key={friend.friendId} className="flex items-center bg-bg border border-secondary rounded-xl p-4 shadow-md mb-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 w-full">
                <span className={`text-xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-yellow-600' : 'text-text-muted'}`}> 
                    {getRankBadge(index)} 
                </span>
                <img src={friend.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow-sm"/>
                <div className="flex-1">
                    <p className="font-semibold text-text-primary text-lg">{friend.username}</p>
                    <p className="text-sm text-text-muted mt-0.5">
                         <span className="text-accent font-bold"> {friend.completedGoals} </span> / <span className="text-text-muted"> {friend.totalGoals} goals</span>
                    </p>
                    <div className="w-full bg-primary/20 rounded-full h-2.5 mt-2 shadow-inner">
                    <div
                        className="bg-secondary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${friend.totalGoals > 0 ? (friend.completedGoals / friend.totalGoals) * 100 : 0}%`,}}>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}