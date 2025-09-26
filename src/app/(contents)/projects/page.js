import ColoredTable from "@/components/colored-table/colored-table";

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
        let tmpImage = `/projects/${project.id}/${project.image}`;

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

    return (
        <main className="page-content-simple">
            <ColoredTable items={items} images={images} links={links} />
        </main>
    );
}
