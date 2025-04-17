import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useGlobalNavigation = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "`") {
                navigate("/nav");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [navigate]);
};

export default useGlobalNavigation;