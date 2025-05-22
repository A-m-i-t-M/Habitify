import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import SideBar from '../../components/SideBar';

export default function CreatePost() {
  const initialFormData = {
    content: "",
  }

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [myPosts, setMyPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [chosenPost, setChosenPost] = useState(null);
  const [showForm, setShowForm] = useState(() => {
      const saved = localStorage.getItem("showForm");
      return saved !== null ? JSON.parse(saved) : true;
    }); 
  const [showPosts, setShowPosts] = useState(() => {
      const saved = localStorage.getItem("showPosts");
      return saved !== null ? JSON.parse(saved) : false;
    });
  const [addingPost, setAddingPost] = useState(() => {
      const saved = localStorage.getItem("editMode");
      return saved === "true" ? false : true;
    });
  const [updatingPost, setUpdatingPost] = useState(() => {
      const saved = localStorage.getItem("editMode");
      return saved === "true";
    }); 
  const [updateMe, setUpdateMe] = useState(() => {
      const saved = localStorage.getItem("editPost");
      return saved ? JSON.parse(saved) : null;
    });

  useEffect(() => {
      localStorage.setItem("showForm", JSON.stringify(showForm));
      localStorage.setItem("showPosts", JSON.stringify(showPosts));
    }, [showForm, showPosts]);
  
  useEffect(() => {
    const getMyPosts = async() => {
      setLoading(true);
      try {
        const res = await fetch("/backend/posts");
        const data = await res.json();
        if(!res.ok){
          setLoading(false);
          setError(data.message);
          return;
        }
        setMyPosts(data.posts);
        setLoading(false);
        setError(null);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    getMyPosts();
  },[])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }
  
  const createDaPost = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/backend/posts/create",{
        method : "POST",
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      }

      const updatedPostsRes = await fetch("/backend/posts/");
      const updatedPostsData = await updatedPostsRes.json();

      if(updatedPostsRes.ok){
        setMyPosts(updatedPostsData.posts);
      }
      setError(null);
      setLoading(false);
      setSuccessMessage("Post created successfully!");
      setFormData(initialFormData);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }

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
        setLoading(false);
        setError(data.message);
        return;
      }

      setComments((prev) => ({
        ...prev,
        [postId]: data, 
      }));
      setChosenPost(postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleDeleteComment = async(commentId) => {
    setLoading(true);
    try {
      const res = await fetch("/backend/comments/delete", {
        method : "POST",
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({commentId}),
      });
      const data = await res.json();

      if(!res.ok){
        setError(data.message);
        setLoading(false);
        return;
      }

      setComments(prevComments => ({
        ...prevComments, 
        [chosenPost]: prevComments[chosenPost].filter(comment => comment._id !== commentId),
      }));
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  const handleDeletePost = async(postId) => {
    setLoading(true);
    try {
      const res = await fetch("/backend/posts/delete", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({postId}),
      });
      const data = await res.json();

      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      }

      setMyPosts(prevPosts => {
        const updatedPosts = prevPosts.filter(post => post._id !== postId);
        
        // If no posts left, switch to add post form
        if (updatedPosts.length === 0) {
          setShowForm(true);
          setShowPosts(false);
        }
        
        return updatedPosts;
      });
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }

  const updatePost = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/backend/posts/update", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: updateMe._id,
          content: formData.content,
        }),
      });
      const data = await res.json();

      if(!res.ok){
        setLoading(false);
        setError(data.message);
        return;
      }

      setMyPosts(prevPosts => prevPosts.map(post => 
        post._id === updateMe._id ? { ...post, content: formData.content } : post
      ));
      
      setFormData(initialFormData);
      setAddingPost(true);
      setUpdatingPost(false);
      setUpdateMe(null);
      localStorage.removeItem("editMode");
      localStorage.removeItem("editPost");
      
      setError(null);
      setLoading(false);
      setSuccessMessage("Post updated successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }

  const handleEdit = (post) => {
    setFormData({
      content: post.content,
    });
    setAddingPost(false);
    setUpdatingPost(true);
    setUpdateMe(post);
    localStorage.setItem("editMode", "true");
    localStorage.setItem("editPost", JSON.stringify(post));
  }

  const handleCancel = () => {
    setFormData(initialFormData);
    setAddingPost(true);
    setUpdatingPost(false);
    setUpdateMe(null);
    localStorage.removeItem("editMode");
    localStorage.removeItem("editPost");
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-light tracking-widest uppercase mb-8">Posts</h1>
          
          <div className="flex gap-6 border-b border-white/10 mb-10">
            <button 
              className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative ${
                showForm ? 'text-white' : 'text-white/50'
              }`}
              onClick={() => {
                setShowForm(true);
                setShowPosts(false);
              }}
            >
              Create Post
              {showForm && (
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                  layoutId="activeSection"
                />
              )}
            </button>
            <button 
              className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative ${
                showPosts ? 'text-white' : 'text-white/50'
              }`}
              onClick={() => {
                setShowForm(false);
                setShowPosts(true);
              }}
            >
              My Posts
              {showPosts && (
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                  layoutId="activeSection"
                />
              )}
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {/* Create Post Form */}
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-10"
              >
                <form onSubmit={addingPost ? createDaPost : updatePost} className="space-y-6">
                  <div>
                    <label 
                      htmlFor="content"
                      className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block"
                    >
                      Share your thoughts
                    </label>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="What's on your mind?"
                      className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm min-h-[120px]"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                    >
                      {loading ? "Processing..." : addingPost ? "Create Post" : "Update Post"}
                    </button>
                    
                    {updatingPost && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border border-white/30 text-white hover:border-white transition-colors duration-300 text-xs uppercase tracking-wider font-light"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  {error && (
                    <p className="text-red-400 text-xs tracking-wider">{error}</p>
                  )}
                  
                  {successMessage && (
                    <p className="text-white/70 text-xs tracking-wider">{successMessage}</p>
                  )}
                </form>
              </motion.div>
            )}
            
            {/* My Posts List */}
            {showPosts && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : myPosts.length === 0 ? (
                  <p className="text-white/50 text-center">You haven&apos;t created any posts yet.</p>
                ) : (
                  <div className="space-y-8">
                    {myPosts.map(post => (
                      <div key={post._id} className="border border-white/10 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-sm">{post.content}</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleEdit(post)}
                              className="text-xs text-white/70 hover:text-white transition-colors duration-300"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              className="text-xs text-white/70 hover:text-white transition-colors duration-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-white/50 mt-4">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <button 
                            onClick={() => fetchComments(post._id)}
                            className="hover:text-white transition-colors duration-300"
                          >
                            {comments[post._id] ? 'Hide Comments' : 'View Comments'}
                          </button>
                        </div>
                        
                        {/* Comments Section */}
                        {comments[post._id] && (
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-light mb-4">Comments</h3>
                            
                            {comments[post._id].length === 0 ? (
                              <p className="text-white/50 text-xs">No comments yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {comments[post._id].map(comment => (
                                  <div key={comment._id} className="flex justify-between items-start bg-white/5 p-3">
                                    <div>
                                      <p className="text-xs font-light">{comment.content}</p>
                                      <p className="text-xs text-white/50 mt-1">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    
                                    {comment.isAuthor && (
                                      <button 
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="text-xs text-white/50 hover:text-white transition-colors duration-300"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}