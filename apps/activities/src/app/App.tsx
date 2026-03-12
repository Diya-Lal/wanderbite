import { useState, useEffect } from 'react';
import './App.css';

interface Activity {
  id: number;
  name: string;
  type: string;
  address: string;
  lat: number;
  lon: number;
  wikimediaUrl?: string;
}

interface Props {
  city: string;
  lat: number;
  lon: number;
}

const TYPE_LABELS: Record<string, string> = {
  attraction: 'Attraction',
  museum: 'Museum',
  viewpoint: 'Viewpoint',
  zoo: 'Zoo',
  park: 'Park',
  monument: 'Monument',
  gallery: 'Gallery',
  theme_park: 'Theme Park',
  historic: 'Historic Site',
};

const TYPE_ICONS: Record<string, string> = {
  attraction: '✦',
  museum:     '🏛',
  viewpoint:  '🔭',
  zoo:        '🦁',
  park:       '🌿',
  monument:   '🗿',
  gallery:    '🖼',
  theme_park: '🎡',
  historic:   '⚔️',
  default:    '📍',
};

const TYPE_GRADIENTS: Record<string, string> = {
  attraction: 'linear-gradient(135deg, #1a1228 0%, #2d1f4e 100%)',
  museum:     'linear-gradient(135deg, #0f1a2e 0%, #1e3a5f 100%)',
  viewpoint:  'linear-gradient(135deg, #0d1f1a 0%, #1a3d30 100%)',
  zoo:        'linear-gradient(135deg, #1a1a0d 0%, #3d3010 100%)',
  park:       'linear-gradient(135deg, #0d1a10 0%, #1a3d20 100%)',
  monument:   'linear-gradient(135deg, #1a1212 0%, #3d1a1a 100%)',
  gallery:    'linear-gradient(135deg, #1a0f1a 0%, #3d1f3d 100%)',
  theme_park: 'linear-gradient(135deg, #1a0d1a 0%, #3d1050 100%)',
  historic:   'linear-gradient(135deg, #1a1208 0%, #3d2a08 100%)',
  default:    'linear-gradient(135deg, #0f1726 0%, #1e2f4e 100%)',
};

function wikimediaThumb(tag: string): string {
  // tag may be "File:Foo.jpg" or just "Foo.jpg"
  const file = tag.replace(/^File:/i, '').replace(/ /g, '_');
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=600`;
}

const MIRRORS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

async function fetchActivities(lat: number, lon: number): Promise<Activity[]> {
  const r = 5000;
  const query = `[out:json][timeout:15];(
    node["tourism"="attraction"](around:${r},${lat},${lon});
    node["tourism"="museum"](around:${r},${lat},${lon});
    node["tourism"="viewpoint"](around:${r},${lat},${lon});
  );out 20;`;

  const body = `data=${encodeURIComponent(query)}`;

  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) continue;
      const data = await res.json();
      return (data.elements ?? [])
        .filter((el: any) => el.tags?.name)
        .map((el: any) => {
          const tourismType = el.tags.tourism ?? el.tags.leisure ?? el.tags.historic ?? 'attraction';
          const wikiTag = el.tags.wikimedia_commons ?? el.tags.image ?? '';
          return {
            id: el.id,
            name: el.tags.name,
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

export default function App({ city, lat, lon }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    setError(false);
    fetchActivities(lat, lon)
      .then(setActivities)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const goBack = () => window.history.back();
  const openMap = (a: Activity) =>
    window.open(`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lon}&zoom=16`, '_blank');

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
      </nav>

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
