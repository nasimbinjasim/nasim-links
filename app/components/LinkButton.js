"use client";
import { supabase } from "../../lib/supabase";

export default function LinkButton({ id, title, url }) {
  function track() {
    // fire-and-forget click counter
    supabase.rpc("lp_increment_click", { link_id: id }).then(() => {}, () => {});
  }
  return (
    <a className="link" href={url} target="_blank" rel="noopener noreferrer" onClick={track}>
      {title}
    </a>
  );
}
