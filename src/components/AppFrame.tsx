import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Command,
  Home,
  Search,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useWorthMatch } from "../context/WorthMatchContext";

type NavGroupId = "start" | "find" | "apply" | "manage";

interface QuickLink {
  to: string;
  label: string;
}

interface RouteMeta {
  id: string;
  to: string;
  label: string;
  title: string;
  description: string;
  group: NavGroupId;
  rail?: boolean;
  quickLinks: QuickLink[];
  match: (pathname: string) => boolean;
}

interface ShortcutItem {
  id: string;
  label: string;
  description: string;
  to: string;
  badge: string;
  keywords: string[];
}

const navGroups: Array<{
  id: NavGroupId;
  label: string;
  description: string;
  entryTo: string;
}> = [
  {
    id: "start",
    label: "Start",
    description: "Profile setup and demo launch",
    entryTo: "/dashboard",
  },
  {
    id: "find",
    label: "Find",
    description: "Search, intake, and matching",
    entryTo: "/search",
  },
  {
    id: "apply",
    label: "Apply",
    description: "Materials, compare, and follow-through",
    entryTo: "/resume",
  },
  {
    id: "manage",
    label: "Manage",
    description: "Workspace controls and backups",
    entryTo: "/workspace",
  },
];

const routeRegistry: RouteMeta[] = [
  {
    id: "landing",
    to: "/",
    label: "Home",
    title: "WorthMatch Home",
    description: "Choose between a seeded demo path or a blank real-user flow.",
    group: "start",
    rail: false,
    quickLinks: [
      { to: "/onboarding", label: "Try your profile" },
      { to: "/demo", label: "Open demo run" },
    ],
    match: (pathname) => pathname === "/",
  },
  {
    id: "demo",
    to: "/demo",
    label: "Demo Run",
    title: "Guided Demo",
    description: "Fastest walkthrough for judges or collaborators seeing the product for the first time.",
    group: "start",
    quickLinks: [
      { to: "/dashboard", label: "Open dashboard" },
      { to: "/onboarding", label: "Try your profile" },
    ],
    match: (pathname) => pathname === "/demo",
  },
  {
    id: "onboarding",
    to: "/onboarding",
    label: "Onboarding",
    title: "Profile Setup",
    description: "Translate real-life strengths into a usable profile before matching or searching.",
    group: "start",
    quickLinks: [
      { to: "/dashboard", label: "Open dashboard" },
      { to: "/search", label: "Run AI search" },
    ],
    match: (pathname) => pathname === "/onboarding",
  },
  {
    id: "dashboard",
    to: "/dashboard",
    label: "Dashboard",
    title: "Action Dashboard",
    description: "Use this as the main hub for deciding whether to search, import, apply, or package services.",
    group: "start",
    quickLinks: [
      { to: "/search", label: "Run AI search" },
      { to: "/resume", label: "Open materials" },
    ],
    match: (pathname) => pathname === "/dashboard",
  },
  {
    id: "intake",
    to: "/intake",
    label: "Intake Desk",
    title: "Lead Intake",
    description: "Bring in outside listings safely and keep imported leads visible in one place.",
    group: "find",
    quickLinks: [
      { to: "/search", label: "Run AI search" },
      { to: "/opportunities", label: "Open rankings" },
    ],
    match: (pathname) => pathname === "/intake",
  },
  {
    id: "search",
    to: "/search",
    label: "AI Search",
    title: "AI Search Assistant",
    description: "Run one matched search across live sources and platform-ready actions before importing strong leads.",
    group: "find",
    quickLinks: [
      { to: "/intake", label: "Open intake desk" },
      { to: "/opportunities", label: "View rankings" },
    ],
    match: (pathname) => pathname === "/search",
  },
  {
    id: "opportunities",
    to: "/opportunities",
    label: "Opportunities",
    title: "Ranked Opportunities",
    description: "Review best-fit listings, then jump into detail, application materials, or service paths.",
    group: "find",
    quickLinks: [
      { to: "/compare", label: "Compare saved roles" },
      { to: "/resume", label: "Build materials" },
    ],
    match: (pathname) => pathname === "/opportunities",
  },
  {
    id: "opportunity-detail",
    to: "/opportunities",
    label: "Match Detail",
    title: "Opportunity Detail",
    description: "Inspect why a listing fits, then move directly into resume or interview prep.",
    group: "find",
    rail: false,
    quickLinks: [
      { to: "/resume", label: "Build materials" },
      { to: "/interview", label: "Open interview prep" },
    ],
    match: (pathname) => pathname.startsWith("/opportunities/"),
  },
  {
    id: "services",
    to: "/services",
    label: "Service Studio",
    title: "Service Offers",
    description: "Turn informal strengths into clear local or freelance offers with outreach and pricing.",
    group: "find",
    quickLinks: [
      { to: "/search", label: "Search local platforms" },
      { to: "/resume", label: "Open materials" },
    ],
    match: (pathname) => pathname === "/services",
  },
  {
    id: "resume",
    to: "/resume",
    label: "Resume Studio",
    title: "Application Materials",
    description: "Edit the generated resume set, export it, and use it as the main application workspace.",
    group: "apply",
    quickLinks: [
      { to: "/compare", label: "Compare options" },
      { to: "/tracker", label: "Update pipeline" },
    ],
    match: (pathname) => pathname === "/resume",
  },
  {
    id: "interview",
    to: "/interview",
    label: "Interview Prep",
    title: "Interview Prep",
    description: "Practice the story behind a selected opportunity before moving it deeper into the pipeline.",
    group: "apply",
    quickLinks: [
      { to: "/resume", label: "Open materials" },
      { to: "/tracker", label: "Update stage" },
    ],
    match: (pathname) => pathname === "/interview",
  },
  {
    id: "compare",
    to: "/compare",
    label: "Compare",
    title: "Decision Compare",
    description: "Use saved listings side by side to decide which path deserves the next hour of effort.",
    group: "apply",
    quickLinks: [
      { to: "/resume", label: "Build materials" },
      { to: "/tracker", label: "Track a winner" },
    ],
    match: (pathname) => pathname === "/compare",
  },
  {
    id: "tracker",
    to: "/tracker",
    label: "Tracker",
    title: "Application Tracker",
    description: "Keep next steps, notes, and stage changes visible after discovery and application work.",
    group: "apply",
    quickLinks: [
      { to: "/resume", label: "Open materials" },
      { to: "/workspace", label: "Manage workspace" },
    ],
    match: (pathname) => pathname === "/tracker",
  },
  {
    id: "workspace",
    to: "/workspace",
    label: "Workspace",
    title: "Workspace Controls",
    description: "Back up the session, restore data, or start a fresh profile without losing the product flow.",
    group: "manage",
    quickLinks: [
      { to: "/onboarding", label: "Edit profile" },
      { to: "/dashboard", label: "Return to dashboard" },
    ],
    match: (pathname) => pathname === "/workspace",
  },
];

function currentRouteFor(pathname: string) {
  return routeRegistry.find((route) => route.match(pathname)) ?? routeRegistry[0];
}

function sectionFor(groupId: NavGroupId) {
  return navGroups.find((group) => group.id === groupId) ?? navGroups[0];
}

function sectionRoutes(groupId: NavGroupId) {
  return routeRegistry.filter((route) => route.group === groupId && route.rail !== false);
}

function buildShortcutItems(
  pathname: string,
  topMatchItems: ShortcutItem[],
) {
  const routeItems = routeRegistry
    .filter((route) => route.id !== "opportunity-detail")
    .map((route) => ({
      id: `route-${route.id}`,
      label: route.title,
      description: route.description,
      to: route.to,
      badge: route.group,
      keywords: [route.label, route.title, route.group, route.description],
    }));

  return [...routeItems, ...topMatchItems].filter((item) => item.to !== pathname);
}

function matchesShortcutQuery(item: ShortcutItem, query: string) {
  if (!query.trim()) {
    return true;
  }

  const haystack = [item.label, item.description, item.badge, ...item.keywords]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function AppFrame({ children }: PropsWithChildren) {
  const location = useLocation();
  const { matches, savedOpportunityIds, trackedOpportunities } = useWorthMatch();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const deferredCommandQuery = useDeferredValue(commandQuery);
  const currentRoute = currentRouteFor(location.pathname);
  const activeGroup = sectionFor(currentRoute.group);
  const activeGroupRoutes = sectionRoutes(activeGroup.id);
  const isLanding = location.pathname === "/";
  const topMatchItems = useMemo<ShortcutItem[]>(
    () =>
      matches.slice(0, 4).map((match) => ({
        id: `match-${match.id}`,
        label: match.title,
        description: `${match.organization} - ${match.matchScore} match`,
        to: `/opportunities/${match.id}`,
        badge: "top match",
        keywords: [match.organization, match.category, ...match.tags],
      })),
    [matches],
  );
  const shortcutItems = useMemo(
    () => buildShortcutItems(location.pathname, topMatchItems),
    [location.pathname, topMatchItems],
  );
  const filteredShortcuts = useMemo(
    () =>
      shortcutItems
        .filter((item) => matchesShortcutQuery(item, deferredCommandQuery))
        .slice(0, 10),
    [deferredCommandQuery, shortcutItems],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsCommandOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setIsCommandOpen(false);
    setCommandQuery("");
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <div className="app-background app-background--one" />
      <div className="app-background app-background--two" />

      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand__mark">WM</span>
          <div>
            <strong>WorthMatch</strong>
            <span>Turn lived experience into paid momentum.</span>
          </div>
        </Link>

        <nav className="topbar__nav topbar__nav--groups" aria-label="Workspace sections">
          {navGroups.map((group) => (
            <NavLink
              key={group.id}
              className={({ isActive }) =>
                isActive || activeGroup.id === group.id
                  ? "topbar__link topbar__link--active"
                  : "topbar__link"
              }
              to={group.entryTo}
            >
              {group.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar__meta">
          <button
            className="meta-pill meta-pill--button"
            onClick={() => setIsCommandOpen(true)}
            type="button"
          >
            <Command size={16} />
            Quick jump
            <span className="meta-pill__shortcut">Ctrl K</span>
          </button>
          <div className="meta-pill">
            <Target size={16} />
            {matches.length} ranked
          </div>
          <div className="meta-pill">
            <Sparkles size={16} />
            {savedOpportunityIds.length} saved
          </div>
          <div className="meta-pill">
            <BriefcaseBusiness size={16} />
            {trackedOpportunities.length} tracked
          </div>
          <Link
            className="button button--secondary"
            to={location.pathname === "/onboarding" ? "/dashboard" : "/onboarding"}
          >
            <WandSparkles size={16} />
            {location.pathname === "/onboarding" ? "View dashboard" : "Edit profile"}
          </Link>
        </div>
      </header>

      {!isLanding ? (
        <section className="workspace-bar">
          <div className="workspace-bar__summary">
            <span className="eyebrow">{activeGroup.label}</span>
            <h2>{currentRoute.title}</h2>
            <p>{currentRoute.description}</p>
          </div>

          <div className="workspace-bar__sections" aria-label="Section navigation">
            {navGroups.map((group) => (
              <NavLink
                key={group.id}
                className={({ isActive }) =>
                  isActive || activeGroup.id === group.id
                    ? "workspace-bar__section workspace-bar__section--active"
                    : "workspace-bar__section"
                }
                to={group.entryTo}
              >
                <strong>{group.label}</strong>
                <span>{group.description}</span>
              </NavLink>
            ))}
          </div>

          <div className="workspace-bar__routes" aria-label={`${activeGroup.label} pages`}>
            <Link className="workspace-bar__route workspace-bar__route--home" to="/">
              <Home size={16} />
              Home
            </Link>
            {activeGroupRoutes.map((route) => (
              <NavLink
                key={route.id}
                className={({ isActive }) =>
                  isActive ? "workspace-bar__route workspace-bar__route--active" : "workspace-bar__route"
                }
                to={route.to}
              >
                {route.label}
              </NavLink>
            ))}
          </div>

          <div className="workspace-bar__actions">
            {currentRoute.quickLinks.map((link) => (
              <Link key={link.to} className="button button--ghost" to={link.to}>
                {link.label}
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isCommandOpen ? (
        <div className="command-palette">
          <button
            aria-label="Close quick jump"
            className="command-palette__backdrop"
            onClick={() => setIsCommandOpen(false)}
            type="button"
          />

          <div
            aria-label="Quick jump"
            aria-modal="true"
            className="command-palette__dialog"
            role="dialog"
          >
            <div className="command-palette__header">
              <div>
                <span className="eyebrow">Quick jump</span>
                <h3>Move anywhere in WorthMatch in one step.</h3>
              </div>
              <button
                className="button button--ghost"
                onClick={() => setIsCommandOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <label className="command-palette__search">
              <Search size={18} />
              <input
                autoFocus
                className="field"
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search pages, actions, or top matches"
                value={commandQuery}
              />
            </label>

            <div className="command-palette__list">
              {filteredShortcuts.length > 0 ? (
                filteredShortcuts.map((item) => (
                  <Link key={item.id} className="command-palette__item" to={item.to}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                    </div>
                    <span className="score-pill">{item.badge}</span>
                  </Link>
                ))
              ) : (
                <div className="tracker-empty">
                  <p>No quick jump result yet.</p>
                  <p className="status-note">
                    Try searching for dashboard, AI search, resume, tracker, or a job title.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}
