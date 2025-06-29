import { useContext } from "react";
import AuthContext from "../context/AuthContext";

// Re-export the useAuth hook from AuthContext
export { useAuth } from "../context/AuthContext";

// Additional auth-related hooks can be added here
export default useAuth;
