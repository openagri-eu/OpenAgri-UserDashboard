import { useNavigate } from "react-router-dom";
import { RedirectProps } from "./Redirect.types";
import { useEffect } from "react";

const Redirect: React.FC<RedirectProps> = ({ to }) => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(to, { replace: true });
    }, [navigate, to]);

    return null;
};

export default Redirect;