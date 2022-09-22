import { useEffect } from 'react';

const useOnKeyPress = (key: string, action: CallableFunction) => {
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === key) action(e)
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);
}

export default useOnKeyPress;