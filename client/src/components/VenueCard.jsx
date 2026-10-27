import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const getSportFallback = (sport) => {
  const s = String(sport || '').toLowerCase();
  if (s.includes('cricket')) return '/images/fallbacks/cricket.svg';
  if (s.includes('football') || s.includes('futsal')) return '/images/fallbacks/football.svg';
  if (s.includes('badminton')) return '/images/fallbacks/badminton.svg';
  if (s.includes('basketball')) return '/images/fallbacks/basketball.svg';
  return '/images/fallbacks/default.svg';
};

export default function VenueCard({ venue }) {
  const sportKey = venue.sport?.toLowerCase();
  const fallbackImg = getSportFallback(sportKey);
  const initialImg = venue.images && venue.images.length > 0 ? venue.images[0] : fallbackImg;

  const [imgSrc, setImgSrc] = useState(initialImg);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const nextImg = venue.images && venue.images.length > 0 ? venue.images[0] : fallbackImg;
    setImgSrc(nextImg);
    setHasError(false);
  }, [venue.images, fallbackImg]);

  const handleImageError = () => {
    if (!hasError && imgSrc !== fallbackImg) {
      setHasError(true);
      setImgSrc(fallbackImg);
    }
  };

  const sportDisplay = {
    cricket: 'Box Cricket',
    football: 'Football Turf',
    badminton: 'Badminton Court',
    basketball: 'Basketball Court',
  }[venue.sport?.toLowerCase()] || venue.sport;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Venue Image Container with Fixed 16:10 Ratio */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/10',
        overflow: 'hidden',
        backgroundColor: '#07111e',
      }}>
        <img
          src={imgSrc}
          alt={`${venue.name} - ${sportDisplay} in ${venue.city}`}
          loading="lazy"
          decoding="async"
          width="400"
          height="250"
          onError={handleImageError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.4s ease',
          }}
          className="venue-card-img"
        />

        {/* Overlay Badges */}
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          display: 'flex',
          gap: '0.4rem',
        }}>
          <span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>
            {sportDisplay}
          </span>
          <span className="badge badge-city">
            {venue.city}
          </span>
        </div>

        {/* Status overlay if inactive */}
        {!venue.isActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(7, 13, 24, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            Inactive / Maintenance
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '0.75rem',
      }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: 1.3,
        }}>
          {venue.name}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
        }}>
          <MapPin size={14} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {venue.address}
          </span>
        </div>

        {/* Key Amenities Preview */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginTop: '0.25rem',
          }}>
            {venue.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  padding: '0.15rem 0.5rem',
                  backgroundColor: 'rgba(30, 53, 83, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                }}
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                +{venue.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing and Action Button */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Price Per Hour
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--lime-400)' }}>
              ₹{venue.pricePerHour?.toLocaleString('en-IN') || venue.hourlyPrice?.toLocaleString('en-IN')}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> / slot</span>
            </div>
          </div>

          <Link
            to={`/venues/${venue._id}`}
            className="btn btn-primary"
            style={{
              padding: '0.5rem 0.95rem',
              fontSize: '0.875rem',
              gap: '0.35rem',
            }}
          >
            Book Slot <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <style>{`
        .card:hover .venue-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
