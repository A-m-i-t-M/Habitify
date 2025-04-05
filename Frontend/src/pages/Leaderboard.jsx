import React, { useEffect, useState } from 'react';
import {FaCrown} from 'react-icons/fa'

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
    <div className="p-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
        <FaCrown className="text-yellow-400" />
        Leaderboard
        </h1>

        {/* {sortedFriends.map((friend, index) => (
        <div
            key={friend.friendId}
            className="flex items-center justify-between bg-gray-100 rounded-xl p-3 shadow-sm mb-3"
        >
            <div className="flex items-center gap-3">
            <span className="text-xl w-6 text-center">
                {getRankBadge(index)}
            </span>
            <img
                src={friend.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
                <p className="font-semibold">{friend.username}</p>
                <p className="text-sm text-gray-500">
                {friend.completedGoals}/{friend.totalGoals} goals
                </p>
            </div>
            </div>
            <span className="text-indigo-600 font-bold text-lg">
            {friend.completedGoals}
            </span>
        </div>
        ))} */}

        {sortedFriends.map((friend, index) => (
        <div
            key={friend.friendId}
            className="flex items-center justify-between bg-gray-100 rounded-xl p-3 shadow-sm mb-3"
        >
            <div className="flex items-center gap-3">
            <span className="text-xl w-6 text-center">
                {getRankBadge(index)}
            </span>
            <img
                src={friend.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
                <p className="font-semibold">{friend.username}</p>
                <p className="text-sm text-gray-500">
                <span className="text-green-600 font-bold">
                    {friend.completedGoals}
                </span>
                /
                <span className="text-gray-600">
                    {friend.totalGoals} goals
                </span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                    width: `${friend.totalGoals > 0
                        ? (friend.completedGoals / friend.totalGoals) * 100
                        : 0}%`,
                    }}
                ></div>
                </div>
            </div>
            </div>
            <span className="text-indigo-600 font-bold text-lg">
            {friend.completedGoals}
            </span>
        </div>
        ))}
    </div>
    );
}