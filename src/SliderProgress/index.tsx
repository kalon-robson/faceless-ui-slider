import React, {
  useEffect,
  useState,
} from 'react';
import { Props } from './types';
import useSlider from '../useSlider';

const SliderProgress: React.FC<Props> = (props) => {
  const {
    htmlElement = 'div',
    htmlAttributes = {},
    id,
    className,
    indicator: {
      htmlElement: indicatorHTMLElement = 'div',
      htmlAttributes: indicatorHTMLAttributes = {},
      id: indicatorID,
      className: indicatorClassName,
    } = {},
    indicatorType = 'position',
  } = props;

  const [segmentStyle, setSegmentStyle] = useState({
    width: '',
    left: '',
  });

  const {
    scrollRatio,
    slides,
    slidesToShow,
  } = useSlider();

  const Tag = htmlElement as React.ElementType;
  const IndicatorTag = indicatorHTMLElement as React.ElementType;

  useEffect(() => {
    const newSegmentStyle = {
      width: '',
      left: '',
    };


    const segmentWidth = (1 / slides.length) / (1 / slidesToShow);

    if (indicatorType === 'position') {
      newSegmentStyle.width = `${segmentWidth * 100}%`;
      newSegmentStyle.left = `${(scrollRatio - (scrollRatio * segmentWidth)) * 100}%`;
    }

    if (indicatorType === 'width') {
      newSegmentStyle.width = `${scrollRatio * 100}%`;
      newSegmentStyle.left = '0px';
    }

    setSegmentStyle(newSegmentStyle);
  }, [
    slides.length,
    indicatorType,
    scrollRatio,
    slidesToShow,
  ]);

  return (
    <Tag
      id={id}
      className={className}
      {...htmlAttributes}
      style={{
        position: 'relative',
        ...htmlAttributes.style || {},
      }}
    >
      <IndicatorTag
        id={indicatorID}
        className={indicatorClassName}
        {...indicatorHTMLAttributes}
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          ...segmentStyle,
          ...indicatorHTMLAttributes.style || {},
        }}
      />
    </Tag>
  );
};

export default SliderProgress;
