interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function HorebSaveLogo({
  className = "",
  width = 40,
  height = 40,
}: LogoProps) {
  return (
    <svg
      width="31"
      height="32"
      viewBox="0 0 31 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_129_1039)">
        <circle cx="15.0051" cy="16.0003" r="15.4163" fill="#2E90FA" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M22.2323 0.266797C22.9848 1.01935 22.9848 2.23948 22.2323 2.99203L7.6962 17.5281C6.94365 18.2806 5.72351 18.2806 4.97096 17.5281L-0.361503 12.1956C-1.11406 11.4431 -1.11406 10.2229 -0.361503 9.47039L14.1746 -5.06567C14.9271 -5.81822 16.1472 -5.81822 16.8998 -5.06567L22.2323 0.266797Z"
          fill="white"
          fill-opacity="0.5"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M29.391 20.7497C30.1435 21.5023 30.1435 22.7224 29.391 23.475L16.7357 36.1303C15.9831 36.8828 14.763 36.8828 14.0104 36.1303L7.49842 29.6182C6.74587 28.8657 6.74587 27.6455 7.49842 26.893L20.1537 14.2377C20.9063 13.4852 22.1264 13.4852 22.8789 14.2377L29.391 20.7497Z"
          fill="black"
          fill-opacity="0.3"
        />
      </g>
      <defs>
        <clipPath id="clip0_129_1039">
          <rect
            x="0.0495605"
            y="0.813965"
            width="30.3719"
            height="30.3719"
            rx="15.186"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

// Smaller version for header
export function HorebSaveLogoSmall({ className = "" }: { className?: string }) {
  return <HorebSaveLogo className={className} width={32} height={32} />;
}
