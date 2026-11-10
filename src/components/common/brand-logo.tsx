import Image from "next/image";

interface BrandLogoProps {
  markOnly?: boolean;
}

export function BrandLogo({ markOnly = false }: BrandLogoProps) {
  return (
    <Image
      alt={markOnly ? "ZarPay" : "Logo ZarPay"}
      className="brand-logo"
      height={markOnly ? 194 : 262}
      unoptimized={markOnly}
      loading="eager"
      src={markOnly ? "/zarpay-symbol.png" : "/zarpay-logo.png"}
      width={270}
    />
  );
}
