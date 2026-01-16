export type IconProps = {
  color?: string;
  size?: number;
  className?: string;
};

const DEFAULT_SIZE = 26;

export function HomeFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H8.25C8.52614 22.7497 8.75 22.5259 8.75 22.2497V17.6822V17.4997C8.75 15.1525 10.6528 13.2497 13 13.2497C15.3472 13.2497 17.25 15.1525 17.25 17.4997V17.6822V22.2497C17.25 22.5259 17.4739 22.7497 17.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94815 21.8954 8.99883L16.1454 4.3454C14.3112 2.86095 11.6888 2.86095 9.85455 4.3454L4.10455 8.99883C2.93153 9.94815 2.25 11.3765 2.25 12.8855Z"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2.5}
      />
    </svg>
  );
}

export function HomeIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H9.25C9.52614 22.7497 9.75 22.5258 9.75 22.2497V17.6822V16.4997C9.75 14.7048 11.2051 13.2497 13 13.2497C14.7949 13.2497 16.25 14.7048 16.25 16.4997V17.6822V22.2497C16.25 22.5258 16.4739 22.7497 16.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94814 21.8954 8.99882L16.1454 4.34539C14.3112 2.86094 11.6888 2.86094 9.85455 4.34539L4.10455 8.99882C2.93153 9.94814 2.25 11.3765 2.25 12.8855Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2.5}
      />
    </svg>
  );
}

export function SearchFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        clipRule="evenodd"
        d="M3.5 11.5C3.5 7.08172 7.08172 3.5 11.5 3.5C15.9183 3.5 19.5 7.08172 19.5 11.5C19.5 15.9183 15.9183 19.5 11.5 19.5C7.08172 19.5 3.5 15.9183 3.5 11.5ZM11.5 1C5.70101 1 1 5.70101 1 11.5C1 17.299 5.70101 22 11.5 22C13.949 22 16.2023 21.1615 17.9883 19.756L22.3661 24.1339C22.8543 24.622 23.6457 24.622 24.1339 24.1339C24.622 23.6457 24.622 22.8543 24.1339 22.3661L19.756 17.9883C21.1615 16.2023 22 13.949 22 11.5C22 5.70101 17.299 1 11.5 1Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

export function SearchIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        clipRule="evenodd"
        d="M3.5 11.5C3.5 7.08172 7.08172 3.5 11.5 3.5C15.9183 3.5 19.5 7.08172 19.5 11.5C19.5 15.9183 15.9183 19.5 11.5 19.5C7.08172 19.5 3.5 15.9183 3.5 11.5ZM11.5 1C5.70101 1 1 5.70101 1 11.5C1 17.299 5.70101 22 11.5 22C13.949 22 16.2023 21.1615 17.9883 19.756L22.3661 24.1339C22.8543 24.622 23.6457 24.622 24.1339 24.1339C24.622 23.6457 24.622 22.8543 24.1339 22.3661L19.756 17.9883C21.1615 16.2023 22 13.949 22 11.5C22 5.70101 17.299 1 11.5 1Z"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
      />
    </svg>
  );
}

export function HeartFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M2.5 9.85683C2.5 14.224 6.22178 18.5299 12.0332 22.2032C12.3554 22.397 12.7401 22.5909 13 22.5909C13.2703 22.5909 13.655 22.397 13.9668 22.2032C19.7782 18.5299 23.5 14.224 23.5 9.85683C23.5 6.11212 20.8698 3.5 17.4599 3.5C15.4847 3.5 13.9356 4.39792 13 5.74479C12.0851 4.40812 10.5257 3.5 8.5401 3.5C5.14059 3.5 2.5 6.11212 2.5 9.85683Z"
        fill={color}
      />
    </svg>
  );
}

export function HeartIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M2.5 9.85683C2.5 14.224 6.22178 18.5299 12.0332 22.2032C12.3554 22.397 12.7401 22.5909 13 22.5909C13.2703 22.5909 13.655 22.397 13.9668 22.2032C19.7782 18.5299 23.5 14.224 23.5 9.85683C23.5 6.11212 20.8698 3.5 17.4599 3.5C15.4847 3.5 13.9356 4.39792 13 5.74479C12.0851 4.40812 10.5257 3.5 8.5401 3.5C5.14059 3.5 2.5 6.11212 2.5 9.85683Z"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
      />
    </svg>
  );
}

export function ProfileFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <circle cx="13" cy="7.25" r="4" stroke={color} strokeWidth={2.5} />
      <path
        d="M6.26678 23.75H19.744C21.603 23.75 22.5 23.2186 22.5 22.0673C22.5 19.3712 18.8038 15.75 13 15.75C7.19625 15.75 3.5 19.3712 3.5 22.0673C3.5 23.2186 4.39704 23.75 6.26678 23.75Z"
        fill={color}
      />
    </svg>
  );
}

export function ProfileIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <circle cx="13" cy="7.25" r="4" stroke={color} strokeWidth={2.5} />
      <path
        d="M6.26678 23.75H19.744C21.603 23.75 22.5 23.2186 22.5 22.0673C22.5 19.3712 18.8038 15.75 13 15.75C7.19625 15.75 3.5 19.3712 3.5 22.0673C3.5 23.2186 4.39704 23.75 6.26678 23.75Z"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
      />
    </svg>
  );
}
