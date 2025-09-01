import styles from "./main-slider.module.css";
import Slide from "./slide/slide";

import projectsData from "@/json/projects.json";

export default function MainSlider() {
    const scalingOffset = 15;

    for (var key in projectsData) {
        projectsData[key].id = key;
        projectsData[key].image = `/projects/${key}/main.png`;
        if (projectsData[key].disabled) delete projectsData[key];
    }

    const projectsDataArray = Object.values(projectsData);

    return (
        <div
            className={styles.slider}
            style={{
                top: `${
                    ((projectsDataArray.length - 1) * scalingOffset) / 2
                }vh`,
                right: `${
                    ((projectsDataArray.length - 1) * scalingOffset) / 2
                }vh`,
            }}
        >
            {projectsDataArray.map((slideData, index) => {
                return (
                    <Slide
                        key={slideData.id}
                        image={slideData.image}
                        title={slideData.id}
                        style={{
                            top: `${-index * scalingOffset}vh`,
                            right: `${-index * scalingOffset}vh`,
                            zIndex: projectsDataArray.length - index,
                            position: index === 0 ? "relative" : "absolute",
                        }}
                    />
                );
            })}
        </div>
    );
}
