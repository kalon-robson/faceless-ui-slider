import React, { useCallback, useEffect, useRef } from 'react';
import useSlider from '../useSlider';

export type Props = {
  id?: string
  className?: string
  htmlElement?: React.ElementType
  htmlAttributes?: {
    [key: string]: unknown,
    style?: React.CSSProperties
  }
  children?: React.ReactNode
}

const SliderTrack: React.FC<Props> = (props) => {
  const {
    id,
    className,
    htmlElement = 'div',
    children,
    htmlAttributes = {},
  } = props;

  const {
    sliderTrackRef,
    setScrollRatio,
    slideWidth,
    slidesToShow,
    useFreeScroll,
    setIsPaused,
    pauseOnHover,
  } = useSlider();

  const hasAddedScrollListener = useRef(false);
  const animationFrameID = useRef<number | undefined>();

  const getScrollRatio = useCallback(() => {
    const track = sliderTrackRef.current;
    if (track) {
      const newScrollRatio = track.scrollLeft / (track.scrollWidth - track.clientWidth);
      setScrollRatio(newScrollRatio);
    }
  }, [
    sliderTrackRef,
    setScrollRatio,
  ]);

  const onScroll = useCallback(() => {
    const track = sliderTrackRef.current;

    if (track) {
      // prevent compounding events
      if (animationFrameID.current) cancelAnimationFrame(animationFrameID.current);
      const requestID = requestAnimationFrame(getScrollRatio);
      animationFrameID.current = requestID;
    }
  }, [
    sliderTrackRef,
    getScrollRatio,
  ]);

  useEffect(() => {
    const track = sliderTrackRef.current;

    if (track && hasAddedScrollListener.current === false) {
      track.addEventListener('scroll', onScroll, false);
      hasAddedScrollListener.current = true;
    }

    return () => {
      hasAddedScrollListener.current = false;
      if (track) {
        track.removeEventListener('scroll', onScroll);
      }
    };
  }, [
    sliderTrackRef,
    onScroll,
  ]);

  const Tag = htmlElement as React.ElementType;

  // TODO: use this to support scrolling the last slide fully into position (flush left)
  const renderGhostSlide = false; // slidesToShow > 1;

  return (
    <Tag
      {...{
        id,
        className,
        ...htmlAttributes,
        style: {
          position: 'relative',
          display: 'flex',
          overflowX: 'scroll', // 'overflow: touch' does not work when 'auto'
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: (slideWidth && !useFreeScroll) ? 'x mandatory' : undefined, // only apply after slide width has populated
          ...htmlAttributes.style,
        },
        ref: sliderTrackRef,
        onMouseEnter: () => {
          if (pauseOnHover) setIsPaused(true);
        },
        onMouseLeave: () => {
          if (pauseOnHover) setIsPaused(false);
        },
      }}
    >
      {children && children}
      {renderGhostSlide && (
        <div
          style={{
            flexShrink: 0,
            width: `calc(${slideWidth} * ${slidesToShow - 1})`,
          }}
        >
          &nbsp;
        </div>
      )}
    </Tag>
  );
};

export default SliderTrack;
