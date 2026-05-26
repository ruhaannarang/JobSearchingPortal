import { useState,useEffect,useContext,createContext } from "react";
const AuthContext=createContext();
export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(token){
            fetch("http://localhost:5000/getuser",{
                headers:{
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching user data:", err);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};