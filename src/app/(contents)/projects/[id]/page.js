import { getProjectData } from "@/lib/projects";
import Image from "next/image";
import { notFound } from "next/navigation";
import style from "./page.module.css";
import GitButton from "@/components/git-button/git-button";
import Link from "next/link";

export async function generateStaticParams() {
    let projects = Object.keys((await import("@/lib/projects.json")).default);

    projects = projects.filter((id) => !getProjectData(id)?.disabled);

    return projects.map((id) => ({
        id,
    }));
}

export default async function ProjectPage({ params }) {
    params = await params;
    const id = await params.id;

    const projectData = getProjectData(id);

    if (!projectData) notFound();

    return (
        <>
            <div className={style.header}>
                <Image
                    src={`/projects/${id}/${projectData.headerImage}`}
                    alt={projectData.title}
                    fill
                />
                <h1 dangerouslySetInnerHTML={{ __html: projectData.slogan }} />
                <p className={style.disclaimer}>
                    All rights to the images are retained by the respective
                    owner
                </p>
            </div>
            <div className={`${style.overview}`}>
                <div className="row">
                    <div className="col mb-0">
                        <div className={style.client}>
                            <div className={style.clientName}>
                                Client: {projectData.title}
                            </div>
                        </div>
                    </div>
                    <div className="col mb-0">
                        <div className={style.client}>
                            <div className={style.clientYear}>
                                Year: {projectData.year}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-3">
                        <h3>Project Overview</h3>
                        <Link
                            className={style.link}
                            href={projectData.link}
                            target="_blank"
                        >
                            <GitButton text="Live Demo" />
                        </Link>
                    </div>
                    <div className="col-2-3">
                        <p
                            dangerouslySetInnerHTML={{
                                __html: projectData.description,
                            }}
                        ></p>
                        <div className={style.tags}>
                            {projectData.tasks.map((tag, index) => (
                                <div key={index} className="tag">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className={style.carousel}>
                {projectData.carousel.map((video, index) => (
                    <div key={index} className={style.carouselItem}>
                        <video autoPlay loop muted playsInline>
                            <source
                                src={`/projects/${id}/carousel/${video}`}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ))}
            </div>
            <div className={style.moreProjects}>
                <Link className={style.link} href={"/projects"}>
                    <GitButton text="More Projects" revertColor={true} />
                </Link>
            </div>
            <div className={style.nextProject}>
                <Image
                    src={`/projects/${projectData.nextProject?.id}/${projectData.nextProject?.headerImage}`}
                    alt={projectData.nextProject?.title}
                    fill
                />
                <h4>Next Project</h4>
                <h1
                    dangerouslySetInnerHTML={{
                        __html: projectData.nextProject?.slogan,
                    }}
                />
                <Link
                    className={style.link}
                    href={`/projects/${projectData.nextProject?.id}`}
                >
                    <GitButton text="Next Project" leftShift={-20} />
                </Link>
            </div>
        </>
    );
}
