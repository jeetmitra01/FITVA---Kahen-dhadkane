import { useState } from "react";
import styles from "./PromptForm.module.css";

export default function PromptForm({ onSubmit, isLoading }: { onSubmit: (prompt: string) => void, isLoading: boolean }) {
    const [prompt, setPrompt] = useState<string>("");

    return (
        <form
            className={styles.container}
            onSubmit={(e) => {
                e.preventDefault();

                if (prompt === "") {
                    return;
                }

                onSubmit(prompt);
                setPrompt("");
            }}
        >
            <span className={styles.heading}>Welcome Back!</span>
            <div className={styles.inputGroup}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Describe your meal or cravings..."
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);
                    }}
                />
                <button className={styles.submit} type="submit" disabled={isLoading}>
                    {isLoading && <span className={styles.spinner} aria-hidden />}
                    <span>{isLoading ? "Generating..." : "Submit"}</span>
                </button>
            </div>
        </form>
    );
}