import useWindowWidth from './useWindowWidth';

/**
 * A hook that returns whether the current viewport is desktop-sized (>= 1445px)
 * @returns true if window width is >= 1445px, false otherwise
 */
const useIsDesktop = (): boolean => {
  const windowWidth = useWindowWidth();
  return windowWidth >= 1445;
};

export default useIsDesktop;
