import type { FC, ReactNode} from "react";
import { useEffect, useRef } from "react";
type InfiniteScrollProps = {
  className?: string;
  children: ReactNode;
  loadMore: () => void;
  loading: boolean;
};

const InfiniteScroll: FC<InfiniteScrollProps> = ({
  children,
  loading,
  loadMore,
  className,
}) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      const observer = new IntersectionObserver(
        ([entries]) => {
          if (entries?.isIntersecting) {
            loadMore();
          }
        },
        { threshold: 1 }
      );
      observer.observe(observerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [loadMore]);

  return (
    <div className={`w-full ${className && className}`}>
      {children}
      <div ref={observerRef}></div>
      {/* {loading && (
        <div className="loadmore flex justify-center py-5 lg:justify-start 2xl:justify-center ">
          <span className=" mr-1 2xl:h-1 2xl:w-1 rounded-full p-[5px] "></span>
          <span className=" mr-1 2xl:h-1 2xl:w-1 rounded-full p-[5px] "></span>
          <span className=" mr-1 2xl:h-1 2xl:w-1 rounded-full p-[5px] "></span>
          <span className=" mr-1 2xl:h-1 2xl:w-1 rounded-full p-[5px] "></span>
        </div>
      )} */}
    </div>
  );
};
export default InfiniteScroll;
