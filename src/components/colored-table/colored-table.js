"use client";
import Image from "next/image";
import Link from "next/link";
import style from "./colored-table.module.css";
import React from "react";

export default function ColoredTable({
    items,
    images,
    imageAlts = [],
    links,
    cellLinks = [],
    className,
}) {
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

    function renderCellContent(cell, rowIndex, cellIndex) {
        const cellLink = cellLinks[rowIndex]?.[cellIndex];

        if (cellLink?.href) {
            return (
                <a
                    className={style.cellLink}
                    href={cellLink.href}
                    target={cellLink.target}
                    rel={cellLink.rel}
                    aria-label={cellLink.ariaLabel}
                    dangerouslySetInnerHTML={{ __html: cell }}
                />
            );
        }

        return <span dangerouslySetInnerHTML={{ __html: cell }} />;
    }

    function renderDesktopCells(item, rowIndex) {
        return (
            <div
                className={style.desktopCells}
                style={{ "--column-count": item.length }}
            >
                {item.map((cell, cellIndex) => (
                    <div key={cellIndex} className={style.cell}>
                        {renderCellContent(cell, rowIndex, cellIndex)}
                    </div>
                ))}
            </div>
        );
    }

    function renderMobileCells(item, rowIndex) {
        return (
            <div className={style.mobileCells}>
                <div className={style.mobileMainCell}>
                    {item
                        .filter((cell, cellIndex) => cellIndex < item.length - 1)
                        .map((cell, cellIndex) => (
                            <p key={cellIndex}>
                                {renderCellContent(cell, rowIndex, cellIndex)}
                            </p>
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
            className={`${style.container} ${className || ""}`}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            ref={tableRef}
        >
            <div className={style.rowList}>
                {items.map((item, index) => {
                    const href = links?.[index];
                    const rowContent = (
                        <>
                            {renderDesktopCells(item, index)}
                            {renderMobileCells(item, index)}
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
                            <div key={index} {...rowProps}>
                                <Link
                                    className={style.rowLink}
                                    href={href}
                                    aria-label={item[0].replace(/<[^>]*>/g, "")}
                                />
                                {rowContent}
                            </div>
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
                        key={images[imageIndexShown]}
                        src={images[imageIndexShown]}
                        alt={
                            imageAlts[imageIndexShown] ||
                            `Image for ${items[imageIndexShown][0]}`
                        }
                        width={imageWidth}
                        height={imageHeight}
                        loading="eager"
                        unoptimized
                    />
                </div>
            )}
        </div>
    );
}
