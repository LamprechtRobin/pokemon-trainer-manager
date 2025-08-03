import React from 'react';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  className = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label} ({value}{unit})
      </label>
      <div className="slider-container relative">
        {/* Progress bar */}
        <div 
          className="slider-progress"
          style={{ width: `${percentage}%` }}
        />
        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider w-full relative z-10"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default RangeSlider;