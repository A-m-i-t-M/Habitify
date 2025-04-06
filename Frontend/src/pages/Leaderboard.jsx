import React, { useEffect, useState } from 'react';
import {FaCrown} from 'react-icons/fa'
import SideBar from '../../components/SideBar';

export default function Leaderboard() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const getFriendsProgress = async()=>{
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
    console.log(sortedFriends);
    console.log(friends);
    
    

    const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
    };

return (
    <div className="flex min-h-screen bg-gray-800">
      <SideBar />
      <div className="p-4 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2 text-white">
          <FaCrown className="text-yellow-400" />Daily Leaderboard
        </h1>
        {sortedFriends.map((friend, index) => (
          <div key={friend.friendId} className="flex items-center justify-between bg-gray-900 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-4 w-full">
              <span className="text-xl w-6 text-center text-green-700"> {getRankBadge(index)} </span>
              <img src={friend.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover"/>
              <div className="flex-1">
                <p className="font-semibold text-white">{friend.username}</p>
                <p className="text-sm text-gray-500"> <span className="text-green-600 font-bold"> {friend.completedGoals} </span>{" "} /{" "} <span className="text-gray-600"> {friend.totalGoals} goals</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${friend.totalGoals > 0 ? (friend.completedGoals / friend.totalGoals) * 100 : 0}%`,}}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}