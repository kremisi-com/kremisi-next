export default function ProjectPage({ params }) {
    const { id } = params;

    return (
        <div>
            <h1>Project: {id}</h1>
        </div>
    );
}
