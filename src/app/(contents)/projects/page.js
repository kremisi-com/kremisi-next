import ColoredTable from "@/components/colored-table/colored-table";
// import styles from "./page.module.css";

import { getProjectsArray } from "@/lib/projects";
import { useMemo } from "react";

export const metadata = {
    title: "Projects - Kremisi",
    description:
        "Explore Kremisi's portfolio of web and app development projects.",
};

export default function ProjectsPage() {
    const items = [];
    const images = [];
    const links = [];

    const projectsDataArray = useMemo(() => getProjectsArray(), []);

    projectsDataArray.forEach((project) => {
        let tmpImage = "";
        if (project.images && project.images.length > 0) {
            tmpImage = `/projects/${project.id}/${project.images[0]}`;
        } else {
            tmpImage = `/projects/${project.id}/main.png`;
        }

        let tmpCustomer = project.customer;
        if (tmpCustomer === undefined || tmpCustomer === "")
            tmpCustomer = "Freelance";
        else
            tmpCustomer =
                "Freelance with " +
                project.customer
                    .split("")
                    .map((ch, i, arr) =>
                        i === 0 || arr[i - 1] === " " || arr[i - 1] === "-"
                            ? ch.toUpperCase()
                            : ch
                    )
                    .join("");
        items.push([
            project.title,
            project.subtitle,
            tmpCustomer,
            project.year,
        ]);
        images.push(tmpImage);
        links.push(project.link);
    });

    console.log(items, images, links);
    return (
        <main className="page-content">
            <ColoredTable items={items} images={images} links={links} />
        </main>
    );
}
