import { BrandAd } from "@/components/studio/BrandAd";
import { usePageTitle } from "@/components/studio/parts";

/** A page that is just the ad, easy to share or screen-record. */
const Ad = () => {
  usePageTitle("Watch");
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <BrandAd />
    </div>
  );
};

export default Ad;
