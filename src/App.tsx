import { decode } from "./utils/codec";
import { StarField } from "./components/StarField";
import { CreatorView } from "./components/CreatorView";
import { PlayView } from "./components/PlayView";

export default function App() {
  const hash = new URLSearchParams(window.location.search).get("h");
  const answer = hash ? decode(hash) : null;

  return (
    <>
      <StarField />
      {answer ? <PlayView answer={answer.toLowerCase()} /> : <CreatorView />}
    </>
  );
}
