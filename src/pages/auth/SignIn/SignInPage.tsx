import { Box, Button, IconButton, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import logo from '/logo-color.png';

import { useNavigate, useSearchParams } from "react-router-dom";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { useSession } from "@contexts/SessionContext";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";

const SignInPage = () => {
    const [searchParams] = useSearchParams();

    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const { fetchData, loading, response, error } = useFetch<{ access: string, refresh: string }>(
        "login/",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: 'POST',
            body: new URLSearchParams(credentials)
        }
    );

    const handleSubmit = async () => {
        await fetchData();
    }

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { setSession } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (response) {
            setSession({ user: { token: response.access, refresh_token: response.refresh } })
            navigate(searchParams.get("callbackURL") ?? '/');
        }
    }, [response])

    useEffect(() => {
        if (error) {
            showSnackbar('error', error?.message.toString() ?? '');
        }
    }, [error])

    return (
        <>
            <Box justifyContent={"center"} display={"flex"}>
                <Box alignItems={"center"} justifyContent={"center"} display={"flex"} flex={1} maxWidth={500} flexDirection={"column"} gap={2}>
                    <img className='' src={logo} alt="" width={"200px"} />
                    <Typography variant="h6">Sign In</Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        name="username"
                        type="email"
                        value={credentials.username}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange}
                        variant="outlined"
                        slotProps={{
                            input: {
                                endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        }}
                    />
                    <Button
                        fullWidth
                        startIcon={<LoginIcon />}
                        loading={loading}
                        loadingPosition="start"
                        onClick={handleSubmit}
                        variant="contained">
                        Sign In
                    </Button>
                    <Box display={"flex"}>
                        <Link textAlign={"center"} href="/sign-up" underline="none">
                            {'Don\'t have an account yet? Register for free'}
                        </Link>
                    </Box>
                </Box>
            </Box>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default SignInPage;