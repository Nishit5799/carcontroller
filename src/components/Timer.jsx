import React from "react";

const Timer = ({
  bestTime,
  currentTime,
  onReset,
  showPopup,
  popupMessage,
  showInfoPopup,
  setShowInfoPopup,
  onInfoClick,
}) => {
  const infoMessage = `
    Navigate the car along the road and complete the course as quickly as possible. 
    If you move off the road, your car will reset to the starting position. 
    You can press the "Reset" button to restart the timer and return to the beginning.

    Controls:
    - Desktop: Use W, A, S, D for movement and SHIFT for a speed boost.
    - Mobile: Use the on-screen joystick for movement.
  `;

  return (
    <>
      <div className="fixed sm:top-5 sm:left-5 top-[9%] left-[2%]">
        <button
          onClick={onReset}
          className="bg-red-500 font-choco text-white px-4 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>
      <div className="fixed top-5 right-5 text-white font-choco bg-black rounded-lg flex justify-center flex-col items-center px-5 text-lg">
        <div>Best Time: {bestTime.toFixed(0)}s</div>
        <div>Current Time: {currentTime.toFixed(0)}s</div>
      </div>
      <div className="fixed sm:top-5 sm:left-1/2 right-[80%] top-[2.2%] transform -translate-x-1/2">
        <button
          onClick={onInfoClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-full"
        >
          i
        </button>
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
      {showInfoPopup && (
        <div className="fixed inset-0 flex items-center justify-center text-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white p-6 rounded-lg text-black max-w-md">
            <h2 className="text-xl font-bold mb-4">Game Information</h2>
            <p className="whitespace-pre-line">{infoMessage}</p>
            <button
              onClick={() => setShowInfoPopup(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Timer;
