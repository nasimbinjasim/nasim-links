"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { SOCIAL_TYPES, SOCIAL_LABEL, SOCIAL_HINT } from "../../lib/social";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <main className="admin"><p>Loading…</p></main>;
  return session ? <Dashboard email={session.user.email} /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <main className="admin" style={{ maxWidth: 420 }}>
      <h1>Admin sign in</h1>
      <form className="panel" onSubmit={submit}>
        <label className="field">Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

function Dashboard({ email }) {
  const [profile, setProfile] = useState({ name: "", bio: "", avatar_url: "" });
  const [socials, setSocials] = useState([]);
  const [links, setLinks] = useState([]);
  const [msg, setMsg] = useState("");

  const flash = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2500);
  };

  const load = useCallback(async () => {
    const [p, s, l] = await Promise.all([
      supabase.from("lp_profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("lp_socials").select("*").order("position").order("id"),
      supabase.from("lp_links").select("*").order("position").order("id"),
    ]);
    if (p.data) setProfile(p.data);
    setSocials(s.data ?? []);
    setLinks(l.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveProfile(e) {
    e.preventDefault();
    const { error } = await supabase.from("lp_profile").upsert({
      id: 1,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    });
    flash(error ? error.message : "Profile saved");
  }

  async function addRow(table, list, row) {
    const position = list.length ? Math.max(...list.map((r) => r.position)) + 1 : 0;
    const { error } = await supabase.from(table).insert({ ...row, position });
    if (error) flash(error.message);
    load();
  }

  async function saveRow(table, id, patch) {
    const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("id");
    if (error) flash(error.message);
    else if (!data || data.length === 0) flash("NOT saved: this login is not allowed to edit. Check the admin email in Supabase.");
    else flash("Saved");
    load();
  }

  async function removeRow(table, id) {
    if (!confirm("Delete this item?")) return;
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    if (error) flash(error.message);
    else if (!data || data.length === 0) flash("NOT deleted: this login is not allowed to edit. Check the admin email in Supabase.");
    load();
  }

  async function move(table, list, index, dir) {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    await Promise.all(next.map((r, i) => supabase.from(table).update({ position: i }).eq("id", r.id)));
    load();
  }

  return (
    <main className="admin">
      <div className="topbar">
        <div>
          <h1>Edit your page</h1>
          <span className="meta">Signed in as {email} · <a href="/" target="_blank">View page</a></span>
        </div>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <form className="panel" onSubmit={saveProfile}>
        <h2>Profile</h2>
        <label className="field">Name
          <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
        </label>
        <label className="field">Bio
          <input type="text" value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </label>
        <label className="field">Profile photo URL
          <input type="url" value={profile.avatar_url || ""} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://..." />
        </label>
        <button className="btn">Save profile</button>
      </form>

      <section className="panel">
        <div className="topbar">
          <h2>Contact icons</h2>
          <button className="btn ghost" onClick={() => addRow("lp_socials", socials, { type: "phone", value: "", is_active: false })}>Add icon</button>
        </div>
        {socials.map((s, i) => (
          <SocialItem key={s.id} row={s} index={i} count={socials.length}
            onSave={(patch) => saveRow("lp_socials", s.id, patch)}
            onDelete={() => removeRow("lp_socials", s.id)}
            onMove={(d) => move("lp_socials", socials, i, d)} />
        ))}
      </section>

      <section className="panel">
        <div className="topbar">
          <h2>Link buttons</h2>
          <button className="btn ghost" onClick={() => addRow("lp_links", links, { title: "New link", url: "https://", is_active: false })}>Add link</button>
        </div>
        {links.map((l, i) => (
          <LinkItem key={l.id} row={l} index={i} count={links.length}
            onSave={(patch) => saveRow("lp_links", l.id, patch)}
            onDelete={() => removeRow("lp_links", l.id)}
            onMove={(d) => move("lp_links", links, i, d)} />
        ))}
      </section>

      {msg && <div className="toast" role="status">{msg}</div>}
    </main>
  );
}

function Actions({ index, count, onMove, onSave, onDelete, active, setActive, extra }) {
  return (
    <div className="item-actions">
      <label><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Show on page</label>
      {extra}
      <span className="grow" />
      <button type="button" className="btn ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
      <button type="button" className="btn ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
      <button type="button" className="btn" onClick={onSave}>Save</button>
      <button type="button" className="btn danger" onClick={onDelete}>Delete</button>
    </div>
  );
}

function SocialItem({ row, index, count, onSave, onDelete, onMove }) {
  const [d, setD] = useState({ type: row.type, value: row.value, is_active: row.is_active });
  return (
    <div className="item">
      <div className="item-grid">
        <select value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })} aria-label="Type">
          {SOCIAL_TYPES.map((t) => <option key={t} value={t}>{SOCIAL_LABEL[t]}</option>)}
        </select>
        <input type="text" value={d.value} placeholder={SOCIAL_HINT[d.type]} onChange={(e) => setD({ ...d, value: e.target.value })} aria-label="Value" />
      </div>
      <Actions index={index} count={count} onMove={onMove} onDelete={onDelete}
        active={d.is_active} setActive={(v) => setD({ ...d, is_active: v })} onSave={() => onSave(d)} />
    </div>
  );
}

function LinkItem({ row, index, count, onSave, onDelete, onMove }) {
  const [d, setD] = useState({ title: row.title, url: row.url, is_active: row.is_active });
  return (
    <div className="item">
      <div className="item-grid links-grid">
        <input type="text" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} aria-label="Button text" placeholder="Button text" />
        <input type="url" value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} aria-label="Link URL" placeholder="https://" />
      </div>
      <Actions index={index} count={count} onMove={onMove} onDelete={onDelete}
        active={d.is_active} setActive={(v) => setD({ ...d, is_active: v })} onSave={() => onSave(d)}
        extra={<span className="meta">{row.clicks} clicks</span>} />
    </div>
  );
}
