import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import smoothscroll from 'smoothscroll-polyfill';
import { Props } from './types';
import SliderContext from '../SliderContext';
import reducer from './reducer';
import useDragScroll from './useDragScroll';

const SliderProvider: React.FC<Props> = (props) => {
  const {
    children,
    onSlide,
    slidesToShow = 3,
    slideOnSelect,
    useFreeScroll,
    scrollOffset = 0,
    autoPlay,
    autoplaySpeed = 2000,
    pauseOnHover = true,
    pause,
  } = props;

  const sliderTrackRef = useDragScroll({
    scrollYAxis: false,
  });

  const [scrollRatio, setScrollRatio] = useState(0);
  const [slideWidth, setSlideWidth] = useState<string | undefined>();
  const [isPaused, setIsPaused] = useState(false);

  const [sliderState, dispatchSliderState] = useReducer(reducer, {
    currentSlideIndex: 0,
    selectedSlideIndex: undefined,
    slides: [],
  });

  const prevScrollIndex = useRef<number | undefined>();
  const autoplayTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    smoothscroll.polyfill(); // enables scrollTo.behavior: 'smooth' on Safari
  }, []);


  const scrollToIndex = useCallback((incomingSlideIndex) => {
    const hasIndex = sliderState.slides[incomingSlideIndex];

    if (hasIndex && sliderTrackRef.current) {
      const targetSlide = sliderState.slides[incomingSlideIndex];
      if (targetSlide) {
        const { ref: { current: { offsetLeft } } } = targetSlide;

        sliderTrackRef.current.scrollTo({
          top: 0,
          left: (offsetLeft - scrollOffset),
          behavior: 'smooth',
        });
      }

      if (typeof onSlide === 'function') onSlide(incomingSlideIndex);
    }
  }, [
    sliderState.slides,
    sliderTrackRef,
    onSlide,
    scrollOffset,
  ]);

  useEffect(() => {
    const newSlideWidth = `${(slidesToShow > 1 ? 1 / slidesToShow : slidesToShow) * 100}%`;
    setSlideWidth(newSlideWidth);
  }, [
    slidesToShow,
  ]);

  // auto-scroll to target index only on changes to scrollIndex
  useEffect(() => {
    if (prevScrollIndex.current !== sliderState.scrollIndex) {
      scrollToIndex(sliderState.scrollIndex);
      prevScrollIndex.current = sliderState.scrollIndex;
    }
  }, [
    sliderState.scrollIndex,
    scrollToIndex,
  ]);

  const startAutoplay = useCallback(() => {
    const { current: timerID } = autoplayTimer;

    autoplayTimer.current = setInterval(() => {
      dispatchSliderState({
        type: 'GO_TO_NEXT_SLIDE',
        payload: {
          loop: true,
        },
      });
    }, autoplaySpeed);

    return () => {
      if (timerID) clearInterval(timerID);
    };
  }, [autoplaySpeed]);

  const stopAutoplay = useCallback(() => {
    const { current: autoPlayTimerID } = autoplayTimer;
    if (autoPlayTimerID) clearInterval(autoPlayTimerID);
  }, []);

  useEffect(() => {
    if (!isPaused && autoPlay) {
      startAutoplay();
    }

    if (isPaused || !autoPlay) {
      stopAutoplay();
    }

    return () => {
      stopAutoplay();
    };
  }, [
    isPaused,
    autoPlay,
    startAutoplay,
    stopAutoplay,
  ]);

  // let user control pause, if they need to
  useEffect(() => {
    if (typeof pause !== 'undefined') {
      setIsPaused(pause);
    }
  }, [pause]);

  const context = {
    sliderTrackRef,
    scrollRatio,
    ...sliderState,
    setScrollRatio,
    goToNextSlide: () => {
      dispatchSliderState({
        type: 'GO_TO_NEXT_SLIDE',
        payload: {
          loop: !useFreeScroll,
        },
      });
    },
    goToPrevSlide: () => {
      dispatchSliderState({
        type: 'GO_TO_PREV_SLIDE',
        payload: {
          loop: !useFreeScroll,
        },
      });
    },
    goToSlideIndex: () => {
      dispatchSliderState({
        type: 'GO_TO_NEXT_SLIDE',
      });
    },
    dispatchSlide: (slide) => {
      dispatchSliderState({
        type: 'UPDATE_SLIDE',
        payload: {
          slide,
        },
      });
    },
    slideWidth,
    slidesToShow,
    slideOnSelect,
    useFreeScroll,
    scrollOffset,
    setIsPaused,
    isPaused,
    pauseOnHover,
  };

  return (
    <SliderContext.Provider
      value={context}
    >
      {(children && (typeof children === 'function' ? children({ ...context }) : children))}
    </SliderContext.Provider>
  );
};

export default SliderProvider;
