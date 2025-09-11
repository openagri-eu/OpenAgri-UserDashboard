import { useSession } from "@contexts/SessionContext";
import { useState } from "react";

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
    responseType?: 'json' | 'blob';
}

const useFetch = <FetchResponse = any>(
    url: string,
    { method = 'GET', headers = {}, body = null, responseType = 'json' }: FetchOptions = {}
) => {
    const [response, setResponse] = useState<FetchResponse | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { session, setSession } = useSession();
    const apiUrl = window.env?.VITE_API_URL ? window.env?.VITE_API_URL : import.meta.env.VITE_API_URL;

    const fetchData = async (dynamicBody = {}, dynamicHeader = {}) => {
        setLoading(true);
        setResponse(undefined);
        setError(null);

        try {
            if (Object.keys(dynamicBody).length > 0) body = dynamicBody;
            if (Object.keys(dynamicHeader).length > 0) headers = dynamicHeader;

            const getFetchOptions = (token: string | undefined) => {
                const finalBody = body && method !== "GET" && method !== "DELETE" ?
                    body instanceof URLSearchParams ? body.toString() : JSON.stringify(body) :
                    null;

                const finalHeaders: Record<string, string> = { ...headers };
                if (responseType === 'json') {
                    finalHeaders["Content-Type"] = "application/json";
                }
                if (token) {
                    finalHeaders["Authorization"] = `Bearer ${token}`;
                }

                return {
                    method,
                    headers: finalHeaders,
                    body: finalBody,
                };
            };

            const initialToken = session?.user?.token;
            let fetchOptions = getFetchOptions(initialToken);
            let response = await fetch(apiUrl + url, fetchOptions);

            if (response.status === 401) {
                const refreshToken = session?.user?.refresh_token;
                if (!refreshToken) {
                    throw new Error("Session expired. Please log in again.");
                }

                const refreshResponse = await fetch(apiUrl + "token/refresh/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error("Session expired. Please log in again.");
                }

                const newToken: { access: string; } = await refreshResponse.json();

                setSession(prevSession => {
                    if (prevSession) {
                        return {
                            ...prevSession,
                            user: {
                                ...prevSession.user,
                                token: newToken.access
                            }
                        };
                    }
                    return null;
                });

                fetchOptions = getFetchOptions(newToken.access);
                response = await fetch(apiUrl + url, fetchOptions);
            }

            if (!response.ok) {
                try {
                    const result: any = await response.json();
                    throw new Error(result.detail || `HTTP Error: ${response.status}`);
                } catch (jsonError) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
            }

            if (responseType === 'blob') {
                const blobResult = await response.blob();
                setResponse(blobResult as FetchResponse);
            } else {
                const jsonResult: FetchResponse = await response.json();
                setResponse(jsonResult);
            }
            setError(null);
        } catch (err) {
            setResponse(undefined);
            setError(err as Error);
            // Possibly reroute to a different route to retrigger token refresh if weird behavior occurs
        } finally {
            setLoading(false);
        }
    };

    return { fetchData, response, loading, error };
};

export default useFetch;