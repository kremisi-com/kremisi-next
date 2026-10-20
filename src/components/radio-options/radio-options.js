"use client";
import styles from "./radio-options.module.css";
import React, { useState, useImperativeHandle, forwardRef } from "react";

const RadioOptions = forwardRef(function RadioOptions(
    { options, name, required = false, defaultValue = null, onChange },
    ref,
) {
    const [selectedOption, setSelectedOption] = useState(defaultValue);

    const onOptionChange = (e) => {
        setSelectedOption(e.target.value);
        onChange?.(e.target.value);
    };

    // Espongo le funzioni al padre
    useImperativeHandle(ref, () => ({
        reset: () => {
            setSelectedOption(defaultValue);
            onChange?.(defaultValue);
        },
        getValue: () => selectedOption,
    }));

    return (
        <div className={styles.options}>
            {options.map((option, index) => (
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
                        required={required && index === 0}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
});

export default RadioOptions;
