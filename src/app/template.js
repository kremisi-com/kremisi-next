// app/template.js
import PageTransition from "@/components/page-transition/page-transition";

export default function Template({ children }) {
    return <PageTransition>{children}</PageTransition>;
}
