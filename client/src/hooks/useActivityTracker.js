import {useEffect} from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const useActivityTracker = () => {
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    let timer;

    const updateLastActive = async () => {
      try {
        await Axios({
            ...SummaryApi.updateActivity,
        }
        )
      } catch (error) {
        console.error('Failed to update last active:', error);
      }
    };

    const handleActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(updateLastActive, 5000); // Debounce 5 seconds
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(timer);
    };
  }, []);
};

export default useActivityTracker;