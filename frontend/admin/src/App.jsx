import { useState } from "react";
import Login from "./components/Login";
import LayoutEditor from "./components/LayoutEditor";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialState, setInitialState] = useState(null);

  return loggedIn ? (
    <LayoutEditor initialState={initialState} />
  ) : (
    <Login
      onLogin={(state) => {
        setInitialState(state);
        setLoggedIn(true);
      }}
    />
  );
}
