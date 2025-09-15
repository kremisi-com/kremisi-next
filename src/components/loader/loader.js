import style from "./loader.module.css";

export default function Loader({ percentage }) {
  return (
    <div className={style.bg}>
      <div className={style.line}>
        <div
          className={style.loadedLine}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
