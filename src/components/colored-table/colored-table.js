"use client";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ✅
import style from "./colored-table.module.css";
import React from "react";

export default function ColoredTable({ items, images, links }) {
    const tableRef = React.useRef(null);
    const router = useRouter(); // ✅

    const [imageIndexShown, setImageIndexShown] = React.useState(null);
    const [translate, setTranslate] = React.useState({ x: 0, y: 0 });

    const imageWidth = 312;
    const imageHeight = 208;

    function handleMouseEnter(index) {
        setImageIndexShown(index);
    }
    function handleMouseLeave() {
        setImageIndexShown(null);
    }
    function handleMouseMove(event) {
        const rect = tableRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left + 50;
        const y = event.clientY - rect.top - imageHeight / 2;
        setTranslate({ x, y });
    }

    return (
        <div
            className={style.container}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            ref={tableRef}
        >
            <table className={style.coloredTable}>
                <tbody className={style.desktopRows}>
                    {items.map((item, index) => (
                        <tr
                            key={index}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onClick={() => {
                                if (links && links.length > index) {
                                    router.push(links[index]);
                                }
                            }}
                            style={{
                                cursor:
                                    links && links.length > index
                                        ? "pointer"
                                        : "default",
                            }}
                        >
                            {item.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    dangerouslySetInnerHTML={{
                                        __html: cell,
                                    }}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tbody className={style.mobileRows}>
                    {items.map((item, index) => (
                        <tr
                            key={`mobile-${index}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onClick={() => {
                                if (links && links.length > index) {
                                    router.push(links[index]);
                                }
                            }}
                            style={{
                                cursor:
                                    links && links.length > index
                                        ? "pointer"
                                        : "default",
                            }}
                        >
                            <td>
                                {item
                                    .filter(
                                        (cell, cellIndex) =>
                                            cellIndex < item.length - 1
                                    )
                                    .map((cell, cellIndex) => (
                                        <p
                                            key={cellIndex}
                                            dangerouslySetInnerHTML={{
                                                __html: cell,
                                            }}
                                        />
                                    ))}
                            </td>
                            <td>{item[item.length - 1]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {imageIndexShown != null && images && images.length > 0 && (
                <div
                    className={`${style.imageContainer} onlyDesktop`}
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                    }}
                >
                    <Image
                        src={images[imageIndexShown]}
                        alt={`Image for ${items[imageIndexShown][0]}`}
                        width={imageWidth}
                        height={imageHeight}
                    />
                </div>
            )}
        </div>
    );
}
