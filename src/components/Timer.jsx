import React from "react";

const Timer = ({ bestTime, currentTime, onReset, showPopup, popupMessage }) => {
  return (
    <>
      <div className="fixed top-5 left-5">
        <button
          onClick={onReset}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>
      <div className="fixed top-5 right-5 text-white text-lg">
        <div>Best Time: {bestTime.toFixed(2)}s</div>
        <div>Current Time: {currentTime.toFixed(2)}s</div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg text-black">
            <h2 className="text-xl font-bold mb-4">Race Completed!</h2>
            <p>{popupMessage}</p>
            <button
              onClick={onReset}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Timer;
