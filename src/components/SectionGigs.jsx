import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import styles from "../styles.module.scss";

const PANEL_IMAGE = "/img/DSCF4120-2.jpg";
const CITY_POSTER = "/img/brataniya-tour-poster.jpg";

const formatGigLine = (date, title) => {
  if (!date || date === "TBA") return `TBA  ${title}`;
  const short = date.replace(/\.20\d{2}$/, ".");
  return `${short}  ${title}`;
};

export const SectionGigs = ({ label, gigs = [], hint }) => {
  const tourTitle = gigs[0]?.type ?? "";
  const tourNote = gigs[0]?.typeNote ?? "";
  const panelImage = gigs.find((g) => g.image)?.image ?? PANEL_IMAGE;
  const cityPoster = gigs[0]?.image || CITY_POSTER;

  const [cityRef, cityApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    loop: gigs.length > 1,
    duration: 25,
  });
  const [citySelected, setCitySelected] = useState(0);

  const onCitySelect = useCallback((api) => {
    setCitySelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!cityApi) return undefined;

    onCitySelect(cityApi);
    cityApi.on("reInit", onCitySelect);
    cityApi.on("select", onCitySelect);

    return () => {
      cityApi.off("reInit", onCitySelect);
      cityApi.off("select", onCitySelect);
    };
  }, [cityApi, onCitySelect]);

  const scrollCityTo = useCallback(
    (index) => {
      cityApi?.scrollTo(index);
    },
    [cityApi]
  );

  const onPosterLoad = useCallback(() => {
    cityApi?.reInit();
  }, [cityApi]);

  return (
    <section
      id="gigs"
      className={styles.section}
      data-section="gigs"
      data-theme="orange"
    >
      <div className={styles.sectionInner}>
        <div className={styles.sectionTop}>
          <span className={styles.sectionSquare} aria-hidden="true" />
          <h2 className={styles.sectionLabel}>
            {label}
          </h2>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.gigsSplit}>
            <div className={styles.gigsPanel}>
              <div className={styles.gigsPanelMedia} aria-hidden="true">
                <img
                  src={panelImage}
                  alt=""
                  className={styles.gigsPanelImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.gigsPanelContent}>
                {tourTitle ? (
                  <h3 className={styles.gigsPanelTitle}>
                    <span className={styles.gigsTourBadge}>{tourTitle}</span>
                    {tourNote ? (
                      <span className={styles.gigsTourNoteBadge}>
                        ({tourNote})
                      </span>
                    ) : null}
                  </h3>
                ) : null}
                <ul className={styles.gigsList} role="list">
                  {gigs.map(({ slug, title, date }) => (
                    <li key={slug} className={styles.gigsItem}>
                      <Link
                        className={styles.gigsItemLink}
                        to={`/gigs/${slug}`}
                      >
                        {formatGigLine(date, title)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={styles.gigsTba}>{"& TBA"}</p>
                {hint ? <p className={styles.gigsHint}>{hint}</p> : null}
              </div>
            </div>

            {gigs.length > 0 ? (
              <>
                <div className={styles.gigsCitySlider}>
                  <div className={styles.gigsCityViewport} ref={cityRef}>
                    <div className={styles.gigsCityTrack}>
                      {gigs.map((gig, index) => (
                        <div className={styles.gigsCitySlide} key={gig.slug}>
                          <Link
                            className={styles.gigsCityCard}
                            to={`/gigs/${gig.slug}`}
                            draggable={false}
                          >
                            <img
                              src={cityPoster}
                              alt=""
                              className={styles.gigsCityImage}
                              loading={index === 0 ? "eager" : "lazy"}
                              decoding="async"
                              draggable={false}
                              onLoad={onPosterLoad}
                            />
                            <span className={styles.gigsCityName}>
                              {gig.title}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {gigs.length > 1 ? (
                  <div
                    className={styles.gigsCityDots}
                    role="tablist"
                    aria-label={label}
                  >
                    {gigs.map((gig, index) => (
                      <button
                        key={gig.slug}
                        type="button"
                        role="tab"
                        aria-selected={citySelected === index}
                        aria-label={`${gig.title}, ${index + 1} / ${gigs.length}`}
                        className={
                          citySelected === index
                            ? `${styles.gigsCityDot} ${styles.gigsCityDotActive}`
                            : styles.gigsCityDot
                        }
                        onClick={() => scrollCityTo(index)}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
