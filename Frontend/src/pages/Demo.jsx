import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Demo() {


    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log(formData);
            const res = await fetch("/backend/auth/signin", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success === false) {
                setError(data.message);
                setLoading(false);
                return;
            }

            setError(null);
            setLoading(false);
            navigate("/home");
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };
  return (
        
            <div className="bg-neutral-200 dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-95 p-6 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center mb-6 dark:text-purple-300 text-slate-800">Sign In</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        placeholder="E-Mail"
                        id="email"
                        type="email"
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onChange={handleChange}
                    />
                    <input
                        placeholder="Password"
                        id="password"
                        type="password"
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onChange={handleChange}
                    />
                    {error && <p className="text-red-700 text-center">{error}</p>}
                    <button
                        disabled={loading}
                        className={`p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50 ${
                            loading && "cursor-not-allowed"
                        }`}
                    >
                        {loading ? "Loading..." : "SIGN IN"}
                    </button>
                </form>
                <div className="flex justify-center gap-2 mt-4">
                    <p className='dark:text-purple-300'>Don't have an Account?</p>
                    <Link to="/sign-up" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>

    );
}





{/* <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-6 text-green-500">Sign In</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                    placeholder="E-Mail"
                    id="email"
                    type="email"
                    className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={handleChange}
                />
                <input
                    placeholder="Password"
                    id="password"
                    type="password"
                    className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={handleChange}
                />
                {error && <p className="text-red-500 text-center">{error}</p>}
                <button
                    disabled={loading}
                    className={`p-3 rounded-lg text-white bg-green-500 hover:bg-green-600 transition disabled:opacity-50 ${loading && "cursor-not-allowed"}`}
                >
                    {loading ? "Loading..." : "SIGN IN"}
                </button>
            </form>
            <div className="flex justify-center gap-2 mt-4">
                <p className='text-gray-400'>Don't have an Account?</p>
                <Link to="/sign-up" className="text-green-400 hover:underline">
                    Sign Up
                </Link>
            </div>
        </div>
    );
} */}
