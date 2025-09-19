"use client";
import styles from "./radio-options.module.css";
import React from "react";

export default function RadioOptions({ options, name }) {
    const [selectedOption, setSelectedOption] = React.useState(null);

    const onOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div className={styles.options}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className={
                        selectedOption === option.value
                            ? styles.optionSelected
                            : ""
                    }
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={selectedOption === option.value}
                        onChange={onOptionChange}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
}
