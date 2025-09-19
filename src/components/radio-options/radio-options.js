import styles from "./radio-options.module.css";

export default function RadioOptions({ options, name }) {
    return (
        <div className={styles.options}>
            {options.map((option) => (
                <label key={option.value}>
                    <input type="radio" name={name} value={option.value} />
                    {option.label}
                </label>
            ))}
        </div>
    );
}
