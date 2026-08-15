import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
            }
        }

        if (!token) {
            setLoading(false);
            return;
        }

        fetch("https://jobsearchingportal.onrender.com/getuser", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Token invalid");
                }
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            })
            .catch((err) => {
                console.error("Error fetching user data:", err);
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const updateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, setUser, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);