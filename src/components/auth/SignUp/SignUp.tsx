import { Box, Button, IconButton, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import logo from "/logo-color.png";
import { useNavigate } from "react-router-dom";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";

const SignUp = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email: string) => {
        if (!email) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
        return "";
    };

    const validatePassword = (password: string) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return "";
    };

    const validateConfirmPassword = (confirmPassword: string) => {
        if (!confirmPassword) return "Confirm password is required";
        if (confirmPassword !== credentials.password) return "Passwords do not match";
        return "";
    };

    const validateField = (name: string, value: string) => {
        let error = "";
        if (name === "email") error = validateEmail(value);
        if (name === "password") error = validatePassword(value);
        if (name === "confirmPassword") error = validateConfirmPassword(value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const { fetchData, loading, response, error } = useFetch<{ message: string }>(
        "user/register", // TODO: use real API
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: { email: credentials.email, password: credentials.password },
        }
    );

    const handleSubmit = async () => {
        const emailError = validateEmail(credentials.email);
        const passwordError = validatePassword(credentials.password);
        const confirmPasswordError = validateConfirmPassword(credentials.confirmPassword);

        setErrors({ email: emailError, password: passwordError, confirmPassword: confirmPasswordError });

        if (emailError || passwordError || confirmPasswordError) return;

        await fetchData();
    };

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        if (response) {
            setTimeout(() => navigate("/sign-in"), 1000);
        }
    }, [response]);

    useEffect(() => {
        if (error) {
            showSnackbar("error", error?.message.toString() ?? "Registration failed");
        }
    }, [error]);

    return (
        <>
            <Box display="flex" justifyContent="center">
                <Box alignItems="center" justifyContent="center" display="flex" flex={1} maxWidth={500} flexDirection="column" gap={2}>
                    <img src={logo} alt="" width="200px" />
                    <Typography variant="h6">Sign Up</Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={credentials.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        variant="outlined"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={credentials.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        variant="outlined"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                    <Button
                        fullWidth
                        startIcon={<PersonAddIcon />}
                        disabled={loading}
                        onClick={handleSubmit}
                        variant="contained"
                    >
                        Sign Up
                    </Button>
                    <Box display="flex">
                        <Link textAlign="center" href="/sign-in" underline="none">
                            {"Already have an account? Sign in"}
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
    );
};

export default SignUp;
