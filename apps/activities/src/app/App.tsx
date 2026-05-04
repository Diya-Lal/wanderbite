import { useState, useEffect } from 'react';
import './App.css';
import { Activity, ActivityAppProps, OverpassElement } from './types/activity.types';
import {
  OVERPASS_MIRRORS,
  OVERPASS_TIMEOUT,
  OVERPASS_RESULTS_LIMIT,
  SEARCH_RADIUS_METRES,
  TYPE_LABELS,
  TYPE_ICONS,
  TYPE_GRADIENTS,
} from './constants/activity.constants';

function wikimediaThumb(tag: string): string {
  const file = tag.replace(/^File:/i, '').replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=600`;
}

async function fetchActivities(lat: number, lon: number, signal: AbortSignal): Promise<Activity[]> {
  const query = `[out:json][timeout:${OVERPASS_TIMEOUT}];(
    node["tourism"="attraction"](around:${SEARCH_RADIUS_METRES},${lat},${lon});
    node["tourism"="museum"](around:${SEARCH_RADIUS_METRES},${lat},${lon});
    node["tourism"="viewpoint"](around:${SEARCH_RADIUS_METRES},${lat},${lon});
  );out ${OVERPASS_RESULTS_LIMIT};`;

  const body = `data=${encodeURIComponent(query)}`;

  for (const url of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal,
      });
      if (!res.ok) continue;
      const data = await res.json();
      return (data.elements ?? [])
        .filter((el: OverpassElement) => el.tags?.name)
        .map((el: OverpassElement) => {
          const tourismType = el.tags['tourism'] ?? el.tags['leisure'] ?? el.tags['historic'] ?? 'attraction';
          const wikiTag = el.tags['wikimedia_commons'] ?? el.tags['image'] ?? '';
          return {
            id: el.id,
            name: el.tags['name'],
            type: tourismType,
            address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', '),
            lat: el.lat,
            lon: el.lon,
            wikimediaUrl: wikiTag ? wikimediaThumb(wikiTag) : undefined,
          };
        });
    } catch {
      continue;
    }
  }
  return [];
}

export default function App({ city, lat, lon }: ActivityAppProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!lat || !lon) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetchActivities(lat, lon, controller.signal)
      .then(setActivities)
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [lat, lon]);

  const goBack = () => window.history.back();
  const openMap = (a: Activity) =>
    window.open(`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lon}&zoom=16`, '_blank', 'noopener,noreferrer');

  return (
    <div className="ac-page">
      {/* Navbar */}
      <nav className="ac-nav">
        <a className="ac-nav__brand" href="/homepage">
          <span className="ac-nav__logo-icon">✦</span>
          <span className="ac-nav__logo-text">WanderBite</span>
        </a>
        <ul className="ac-nav__links">
          <li><a href="/destination" className="ac-nav__link">Destinations</a></li>
          <li><a href="/food" className="ac-nav__link">Restaurants</a></li>
          <li><a href="/activities" className="ac-nav__link ac-nav__link--active">Activities</a></li>
        </ul>
        <button className="ac-nav__back" onClick={goBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className={`ac-nav__hamburger${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation">
          <span /><span /><span />
        </button>
      </nav>
      {menuOpen && (
        <>
          <div className="ac-nav__overlay" onClick={() => setMenuOpen(false)} />
          <nav className="ac-nav__mobile">
            <a href="/destination" className="ac-nav__mobile-link" onClick={() => setMenuOpen(false)}>Destinations</a>
            <a href="/food" className="ac-nav__mobile-link" onClick={() => setMenuOpen(false)}>Restaurants</a>
            <a href="/activities" className="ac-nav__mobile-link ac-nav__mobile-link--active" onClick={() => setMenuOpen(false)}>Activities</a>
            <button className="ac-nav__mobile-back" onClick={() => { goBack(); setMenuOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </nav>
        </>
      )}

      {/* Hero */}
      <header className="ac-header">
        <div className="ac-header__bg" />
        <div className="ac-header__overlay" />
        <div className="ac-header__content">
          <p className="ac-header__eyebrow"><span />{city ? 'Things to do' : 'Explore'}<span /></p>
          <h1 className="ac-header__title">
            {city ? <>Activities in <em>{city}</em></> : <>Discover <em>Activities</em></>}
          </h1>
          <p className="ac-header__subtitle">
            {city ? 'Attractions, museums, parks and more' : 'Select a destination to explore activities'}
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="ac-content">
        <div className="ac-content__inner">

          {/* No destination */}
          {!lat && !lon && (
            <div className="ac-empty">
              <div className="ac-empty__icon">🗺️</div>
              <h2 className="ac-empty__title">No destination selected</h2>
              <p className="ac-empty__text">Go to Destinations and pick a city to explore its activities.</p>
              <a href="/destination" className="ac-btn">Explore Destinations</a>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="ac-loading">
              <div className="ac-loading__spinner" />
              <p className="ac-loading__text">Finding activities…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="ac-empty">
              <div className="ac-empty__icon">⚠️</div>
              <h2 className="ac-empty__title">Something went wrong</h2>
              <p className="ac-empty__text">Could not load activities. Please try again.</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && activities.length > 0 && (
            <>
              <div className="ac-results-header">
                <span className="ac-results-header__line" />
                <span className="ac-results-header__count">{activities.length} activities found</span>
                <span className="ac-results-header__line" />
              </div>
              <div className="ac-grid">
                {activities.map((a) => (
                  <article className="ac-card" key={a.id}>
                    <div className="ac-card__visual"
                      style={{ background: a.wikimediaUrl ? undefined : (TYPE_GRADIENTS[a.type] ?? TYPE_GRADIENTS['default']) }}>
                      {a.wikimediaUrl
                        ? <img className="ac-card__image" src={a.wikimediaUrl} alt={a.name} loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <span className="ac-card__type-icon">{TYPE_ICONS[a.type] ?? TYPE_ICONS['default']}</span>
                      }
                      <span className="ac-card__type">{TYPE_LABELS[a.type] ?? a.type}</span>
                    </div>
                    <div className="ac-card__body">
                      <h3 className="ac-card__name">{a.name}</h3>
                      {a.address && (
                        <p className="ac-card__address">
                          <span>📍</span> {a.address}
                        </p>
                      )}
                      <div className="ac-card__actions">
                        <button className="ac-card__btn" onClick={() => openMap(a)}>
                          View on Map
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* No results */}
          {!loading && !error && lat && lon && activities.length === 0 && (
            <div className="ac-empty">
              <div className="ac-empty__icon">🗺️</div>
              <h2 className="ac-empty__title">No activities found</h2>
              <p className="ac-empty__text">We couldn't find activities in this area. Try a different city.</p>
              <a href="/destination" className="ac-btn">Change Destination</a>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
