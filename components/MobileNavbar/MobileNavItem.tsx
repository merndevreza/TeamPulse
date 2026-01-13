import Image from "next/image";
import Link from "next/link";

interface MobileNavItemProps {
  url: string;
  title: string;
  mobileTitle?: string | undefined;
  img: string;
  imgWidth: number;
  imgHeight: number;
}

const MobileNavItem = ({
  index,
  item,
}: {
  index: number;
  item: MobileNavItemProps;
}) => {
  const { url, title, mobileTitle, img, imgWidth, imgHeight } = item;
  return (
    <Link href={url} key={index} className="flex flex-col justify-center items-center">
      <Image src={img} width={imgWidth} height={imgHeight} alt={title} style={{ height: "auto" }} />
      <span className="text-[#F6F6F6] text-[13px] font-medium inline-block h-[17px] tracking-[-0.26px] font-geist text-center">
        {mobileTitle}
      </span>
    </Link>
  );
};

export default MobileNavItem;
