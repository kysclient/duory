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

export function CommunityFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M7 4C5.067 4 3.5 5.567 3.5 7.5V15.5C3.5 17.433 5.067 19 7 19H9.75V22C9.75 22.276 9.97386 22.5 10.25 22.5C10.3826 22.5 10.5098 22.4473 10.6036 22.3536L13.9571 19H19C20.933 19 22.5 17.433 22.5 15.5V7.5C22.5 5.567 20.933 4 19 4H7Z"
        fill={color}
      />
    </svg>
  );
}

export function CommunityIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <path
        d="M7 4C5.067 4 3.5 5.567 3.5 7.5V15.5C3.5 17.433 5.067 19 7 19H9.75V22C9.75 22.276 9.97386 22.5 10.25 22.5C10.3826 22.5 10.5098 22.4473 10.6036 22.3536L13.9571 19H19C20.933 19 22.5 17.433 22.5 15.5V7.5C22.5 5.567 20.933 4 19 4H7Z"
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Profile 아이콘 - Threads 스타일 (둥근 심플 디자인)
export function ProfileFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      {/* 머리 - 완전히 채워진 원 */}
      <circle cx="13" cy="8.5" r="4.5" fill={color} />
      {/* 어깨/몸통 - 채워진 반원 형태 */}
      <path
        d="M 5 23 C 5 17.5 8.5 14.5 13 14.5 C 17.5 14.5 21 17.5 21 23 Z"
        fill={color}
      />
    </svg>
  );
}

export function ProfileIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      {/* 머리 */}
      <circle cx="13" cy="8.5" r="4.5" stroke={color} strokeWidth="2.5" fill="none" />
      {/* 어깨/몸통 */}
      <path
        d="M 5 23 C 5 17.5 8.5 14.5 13 14.5 C 17.5 14.5 21 17.5 21 23"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Memories 아이콘 - 둥근 편지 봉투 스타일 (Threads 메시지함 느낌)
export function MemoriesIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      {/* 둥근 편지 봉투 바디 */}
      <path
        d="M 4 8 C 4 6.5 5 5.5 6.5 5.5 L 19.5 5.5 C 21 5.5 22 6.5 22 8 L 22 18 C 22 19.5 21 20.5 19.5 20.5 L 6.5 20.5 C 5 20.5 4 19.5 4 18 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 편지 플랩 (부드러운 V자) */}
      <path
        d="M 4 8 Q 13 15 22 8"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MemoriesFilledIcon({ color = 'currentColor', size = DEFAULT_SIZE, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className}>
      <defs>
        <mask id="envelope-cutout-mask">
          <rect width="26" height="26" fill="white"/>
          {/* 플랩 부분을 검은색으로 그려서 마스크 아웃 (컷아웃) */}
          <path
            d="M 4 8 Q 13 15 22 8"
            stroke="black"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      {/* 채워진 봉투 (플랩 부분 컷아웃 적용) */}
      <path
        d="M 4 8 C 4 6.5 5 5.5 6.5 5.5 L 19.5 5.5 C 21 5.5 22 6.5 22 8 L 22 18 C 22 19.5 21 20.5 19.5 20.5 L 6.5 20.5 C 5 20.5 4 19.5 4 18 Z"
        fill={color}
        mask="url(#envelope-cutout-mask)"
      />
    </svg>
  );
}