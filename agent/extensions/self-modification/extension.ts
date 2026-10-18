import selfModification from "eve/self-modification/local";

// Off: code changes go through TDD in the repo, not through the chat. This also applies when
// `next dev` starts eve through withEve, which ignores the --no-default-extensions flag.
export default selfModification({
  local: { enabled: false },
});
