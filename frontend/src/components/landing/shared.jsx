import { useEffect, useRef, useState } from "react";

/* Fades and slides content in when it scrolls into view */
export const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* Image with a gradient fallback if the file does not exist yet */
export const LandingImage = ({
  src,
  alt = "",
  className = "",
  fallbackClass = "from-primary/40 to-secondary/40",
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className={`bg-gradient-to-br ${fallbackClass} ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
};

/* Round avatar, optional story ring and online dot, initial as fallback */
export const Avatar = ({
  src,
  name = "",
  size = "size-12",
  online = false,
  ring = false,
  className = "",
}) => {
  const [failed, setFailed] = useState(false);

  const face =
    failed || !src ? (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content grid place-items-center font-bold`}
      >
        {name.charAt(0)}
      </div>
    ) : (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover`}
      />
    );

  return (
    <div className={`relative shrink-0 ${className}`}>
      {ring ? (
        <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-warning via-secondary to-primary">
          <div className="p-[2px] rounded-full bg-base-100">{face}</div>
        </div>
      ) : (
        face
      )}
      {online && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-base-100" />
      )}
    </div>
  );
};