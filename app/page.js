import { getServerClient } from "../lib/supabase";
import { socialHref, SOCIAL_LABEL } from "../lib/social";
import SocialIcon from "./components/SocialIcon";
import LinkButton from "./components/LinkButton";

export const dynamic = "force-dynamic"; // always show the latest data from Supabase

async function load() {
  const db = getServerClient();
  const [p, s, l] = await Promise.all([
    db.from("lp_profile").select("*").eq("id", 1).maybeSingle(),
    db.from("lp_socials").select("*").eq("is_active", true).order("position").order("id"),
    db.from("lp_links").select("id,title,url").eq("is_active", true).order("position").order("id"),
  ]);
  return { profile: p.data, socials: s.data ?? [], links: l.data ?? [], error: p.error || s.error || l.error };
}

export async function generateMetadata() {
  const { profile } = await load();
  const name = profile?.name || "Nasim Bin Jasim";
  const bio = profile?.bio || "";
  return {
    title: name,
    description: bio,
    openGraph: { title: name, description: bio, images: profile?.avatar_url ? [profile.avatar_url] : [] },
  };
}

export default async function Home() {
  const { profile, socials, links, error } = await load();

  if (!profile) {
    return (
      <main className="page">
        <p className="notice">
          {error
            ? "Could not reach Supabase. Check the environment variables and that schema.sql has been run."
            : "No profile yet. Open /admin to create one."}
        </p>
      </main>
    );
  }

  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="page">
      <header className="hero">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={profile.avatar_url} alt={profile.name} width={96} height={96} />
        ) : (
          <div className="avatar avatar-fallback" aria-hidden="true">{initials}</div>
        )}
        <h1>{profile.name}</h1>
        {profile.bio && <p className="bio">{profile.bio}</p>}
      </header>

      {socials.length > 0 && (
        <ul className="socials">
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={socialHref(s.type, s.value)}
                aria-label={`${profile.name} ${SOCIAL_LABEL[s.type]}`}
                target={s.type === "phone" || s.type === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                <SocialIcon type={s.type} />
              </a>
            </li>
          ))}
        </ul>
      )}

      <ul className="links">
        {links.map((l) => (
          <li key={l.id}>
            <LinkButton id={l.id} title={l.title} url={l.url} />
          </li>
        ))}
      </ul>
    </main>
  );
}
