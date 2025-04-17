import React from 'react';

const ProgressBar = ({ totalDays, currentDay }) => {
  const progress = currentDay ? (currentDay / totalDays) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;