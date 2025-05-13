import React from "react";

interface CheckmarkIconProps {
  state: "selected" | "hovered";
}

const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ state }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13L9 17L19 7"
        stroke={state === "selected" ? "currentColor" : "#666666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckmarkIcon;