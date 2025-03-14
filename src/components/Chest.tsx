"use client";
import React from "react";

interface ChestProps {
  chestId: number;
  isSelected: boolean;
  onSelect: (chestId: number) => void;
  isDisabled: boolean;
  isSpinning: boolean; // Aggiunto
}

const Chest: React.FC<ChestProps> = ({ chestId, isSelected, onSelect, isDisabled, isSpinning }) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(chestId);
    }
  };

  return (
    <div
      className={`chest ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""} ${isSpinning ? "spinning" : ""}`}
      onClick={handleClick}
      style={{
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "5px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          textShadow: "0 0 3px #000",
        }}
      >
        {chestId + 1}
      </span>
      <img src="/images/chest.png" alt={`Chest ${chestId + 1}`} />
    </div>
  );
};

export default Chest;