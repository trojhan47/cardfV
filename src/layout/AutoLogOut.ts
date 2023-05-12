import { signOut } from "next-auth/react";
import { useEffect } from "react";

const events = [
  "load",
  "mousemove",
  "mousedown",
  "click",
  "scroll",
  "keypress",
];

const AutoLogout = ({ children }) => {
  let timer: string | number | NodeJS.Timeout | undefined;

  // this function sets the timer that logs out the user after 15 mins
  const handleLogoutTimer = () => {
    timer = setTimeout(() => {
      // clears any pending timer.
      resetTimer();
      // Listener clean up. Removes the existing event listener from the window
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });
      // logs out user
      logoutAction();
    }, 900000); // 15mins
  };

  // this resets the timer if it exists.
  const resetTimer = () => {
    if (timer) clearTimeout(timer);
  };

  // when component mounts, it adds an event listeners to the window
  // each time any of the event is triggered, i.e on mouse move, click, scroll, keypress etc, the timer to logout user after 15 mins of inactivity resets.
  // However, if none of the event is triggered within 15 mins, that is app is inactive, the app automatically logs out.
  useEffect(() => {
    Object.values(events).forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer();
        handleLogoutTimer();
      });
    });
  }, []);

  // logs out user by clearing out auth token in localStorage and redirecting url to /signin page.
  const logoutAction = () => {
    signOut({ callbackUrl: "/" }); // this is a next-auth function that logs out user
  };

  return children;
};

export default AutoLogout;
