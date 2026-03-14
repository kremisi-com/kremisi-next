export const metadata = {
    title: "Not Found",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <main className="page-content">
            <h2>404 - Not Found</h2>
            <p>The project you are looking for does not exist.</p>
        </main>
    );
}
