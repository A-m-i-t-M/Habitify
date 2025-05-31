import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SideBar from '../../components/SideBar';
import { API_CALL_PREFIX } from '../../config.js';

export default function Fyp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log(loading, error);  
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [chosenPost, setChosenPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("token"); 
  useEffect(()=>{
    const getFriendsPosts = async()=>{
        try {
            setLoading(true);
            const res = await fetch(`${API_CALL_PREFIX}/backend/posts/posts`,{
          method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
        });
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
        const res = await fetch(`${API_CALL_PREFIX}/backend/posts/upvote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",'Authorization': `Bearer ${token}`
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
        const res = await fetch(`${API_CALL_PREFIX}/backend/posts/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",'Authorization': `Bearer ${token}`
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
        const res = await fetch(`${API_CALL_PREFIX}/backend/comments/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json",'Authorization': `Bearer ${token}` },
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
      const res = await fetch(`${API_CALL_PREFIX}/backend/comments/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",'Authorization': `Bearer ${token}`
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
    <div className='flex min-h-screen bg-bg text-text-primary font-serif'>
        <SideBar/>
        <div className='flex-1 h-full pt-0 pb-0 p-4 md:p-8 overflow-y-auto'>
          <h1 className='text-center my-6 text-3xl font-semibold text-primary'>Discover Posts</h1>
          {error && <p className='text-red-500 mb-4 text-center text-sm'>{error}</p>}
          {posts.length === 0 && !loading && (
            <p className='text-center text-text-muted mt-10'>No posts available in the feed right now. Check back later!</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className={`relative flex bg-bg border border-secondary rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-2 
                  ${chosenPost === post._id ? "md:col-span-2 flex-col md:flex-row" : "flex-col"}`}>
                <div className={`p-4 ${chosenPost === post._id ? "w-full md:w-1/2" : "w-full"}`}>
                  <div className='p-1'>
                    <div className='flex justify-between items-center mb-3'>
                      <div className='flex flex-row items-center gap-2'>
                        <img src={post.user.avatar} className='h-9 w-9 rounded-full object-cover border border-secondary' alt="Avatar" />
                        <p className='font-medium text-text-primary hover:underline cursor-pointer'>{post.user.username}</p>
                      </div>

                      <div className='flex items-center gap-3'>
                        <button onClick={() => handleLike(post._id)} className="focus:outline-none flex items-center gap-1">
                          <FontAwesomeIcon icon={faHeart} className={`text-xl cursor-pointer transition-colors duration-300 ${likedPosts.has(post._id) ? "text-red-500" : "text-text-muted hover:text-red-400"}`} />
                           <span className="text-text-muted font-semibold text-sm">{post.upvotes}</span>
                        </button>
                      </div>
                    </div>

                    <div className='text-text-primary p-3 mt-2 border border-secondary/50 rounded-lg bg-bg shadow-inner text-sm min-h-[60px]'>
                      {post.content}
                    </div>

                    <button 
                      onClick={() => {
                        if (post._id !== chosenPost) {
                          fetchComments(post._id); 
                        }
                        setChosenPost(post._id === chosenPost ? null : post._id);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-secondary hover:opacity-90 text-bg rounded-lg text-sm shadow-sm"
                    >
                      {chosenPost === post._id ? "Hide Comments" : "View Comments"}
                    </button>
                  </div>
                </div>

                {/* Comments Section - Only Visible When Chosen */}
                {chosenPost === post._id && (
                  <div className="w-full md:w-1/2 p-4 border-l border-secondary/50 bg-bg text-text-primary rounded-r-xl transition-all duration-300 flex flex-col">
                    <h3 className='text-lg font-semibold text-primary mb-3 pb-2 border-b border-secondary/50'>Comments</h3>
                    <div className='flex-grow h-60 overflow-y-auto bg-bg p-3 rounded-lg border border-secondary/30 shadow-inner space-y-2 mb-3'>
                      {comments[post._id] && comments[post._id].length > 0 ? (
                        comments[post._id].map((comment, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 border border-secondary/20 rounded-md bg-bg shadow-sm">
                            <p className='text-text-primary text-sm'>{comment.content || "No content available"}</p>
                            {/* Assuming a check for currentUser to allow delete for own comments, or admin */} 
                            <button className="text-red-500 hover:text-red-700 focus:outline-none" onClick={()=>handleDeleteComment(comment._id)}>
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className='text-text-muted text-center py-4 text-sm'>No comments yet.</p>
                      )}
                    </div>

                    {/* Input Field & Post Button */}
                    <div className="mt-auto flex flex-col items-start w-full gap-2 pt-3 border-t border-secondary/50">
                      <textarea
                        rows="2"
                        className="w-full p-2.5 border border-secondary rounded-lg bg-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm text-sm"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button 
                        onClick={() => handleAddComment(post._id)} 
                        className="w-full px-4 py-2 bg-primary hover:bg-accent text-bg rounded-lg text-sm shadow-md transition"
                      >
                        Post Comment
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