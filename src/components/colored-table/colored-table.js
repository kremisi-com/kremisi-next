"use client";
import Image from "next/image";
import style from "./colored-table.module.css";
import React from "react";

export default function ColoredTable({ items, images }) {
    const [imageIndexShown, setImageIndexShown] = React.useState(null);
    const [translate, setTranslate] = React.useState({ x: 0, y: 0 });

    const imageWidth = 312;
    const imageHeight = 208;

    function handleMouseEnter(index) {
        setImageIndexShown(index);
    }
    function handleMouseLeave(index) {
        setImageIndexShown(null);
    }
    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left + 50;
        const y = event.clientY - rect.top - imageHeight;
        setTranslate({ x: x, y: y });
    }
    return (
        <div
            style={{ position: "relative" }}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <table className={style.coloredTable}>
                <tbody>
                    {items.map((item, index) => (
                        <tr
                            key={index}
                            onMouseEnter={handleMouseEnter.bind(this, index)}
                        >
                            {item.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    dangerouslySetInnerHTML={{ __html: cell }}
                                ></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {imageIndexShown != null && images && images.length > 0 && (
                <div
                    className={style.imageContainer}
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
