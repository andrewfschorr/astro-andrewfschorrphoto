import React, { useCallback } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import type PhotoSwipe from "photoswipe";
import "photoswipe/style.css";
import "../styles/photoswipe-overrides.css";
import "../styles/masonry.css";

export type MasonryPhoto = {
  id: string;
  src: string;
  alt: string;
  title?: string;
};

export type MasonryGalleryProps = {
  photos: MasonryPhoto[];
  gap?: string;
  className?: string;
};

export default function MasonryGallery({
  photos,
  gap = "16px",
  className,
}: MasonryGalleryProps) {
  const options = {
    zoom: false,
    wheelToZoom: false,
    initialZoomLevel: "fit",
    secondaryZoomLevel: "fit",
    maxZoomLevel: "fit",

    imageClickAction: "toggle-controls",
    tapAction: "toggle-controls",
    doubleTapAction: "toggle-controls",
  } as const;

  const fixSlideDimensions = useCallback((slide: any) => {
    const content = slide?.content;
    if (!content || content.type !== "image" || !content.element) return;

    const img = content.element as HTMLImageElement;
    if (!img.naturalWidth || !img.naturalHeight) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    content.data.w = w;
    content.data.width = w;
    content.data.h = h;
    content.data.height = h;
    content.width = w;
    content.height = h;
    slide.width = w;
    slide.height = h;

    slide.calculateSize();
    slide.currentResolution = 0;
    slide.zoomAndPanToInitial();
    slide.applyCurrentZoomPan();
    slide.updateContentSize(true);
  }, []);

  const onBeforeOpen = useCallback(
    (pswp: PhotoSwipe) => {
      pswp.on("loadComplete", (e: any) => {
        fixSlideDimensions(e.slide);
      });

      pswp.on("slideActivate", (e: any) => {
        const slide = e.slide;
        const img = slide?.content?.element as HTMLImageElement | undefined;
        if (img?.complete && img.naturalWidth) {
          fixSlideDimensions(slide);
        }
      });
    },
    [fixSlideDimensions]
  );

  return (
    <Gallery options={options} onBeforeOpen={onBeforeOpen}>
      <ul
        className={["masonry", className].filter(Boolean).join(" ")}
        role="list"
        style={{ ["--gap" as any]: gap }}
      >
        {photos.map((photo) => (
          <li key={photo.id} className="masonry-item">
            <Item
              id={photo.id}
              original={photo.src}
              thumbnail={photo.src}
              width={1920}
              height={1080}
              caption={photo.title}
            >
              {({ ref, open }) => (
                <a
                  className="masonry-link"
                  href={photo.src}
                  onClick={(e) => {
                    e.preventDefault();
                    open(e);
                  }}
                  ref={ref as unknown as React.Ref<HTMLAnchorElement>}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "auto" }}
                  />
                </a>
              )}
            </Item>
          </li>
        ))}
      </ul>
    </Gallery>
  );
}
