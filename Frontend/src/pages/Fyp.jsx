import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-free/css/all.min.css';


export default function Fyp() {
  const currentUser = useSelector(state=> state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHabitsOptions, setShowHabitsOptions] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [chosenPost, setChosenPost] = useState(null);
  const [newComment, setNewComment] = useState("");
    
  useEffect(()=>{
    const getFriendsPosts = async()=>{
        try {
            setLoading(true);
            const res = await fetch("/backend/posts/posts");
            const data = await res.json();
            if(!res.ok){
                setLoading(false);
                setError(data.message);
                return;
            }
            setPosts(data.posts);
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }
    };
    getFriendsPosts();
  },[]);

//   const handleLike =async(postId)=>{
//     setLoading(true);
//     try {
//         const isLiked = likedPosts.has(postId);
//         const res = await fetch("/backend/posts/upvote",{
//             method : "POST",
//             headers: {
//                 'Content-Type' : 'application/json',
//             },
//             body: JSON.stringify({postId}),
//         });
//         const data = await res.json();
//         if(!res.ok){
//             setLoading(false);
//             setError(data.message);
//         };
//         setLoading(false);
//         setPosts((prevPosts)=> prevPosts.map((post)=> post._id === postId ? {...post, upvotes: isLiked ? post.upvotes-1 : post.upvotes+1} : post));

//         setLikedPosts((prevLiked) => {
//             const newLiked = new Set(prevLiked);
//             if (newLiked.has(postId)) {
//               newLiked.delete(postId);
//             } else {
//               newLiked.add(postId);
//             }
//             return newLiked;
//           });
//     } catch (error) {
//         setError(error.message);
//     }
//   }
  const handleLike = async (postId) => {
    setLoading(true);
    try {
        const res = await fetch("/backend/posts/upvote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId }),
        });

        const data = await res.json();

        if (!res.ok) {
            setLoading(false);
            setError(data.message);
            return;
        }

        setLoading(false);
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post._id === postId
                    ? { ...post, upvotes: data.upvotes }
                    : post
            )
        );

        setLikedPosts((prevLiked) => {
            const newLiked = new Set(prevLiked);
            if (newLiked.has(postId)) {
                newLiked.delete(postId);
            } else {
                newLiked.add(postId);
            }
            return newLiked;
        });

    } catch (error) {
        setLoading(false);
        setError(error.message);
    }
  };


  const fetchComments = async (postId) => {
    try {
        const res = await fetch("/backend/posts/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch comments");
        }

        setComments((prev) => ({
            ...prev,
            [postId]: data, // Store comments for this specific post
        }));
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
  };

  const handleCommentClick = (postId)=>{
    if(chosenPost === postId){
        setChosenPost(null);
    }else{
        setChosenPost(postId);
        if(!comments[postId]){
            fetchComments(postId);
        }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
  
    const tempComment = {
        _id: Math.random().toString(36).substring(7), // Temporary ID for rendering
        content: newComment,
    };
  
    setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), tempComment],
    }));
  
    setNewComment("");

    try {
        const res = await fetch('/backend/comments/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, content: newComment }),
        });

        const data = await res.json();
        
        if (!res.ok || !data.comment) {
            setError(data.message);
            return;
        }
        setComments((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []).filter(c => c._id !== tempComment._id), data.comment],
        }));

    } catch (error) {
        console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async(commentId)=>{ 
    setLoading(true);   
    try {
      const res = await fetch("/backend/comments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
  
      setComments(prevComments => ({
        ...prevComments,
        [chosenPost]: prevComments[chosenPost].filter(comment => comment._id !== commentId)
      }));
      setError(null);
      setLoading(false);
  
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }


  return (
    <div className='flex  min-h-screen  bg-gray-800'>
        <div className='border border-red-800  w-64 h-full flex flex-col'>
          <p className='px-2 py-4 font-semibold underline mt-6 ml-3'>Current Streak: <span className='text-red-800'>69</span></p>
          <div className='flex flex-col items-center justify-center gap-8 mt-10'>
            <button className='p-3 w-40 border border-green-700 rounded-2xl text-center' 
                    onClick={() =>  navigate("/friends", {state : {currentUser}}) }>Friendlist</button>
            <div className='w-40'>
              <button  className='p-3 w-full border border-green-700 rounded-2xl text-center'  onClick={() => setShowHabitsOptions(!showHabitsOptions)}>
                Habits
              </button>
              {showHabitsOptions && (
                <div className='mt-2 flex flex-col gap-2'>
                  <button className='p-2 bg-gray-700 text-white rounded-lg' onClick={() => navigate("/habits")}>
                    Add Habit
                  </button>
                  <button className='p-2 bg-gray-700 text-white rounded-lg' onClick={() => navigate("/all-habits")}>
                    View Habits
                  </button>
                </div>
              )}
            </div>
            <div className='w-40'>
              <button onClick={()=>setShowPostOptions(!showPostOptions)} className='p-3 w-40 border border-green-700 rounded-2xl text-center'>Posts</button>
              {showPostOptions && 
                <div className='flex flex-col mt-2 gap-2'>
                  <button onClick={()=> navigate("/new-post")} className='p-2 border bg-gray-700 rounded-lg text-white'>Create Post</button>
                  <button onClick={()=> navigate("/fyp")} className='p-2 border bg-gray-700 rounded-lg text-white'>FYP</button>
                </div>}
            </div>
          </div>
  
        </div>
        <div className='border border-red-800 flex-1 h-full pt-0 pb-0 p-4'>
          <p className='text-center mt-2 text-3xl font-bold italic'>Discover</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 m-4">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className={`relative flex bg-slate-500 border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 p-4 cursor-pointer
                  ${chosenPost === post._id ? "sm:col-span-2 flex-row" : "flex-col"}`}>
                <div className={`p-4 ${chosenPost === post._id ? "w-full sm:w-1/2" : "w-full"}`}>
                  <div className='p-4'>
                    <div className='flex justify-between items-center'>
                      <div className='flex flex-row items-center gap-2'>
                        <img src={post.user.avatar} className='h-7 w-7 rounded-full' alt="Avatar" />
                        <p className='font-medium italic underline'>{post.user.username}</p>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button onClick={() => handleLike(post._id)} className="focus:outline-none">
                          <FontAwesomeIcon icon={faHeart} className={`text-xl cursor-pointer transition-colors duration-300 ${likedPosts.has(post._id) ? "text-red-500" : "text-white"}`} />
                        </button>
                        <span className="text-white font-semibold">{post.upvotes}</span>
                      </div>
                    </div>

                    <div className='text-center p-2 mt-2 border border-gray-800 rounded-lg'>
                      {post.content}
                    </div>

                    <button 
                      // onClick={() => setChosenPost(post._id === chosenPost ? null : post._id)} 
                      onClick={() => {
                        if (post._id !== chosenPost) {
                          fetchComments(post._id); 
                        }
                        setChosenPost(post._id === chosenPost ? null : post._id);
                      }}
                      className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md text-center"
                    >
                      {chosenPost === post._id ? "Close Comments" : "View Comments"}
                    </button>
                  </div>
                </div>

                {/* Comments Section - Only Visible When Chosen */}
                {chosenPost === post._id && (
                  <div className="w-full sm:w-1/2 p-4 border border-gray-500 bg-gray-700 text-white rounded-lg transition-all duration-300 flex flex-col">
                    <h3 className='text-lg font-semibold mb-2'>Comments</h3>
                    <div className='h-60 overflow-y-auto bg-gray-800 p-2 rounded-lg'>
                      {comments[post._id] && comments[post._id].length > 0 ? (
                        comments[post._id].map((comment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border-b">
                            <p className='text-white'>{comment.content || "No content available"}</p>
                            <button className="text-red-500 hover:text-red-700" onClick={()=>handleDeleteComment(comment._id)}>
                              <i className="fas fa-trash"></i> {/* FontAwesome Trash Icon */}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className='text-gray-400'>No comments yet.</p>
                      )}
                    </div>

                    {/* Input Field & Post Button */}
                    <div className="mt-3 flex flex-col items-start w-full gap-2 p-4 bg-gray-600 rounded-lg">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md bg-white text-black"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button 
                        onClick={() => handleAddComment(post._id)} 
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md text-center"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
}