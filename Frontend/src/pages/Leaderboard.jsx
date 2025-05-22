import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SideBar from '../../components/SideBar';

export default function Leaderboard() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const getFriendsProgress = async() => {
            setLoading(true);
            try {
                const res = await fetch("/backend/goals/friends-progress");
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
    
    const getRankBadge = (index) => {
        if (index === 0) return "1";
        if (index === 1) return "2";
        if (index === 2) return "3";
        return `${index + 1}`;
    };

    return (
        <div className="flex min-h-screen bg-black text-white">
            <SideBar />
            <div className="flex-1 px-8 py-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-light tracking-widest uppercase mb-8">Leaderboard</h1>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-center">{error}</p>
                    ) : sortedFriends.length === 0 ? (
                        <p className="text-white/50 text-center">No friends data available.</p>
                    ) : (
                        <div className="space-y-3">
                            {sortedFriends.map((friend, index) => (
                                <motion.div 
                                    key={friend.friendId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`flex items-center p-4 border ${
                                        index === 0 
                                            ? "border-white/30" 
                                            : "border-white/10"
                                    } hover:border-white/30 transition-colors duration-300`}
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 text-sm font-light ${
                                        index === 0 
                                            ? "bg-white text-black" 
                                            : "border border-white/30 text-white"
                                    }`}>
                                        {getRankBadge(index)}
                                    </div>
                                    
                                    <div className="flex items-center flex-1">
                                        {friend.avatar && (
                                            <img 
                                                src={friend.avatar} 
                                                alt={friend.username} 
                                                className="w-10 h-10 rounded-full object-cover border border-white/20 mr-4"
                                            />
                                        )}
                                        
                                        <div className="flex-1">
                                            <p className="font-light">{friend.username}</p>
                                            <div className="flex items-center mt-1">
                                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-white h-full"
                                                        style={{ 
                                                            width: `${friend.totalGoals > 0 
                                                                ? (friend.completedGoals / friend.totalGoals) * 100 
                                                                : 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-white/50 ml-2 whitespace-nowrap">
                                                    {friend.completedGoals} / {friend.totalGoals}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}