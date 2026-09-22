import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

const FALLBACK_POSTER = "/img/brataniya-tour-poster.jpg";
const POSTER_POOL = [
  "/img/brataniya-tour-poster.jpg",
  "/img/duocard.png",
  "/img/bratania-duo.jpg",
  "/img/DSCF4120-2.jpg",
];

const formatGigDate = (date) => {
  if (!date || date === "TBA") return "TBA";
  return date.replace(/\.20\d{2}$/, ".");
};

const posterFor = (gig, index) =>
  gig.image || POSTER_POOL[index % POSTER_POOL.length] || FALLBACK_POSTER;

export const SectionGigs = ({ label, gigs = [], hint }) => {
  const tourTitle = gigs[0]?.type ?? "";
  const tourNote = gigs[0]?.typeNote ?? "";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    duration: 25,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onPosterLoad = useCallback(() => {
    emblaApi?.reInit();
  }, [emblaApi]);

  return (
    <section
      id="gigs"
      className={`${styles.section} ${styles.sectionGigs}`}
      data-section="gigs"
    >
      <div className={styles.sectionInner}>
        <div className={styles.gigsHead}>
          <h2 className={styles.sectionLabel}>{label}</h2>
        </div>

        {tourTitle ? (
          <p className={styles.gigsTourLine}>
            <span className={styles.gigsTourMain}>{tourTitle}</span>
            {tourNote ? (
              <span className={styles.gigsTitleNote}>({tourNote})</span>
            ) : null}
          </p>
        ) : null}

        <div className={styles.gigsSlider}>
          <div className={styles.gigsViewport} ref={emblaRef}>
            <div className={styles.gigsTrack}>
              {gigs.map((gig, index) => (
                <div className={styles.gigsSlide} key={gig.slug}>
                  <article className={styles.gigsCard}>
                    <Link
                      className={styles.gigsCardPoster}
                      to={`/gigs/${gig.slug}`}
                      draggable={false}
                    >
                      <img
                        src={posterFor(gig, index)}
                        alt=""
                        className={styles.gigsCardImage}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                        onLoad={onPosterLoad}
                      />
                    </Link>
                    <div className={styles.gigsCardBody}>
                      <p className={styles.gigsCardDate}>
                        {formatGigDate(gig.date)}
                      </p>
                      <Link
                        className={styles.gigsCardTitle}
                        to={`/gigs/${gig.slug}`}
                        draggable={false}
                      >
                        {gig.title}
                      </Link>
                      {gig.location ? (
                        <p className={styles.gigsCardMeta}>{gig.location}</p>
                      ) : null}
                      <Link
                        className={styles.gigsCardCta}
                        to={`/gigs/${gig.slug}`}
                        draggable={false}
                      >
                        {gig.linkLabel}
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>

        {gigs.length > 1 ? (
          <div className={styles.gigsDots} role="tablist" aria-label={label}>
            {gigs.map((gig, index) => (
              <button
                key={gig.slug}
                type="button"
                role="tab"
                aria-selected={selected === index}
                aria-label={`${index + 1} / ${gigs.length}`}
                className={
                  selected === index
                    ? `${styles.gigsDot} ${styles.gigsDotActive}`
                    : styles.gigsDot
                }
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        ) : null}

        {hint ? <p className={styles.gigsHint}>{hint}</p> : null}
      </div>
    </section>
  );
};
