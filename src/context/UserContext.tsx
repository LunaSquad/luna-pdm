import React, { createContext, useContext, useState } from "react";

type UserData = { userId?: string; tipoUser?: string };

type UserCtx = UserData & {
  setUser: (u: UserData) => void;
};

const UserContext = createContext<UserCtx>({ setUser: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>({});
  return (
    <UserContext.Provider value={{ ...user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);