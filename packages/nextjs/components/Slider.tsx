import React, { useState } from "react";

export const Slider = ({ min = 0, max = 10, step = 1, initialValue = 2, onValueChange, children }: any) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue); // Call the callback with the new value
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      {children}
    </div>
  );
};
