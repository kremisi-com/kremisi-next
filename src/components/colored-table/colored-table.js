"use client";
import Image from "next/image";
import Link from "next/link";
import style from "./colored-table.module.css";
import React from "react";

export default function ColoredTable({ items, images, imageAlts = [], links }) {
    const tableRef = React.useRef(null);

    const [imageIndexShown, setImageIndexShown] = React.useState(null);
    const [translate, setTranslate] = React.useState({ x: 0, y: 0 });

    const imageWidth = 312;
    const imageHeight = 208;

    function handleMouseEnter(index, event) {
        setImageIndexShown(index);

        if (!event?.currentTarget || !tableRef.current) return;

        const containerRect = tableRef.current.getBoundingClientRect();
        const rowRect = event.currentTarget.getBoundingClientRect();
        const x = rowRect.right - containerRect.left - imageWidth / 3;
        const y =
            rowRect.top - containerRect.top + rowRect.height / 2 - imageHeight / 2;

        setTranslate({ x, y });
    }
    function handleMouseLeave() {
        setImageIndexShown(null);
    }
    function handleBlur(event) {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setImageIndexShown(null);
    }
    function handleMouseMove(event) {
        const rect = tableRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left + 50;
        const y = event.clientY - rect.top - imageHeight / 2;
        setTranslate({ x, y });
    }

    function renderDesktopCells(item) {
        return (
            <div
                className={style.desktopCells}
                style={{ "--column-count": item.length }}
            >
                {item.map((cell, cellIndex) => (
                    <div
                        key={cellIndex}
                        className={style.cell}
                        dangerouslySetInnerHTML={{
                            __html: cell,
                        }}
                    />
                ))}
            </div>
        );
    }

    function renderMobileCells(item) {
        return (
            <div className={style.mobileCells}>
                <div className={style.mobileMainCell}>
                    {item
                        .filter((cell, cellIndex) => cellIndex < item.length - 1)
                        .map((cell, cellIndex) => (
                            <p
                                key={cellIndex}
                                dangerouslySetInnerHTML={{
                                    __html: cell,
                                }}
                            />
                        ))}
                </div>
                <div className={`${style.cell} ${style.mobileYearCell}`}>
                    {item[item.length - 1]}
                </div>
            </div>
        );
    }

    return (
        <div
            className={style.container}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            ref={tableRef}
        >
            <div className={style.rowList}>
                {items.map((item, index) => {
                    const href = links?.[index];
                    const rowContent = (
                        <>
                            {renderDesktopCells(item)}
                            {renderMobileCells(item)}
                        </>
                    );
                    const rowProps = {
                        className: `${style.row} ${href ? style.linkRow : ""}`,
                        onMouseEnter: (event) => handleMouseEnter(index, event),
                        onFocus: (event) => handleMouseEnter(index, event),
                        onBlur: handleBlur,
                    };

                    if (href) {
                        return (
                            <Link key={index} href={href} {...rowProps}>
                                {rowContent}
                            </Link>
                        );
                    }

                    return (
                        <div key={index} {...rowProps}>
                            {rowContent}
                        </div>
                    );
                })}
            </div>
            {imageIndexShown != null && images && images.length > 0 && (
                <div
                    className={`${style.imageContainer} onlyDesktop`}
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                    }}
                >
                    <Image
                        src={images[imageIndexShown]}
                        alt={
                            imageAlts[imageIndexShown] ||
                            `Image for ${items[imageIndexShown][0]}`
                        }
                        width={imageWidth}
                        height={imageHeight}
                    />
                </div>
            )}
        </div>
    );
}
