"use client";

import { useFormStatus } from "react-dom";
import GitButton from "../git-button/git-button";

export default function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <GitButton isSubmit={true} disabled={pending}>
            {pending ? "Sending..." : "Send"}
        </GitButton>
    );
}
