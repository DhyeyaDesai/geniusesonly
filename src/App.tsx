import { decode } from "./utils/codec";
import { ThemeProvider } from "./theme/ThemeContext";
import { CreatorView } from "./components/CreatorView";
import { PlayView } from "./components/PlayView";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const hash   = params.get("h");
  const themeId = params.get("t");
  const answer  = hash ? decode(hash) : null;

  if (answer) {
    return (
      <ThemeProvider themeId={themeId}>
        <PlayView answer={answer.toLowerCase()} />
      </ThemeProvider>
    );
  }

  return <CreatorView />;
}
