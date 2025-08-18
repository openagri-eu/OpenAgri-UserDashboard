import { Box, CircularProgress, Typography } from "@mui/material";

import logo from '/logo-color.png';

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import useFetch from "@hooks/useFetch";
import { useSession } from "@contexts/SessionContext";

const TokenRefreshPage = () => {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();
    const { session, setSession } = useSession();

    const refresh_token = session?.user.refresh_token;

    const { fetchData, response, error } = useFetch<{ access: string }>(
        "token/refresh/",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: 'POST',
            body: { refresh: refresh_token }
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (response) {
            setSession(prevSession => {
                if (prevSession) {
                    return {
                        ...prevSession,
                        token: response.access
                    };
                }
                return null;
            });
            navigate(searchParams.get("callbackURL") ?? '/');
        }
    }, [response])

    useEffect(() => {
        if (error) {
            const callbackURL = searchParams.get("callbackURL") ?? '/'
            navigate('/sign-in?callbackURL=' + callbackURL);
        }
    }, [error])

    return (
        <Box display={"flex"} justifyContent={"center"}>
            <Box alignItems={"center"} justifyContent={"center"} display={"flex"} flexDirection={"column"} gap={2}>
                <img className='' src={logo} alt="" width={"250px"} />
                <Typography variant="h6">Refreshing session</Typography>
                <Typography variant="body1" textAlign={"center"}>
                    Please wait while your session is being refreshed.
                </Typography>
                <CircularProgress />
            </Box>
        </Box>
    )
}

export default TokenRefreshPage;