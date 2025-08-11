import { useSession } from "@contexts/SessionContext";
import { useState } from "react";

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: any;
}

const useFetch = <FetchResponse = any>(
    url: string,
    { method = undefined, headers = {}, body = null }: FetchOptions = {}
) => {
    const [response, setResponse] = useState<FetchResponse | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { session } = useSession();
    const token = session?.user?.token;

    const apiUrl = import.meta.env.VITE_API_URL;

    // useEffect(() => {
    const fetchData = async () => {
        setLoading(true)
        setResponse(undefined);
        try {
            const fetchOptions: RequestInit = {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                    ...headers,
                },
                body: body && method !== "GET" && method !== "DELETE" ?
                    body instanceof URLSearchParams ? body.toString() : JSON.stringify(body) :
                    null,
            };
            const response = await fetch(apiUrl + url, fetchOptions);

            if (!response.ok) {
                const result: any = await response.json();
                throw new Error(result.detail);
            }
            const result: FetchResponse = await response.json();
            setResponse(result);
            setError(null);
        } catch (err) {
            setResponse(undefined);
            setError(err as Error);
        } finally {
            // setTimeout(() => { // TODO: remove when backend exists
            setLoading(false);
            // }, 1000);
        }
    };

    return { fetchData, response, loading, error };
};

export default useFetch