import React, { useCallback } from 'react';
import useSlider from '../useSlider';

export type Props = {
  id?: string,
  className?: string,
  htmlElement?: React.ElementType,
  htmlAttributes?: {
    [key: string]: unknown
  },
  children?: React.ReactNode,
  direction?: 'prev' | 'next',
};

const SliderButton: React.FC<Props> = (props) => {
  const {
    id,
    className,
    htmlElement = 'button',
    htmlAttributes = {},
    children,
    direction,
  } = props;

  const {
    goToPrevSlide,
    goToNextSlide,
    setIsPaused,
    pauseOnHover,
  } = useSlider();

  const handleClick = useCallback(() => {
    if (direction === 'prev') {
      goToPrevSlide();
    }
    if (direction === 'next') {
      goToNextSlide();
    }
  }, [
    direction,
    goToPrevSlide,
    goToNextSlide,
  ]);

  const Tag = htmlElement as React.ElementType;

  return (
    <Tag
      onClick={handleClick}
      type="button"
      id={id}
      className={className}
      {...htmlAttributes}
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsPaused(false);
      }}
    >
      {children && children}
    </Tag>
  );
};

export default SliderButton;
