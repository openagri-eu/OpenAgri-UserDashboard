import { FarmParcel } from "@models/FarmParcel";
import { createContext, useContext } from "react";

export interface Session {
    user: {
        token?: string
        refresh_token?: string
    };
    farm_parcel?: FarmParcel;
}

interface SessionContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    setSession: () => { },
});

export default SessionContext;

export const useSession = () => useContext(SessionContext);