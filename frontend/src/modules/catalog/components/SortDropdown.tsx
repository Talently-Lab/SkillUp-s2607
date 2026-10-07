import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { sortOptions, type SortOption } from "../constants/filters";
import ChevronDownIcon from "../../../assets/icons/chevron-down.svg";
import "./SortDropdown.css";

type SortDropdownProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

/**
 * Custom listbox instead of a native <select>: on mobile the native picker
 * opens wherever the browser decides, detached from the toolbar.
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = sortOptions.findIndex((o) => o.value === value);
  const selected = sortOptions[selectedIndex];

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const select = (index: number) => {
    onChange(sortOptions[index].value);
    close();
  };

  const onButtonKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = sortOptions.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i === last ? 0 : i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i === 0 ? last : i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="sort-dropdown">
      <span id="sort-label" className="visually-hidden">
        Ordenar por
      </span>
      <button
        ref={buttonRef}
        type="button"
        className="sort-dropdown__button"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="sort-label sort-value"
      >
        <span id="sort-value">{selected.label}</span>
        <img
          className={
            isOpen
              ? "sort-dropdown__chevron sort-dropdown__chevron--open"
              : "sort-dropdown__chevron"
          }
          src={ChevronDownIcon}
          alt=""
        />
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          className="sort-dropdown__list"
          role="listbox"
          tabIndex={-1}
          aria-labelledby="sort-label"
          aria-activedescendant={`sort-option-${sortOptions[activeIndex].value}`}
          onKeyDown={onListKeyDown}
        >
          {sortOptions.map((option, index) => {
            const isSelected = option.value === value;
            let className = "sort-dropdown__option";
            if (index === activeIndex) className += " sort-dropdown__option--active";
            if (isSelected) className += " sort-dropdown__option--selected";
            return (
              <li
                key={option.value}
                id={`sort-option-${option.value}`}
                className={className}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(index)}
                onPointerEnter={() => setActiveIndex(index)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
